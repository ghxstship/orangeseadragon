import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const PROPOSAL_NUMBER_PREFIX = 'PROP';

const proposalSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().max(255).optional(),
  content: z.string().max(10000).optional(),
  type: z.enum(['text', 'pricing', 'timeline', 'terms']).optional(),
});

const proposalLineItemSchema = z.object({
  description: z.string().max(500).optional(),
  quantity: z.coerce.number().positive('Line item quantity must be greater than 0'),
  unitPrice: z.coerce.number().min(0, 'Line item unitPrice must be >= 0'),
  unit: z.string().trim().max(50).optional(),
});

export const proposalBuilderPayloadSchema = z.object({
  title: z.string().trim().max(255).optional(),
  clientName: z.string().trim().max(255).optional(),
  clientEmail: z.string().email('clientEmail must be a valid email').or(z.literal('')).optional(),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'validUntil must use YYYY-MM-DD format')
    .optional(),
  sections: z.array(proposalSectionSchema).optional(),
  lineItems: z.array(proposalLineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().max(10000).optional(),
  terms: z.string().max(10000).optional(),
  currency: z.string().trim().length(3, 'currency must be a 3-letter code').optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  dealId: z.string().uuid('dealId must be a valid UUID').optional(),
});

export type ProposalBuilderPayload = z.infer<typeof proposalBuilderPayloadSchema>;

type ProposalStatus = Extract<Database['public']['Enums']['proposal_status'], 'draft' | 'sent'>;

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

function toMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function generateProposalNumber(): string {
  const year = new Date().getUTCFullYear();
  const shortTs = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${PROPOSAL_NUMBER_PREFIX}-${year}-${shortTs}-${suffix}`;
}

function buildDescription(sections: ProposalBuilderPayload['sections']): string | null {
  if (!sections?.length) return null;

  const firstContent = sections.find((section) => section.content && section.content.trim().length > 0);
  if (!firstContent?.content) return null;

  return firstContent.content.trim().slice(0, 500);
}

function buildNotes(payload: ProposalBuilderPayload): string | null {
  const lines: string[] = [];

  if (payload.clientName) {
    lines.push(`Client: ${payload.clientName}`);
  }

  if (payload.clientEmail) {
    lines.push(`Client Email: ${payload.clientEmail}`);
  }

  if (payload.notes?.trim()) {
    lines.push(payload.notes.trim());
  }

  if (lines.length === 0) return null;
  return lines.join('\n');
}

function buildProposalItems(
  proposalId: string,
  lineItems: ProposalBuilderPayload['lineItems']
): Database['public']['Tables']['proposal_items']['Insert'][] {
  return lineItems.map((item, index) => {
    const normalizedDescription = item.description?.trim() || `Line Item ${index + 1}`;
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const lineTotal = toMoney(quantity * unitPrice);

    return {
      proposal_id: proposalId,
      name: normalizedDescription.slice(0, 255),
      description: normalizedDescription,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      position: index + 1,
    };
  });
}

export async function createProposalFromBuilderPayload(params: {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  userId: string;
  payload: ProposalBuilderPayload;
  status: ProposalStatus;
}): Promise<{
  proposal: ProposalRow;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}> {
  const { supabase, organizationId, userId, payload, status } = params;

  const normalizedCurrency = (payload.currency || 'USD').toUpperCase();
  const normalizedDiscount = Number(payload.discount ?? 0);
  const normalizedTaxRate = Number(payload.taxRate ?? 0);

  const proposalItems = buildProposalItems('pending', payload.lineItems);
  const subtotal = toMoney(proposalItems.reduce((sum, item) => sum + item.line_total, 0));
  const discountAmount = toMoney(subtotal * (normalizedDiscount / 100));
  const taxAmount = toMoney((subtotal - discountAmount) * (normalizedTaxRate / 100));
  const totalAmount = toMoney(subtotal - discountAmount + taxAmount);

  const proposalInsert: Database['public']['Tables']['proposals']['Insert'] = {
    title: payload.title?.trim() || 'Untitled Proposal',
    proposal_number: generateProposalNumber(),
    organization_id: organizationId,
    created_by: userId,
    deal_id: payload.dealId || null,
    status,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    valid_until: payload.validUntil || null,
    description: buildDescription(payload.sections),
    notes: buildNotes(payload),
    terms: payload.terms?.trim() || null,
    currency: normalizedCurrency,
    subtotal,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
  };

  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .insert(proposalInsert)
    .select('*')
    .single();

  if (proposalError || !proposal) {
    throw proposalError || new Error('Failed to create proposal');
  }

  const lineItemPayloads = buildProposalItems(proposal.id, payload.lineItems);
  const { error: proposalItemsError } = await supabase.from('proposal_items').insert(lineItemPayloads);

  if (proposalItemsError) {
    await supabase.from('proposals').delete().eq('id', proposal.id);
    throw proposalItemsError;
  }

  return {
    proposal,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  };
}
