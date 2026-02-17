import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

const DEFAULT_HOURLY_RATE = 150;
const DEFAULT_NET_TERMS_DAYS = 30;

const generateInvoiceFromTimeSchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must use YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must use YYYY-MM-DD format')
    .optional(),
  rateCardId: z.string().uuid('rateCardId must be a valid UUID').optional(),
});

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

function generateInvoiceNumber() {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `INV-${year}-${suffix}`;
}

/**
 * G5: Auto-generate invoice drafts from billable time entries.
 * POST body: { projectId, startDate?, endDate?, rateCardId? }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = generateInvoiceFromTimeSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { projectId, startDate, endDate, rateCardId } = parsedBody.data;

  if (startDate && endDate && startDate > endDate) {
    return badRequest('startDate must be earlier than or equal to endDate');
  }

  try {
    let timeQuery = supabase
      .from('time_entries')
      .select('id, user_id, hours, hourly_rate')
      .eq('project_id', projectId)
      .eq('billable', true)
      .is('invoice_id', null)
      .eq('org_id', membership.organization_id);

    if (startDate) timeQuery = timeQuery.gte('date', startDate);
    if (endDate) timeQuery = timeQuery.lte('date', endDate);

    const { data: timeEntries, error: timeError } = await timeQuery;

    if (timeError) {
      return supabaseError(timeError);
    }

    if (!timeEntries || timeEntries.length === 0) {
      return apiSuccess({
        id: null,
        lineItems: [],
        total: 0,
        timeEntriesCount: 0,
        message: 'No uninvoiced billable time entries found',
      });
    }

    let rateMap: Record<string, number> = {};
    if (rateCardId) {
      const { data: rateCard, error: rateCardError } = await supabase
        .from('rate_cards')
        .select('id')
        .eq('id', rateCardId)
        .eq('organization_id', membership.organization_id)
        .maybeSingle();

      if (rateCardError) {
        return supabaseError(rateCardError);
      }

      if (!rateCard) {
        return badRequest('rateCardId is not accessible in the current organization context');
      }

      const { data: rateItems, error: rateItemsError } = await supabase
        .from('rate_card_items')
        .select('item_code, regular_rate')
        .eq('rate_card_id', rateCardId);

      if (rateItemsError) {
        return supabaseError(rateItemsError);
      }

      if (rateItems) {
        rateMap = Object.fromEntries(
          rateItems.flatMap((item) => {
            if (!item.item_code || item.regular_rate === null) {
              return [];
            }

            return [[item.item_code, Number(item.regular_rate)] as const];
          })
        );
      }
    }

    const grouped = new Map<string, { hours: number; rate: number; description: string }>();
    for (const entry of timeEntries) {
      const role = entry.user_id || 'general';
      const hours = Number(entry.hours || 0);
      const rate = rateMap[role] || Number(entry.hourly_rate || 0) || DEFAULT_HOURLY_RATE;

      if (grouped.has(role)) {
        const existing = grouped.get(role)!;
        existing.hours += hours;
      } else {
        grouped.set(role, { hours, rate, description: `${role} — billable hours` });
      }
    }

    const lineItems = Array.from(grouped.entries()).map(([_role, item]) => ({
      description: item.description,
      quantity: Math.round(item.hours * 100) / 100,
      unit_price: item.rate,
      amount: Math.round(item.hours * item.rate * 100) / 100,
    }));

    const total = lineItems.reduce((sum, li) => sum + li.amount, 0);

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + DEFAULT_NET_TERMS_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const invoicePayload: Database['public']['Tables']['invoices']['Insert'] = {
      organization_id: membership.organization_id,
      project_id: projectId,
      company_id: null,
      invoice_number: generateInvoiceNumber(),
      direction: 'receivable',
      issue_date: issueDate,
      due_date: dueDate,
      status: 'draft',
      subtotal: total,
      tax_amount: 0,
      total_amount: total,
      currency: 'USD',
      notes: `Auto-generated from ${timeEntries.length} billable time entries`,
      created_by: user.id,
    };

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoicePayload)
      .select()
      .single();

    if (invoiceError) {
      return supabaseError(invoiceError);
    }

    const invoiceId = invoice?.id;

    if (invoiceId) {
      const rollbackGeneratedInvoice = async () => {
        await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId);
        await supabase.from('invoices').delete().eq('id', invoiceId);
      };

      const lineItemPayloads: Database['public']['Tables']['invoice_line_items']['Insert'][] = lineItems.map((li, index) => ({
        invoice_id: invoiceId,
        description: li.description,
        quantity: li.quantity,
        unit_price: li.unit_price,
        line_total: li.amount,
        position: index + 1,
      }));

      const { error: lineItemInsertError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemPayloads);

      if (lineItemInsertError) {
        captureError(lineItemInsertError, 'api.invoices.generate_from_time.line_item_insert_failed', {
          invoice_id: invoiceId,
          project_id: projectId,
          ...requestContext,
        });
        await rollbackGeneratedInvoice();
        return supabaseError(lineItemInsertError);
      }

      const timeEntryIds = timeEntries.map((te) => te.id);
      const { error: timeEntryUpdateError } = await supabase
        .from('time_entries')
        .update({ invoice_id: invoiceId })
        .in('id', timeEntryIds);

      if (timeEntryUpdateError) {
        captureError(timeEntryUpdateError, 'api.invoices.generate_from_time.time_entry_link_failed', {
          invoice_id: invoiceId,
          project_id: projectId,
          ...requestContext,
        });
        await rollbackGeneratedInvoice();
        return supabaseError(timeEntryUpdateError);
      }
    }

    return apiSuccess({
      id: invoiceId,
      lineItems,
      total,
      timeEntriesCount: timeEntries.length,
      message: 'Invoice draft created successfully',
    });
  } catch (err) {
    if (isSupabaseError(err)) {
      return supabaseError(err);
    }

    captureError(err, 'api.invoices.generate_from_time.unhandled_error', {
      project_id: projectId,
      organization_id: membership.organization_id,
      ...requestContext,
    });
    return serverError('Failed to generate invoice from time entries');
  }
}
