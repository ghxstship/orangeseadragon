import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

type RateCardResponse = {
  id: string;
  name: string;
  client_id: string | null;
  is_default: boolean;
  currency: string;
  rates: Array<{
    role_id: string;
    role_name: string;
    hourly_rate: number;
    overtime_rate: number;
  }>;
  created_at: string | null;
};

const rateItemSchema = z.object({
  roleId: z.string().optional(),
  roleName: z.string().optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  overtimeRate: z.coerce.number().min(0).optional(),
});

const createRateCardSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(255),
  clientId: z.string().uuid().optional(),
  isDefault: z.boolean().optional(),
  currency: z.string().length(3).optional(),
  rates: z.array(rateItemSchema).optional(),
});

type IncomingRate = z.infer<typeof rateItemSchema>;

function normalizeRates(rates: unknown): RateCardResponse['rates'] {
  if (!Array.isArray(rates)) return [];

  return rates.flatMap((rawRate) => {
    if (!rawRate || typeof rawRate !== 'object') return [];

    const rate = rawRate as IncomingRate;
    const roleId = typeof rate.roleId === 'string' ? rate.roleId : '';
    const roleName = typeof rate.roleName === 'string' ? rate.roleName : roleId;
    const hourlyRate = Number(rate.hourlyRate ?? 0);
    const overtimeRate = Number(rate.overtimeRate ?? 0);

    if (!roleId && !roleName) return [];

    return [{
      role_id: roleId || roleName,
      role_name: roleName || roleId,
      hourly_rate: Number.isFinite(hourlyRate) ? hourlyRate : 0,
      overtime_rate: Number.isFinite(overtimeRate) ? overtimeRate : 0,
    }];
  });
}

/**
 * G6: Client-specific rate cards + budget import from rate cards.
 * GET: List rate cards (optionally filtered by clientId)
 * POST: Create/update a rate card
 */
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  const { data: cards, error: cardsError } = await supabase
    .from('rate_cards')
    .select('id, name, is_default, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false });

  if (cardsError) return supabaseError(cardsError);
  if (!cards || cards.length === 0) return apiSuccess([]);

  const cardIds = cards.map((card) => card.id);
  const { data: items, error: itemsError } = await supabase
    .from('rate_card_items')
    .select('rate_card_id, item_code, description, regular_rate, overtime_rate')
    .in('rate_card_id', cardIds);

  if (itemsError) return supabaseError(itemsError);

  const itemsByCard = new Map<string, NonNullable<typeof items>>();
  for (const item of items ?? []) {
    const existing = itemsByCard.get(item.rate_card_id) ?? [];
    existing.push(item);
    itemsByCard.set(item.rate_card_id, existing);
  }

  const data: RateCardResponse[] = cards.map((card) => ({
    id: card.id,
    name: card.name,
    client_id: null,
    is_default: card.is_default ?? false,
    currency: 'USD',
    created_at: card.created_at,
    rates: (itemsByCard.get(card.id) ?? []).map((item) => ({
      role_id: item.item_code ?? item.description ?? 'general',
      role_name: item.description ?? item.item_code ?? 'General',
      hourly_rate: Number(item.regular_rate ?? 0),
      overtime_rate: Number(item.overtime_rate ?? 0),
    })),
  }));

  return apiSuccess(data);
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsed = createRateCardSchema.safeParse(rawBody);
  if (!parsed.success) {
    return badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { name, clientId, isDefault, currency } = parsed.data;
  const rates = normalizeRates(parsed.data.rates);

  try {
    if (isDefault) {
      const { error: clearDefaultError } = await supabase
        .from('rate_cards')
        .update({ is_default: false })
        .eq('organization_id', membership.organization_id)
        .eq('is_default', true);

      if (clearDefaultError) return supabaseError(clearDefaultError);
    }

    const payload: Database['public']['Tables']['rate_cards']['Insert'] = {
      name,
      is_default: isDefault ?? false,
      organization_id: membership.organization_id,
      effective_date: new Date().toISOString().split('T')[0] ?? '',
      rate_card_type: 'workforce',
    };

    const { data, error } = await supabase
      .from('rate_cards')
      .insert(payload)
      .select('id, name, is_default, created_at')
      .single();

    if (error) return supabaseError(error);

    if (rates.length > 0) {
      const itemPayloads: Database['public']['Tables']['rate_card_items']['Insert'][] = rates.map((rate) => ({
        rate_card_id: data.id,
        rate_type: 'hourly',
        regular_rate: rate.hourly_rate,
        overtime_rate: rate.overtime_rate,
        item_code: rate.role_id,
        description: rate.role_name,
        unit: 'hour',
        minimum_quantity: 1,
        currency: currency || 'USD',
      }));

      const { error: itemInsertError } = await supabase
        .from('rate_card_items')
        .insert(itemPayloads);

      if (itemInsertError) return supabaseError(itemInsertError);
    }

    return apiCreated({
      id: data.id,
      name: data.name,
      client_id: clientId || null,
      is_default: data.is_default ?? false,
      currency: currency || 'USD',
      rates,
      created_at: data.created_at,
    } satisfies RateCardResponse);
  } catch (error) {
    captureError(error, 'api.rate_cards.create.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to create rate card');
  }
}
