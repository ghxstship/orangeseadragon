import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * Valid phase transitions for events
 * Ensures events can only progress through proper lifecycle stages
 */
const PHASE_TRANSITIONS: Record<string, string[]> = {
    concept: ['planning', 'archived'],
    planning: ['pre_production', 'concept', 'archived'],
    pre_production: ['setup', 'planning', 'archived'],
    setup: ['active', 'pre_production'],
    active: ['live', 'setup'],
    live: ['teardown'],
    teardown: ['post_mortem'],
    post_mortem: ['archived'],
    archived: [], // Terminal state
};

/**
 * Required fields for each phase transition
 * Validates that necessary data exists before allowing progression
 */
const PHASE_REQUIREMENTS: Record<string, string[]> = {
    planning: ['name', 'start_date', 'end_date'],
    pre_production: ['venue_id', 'capacity'],
    setup: [],
    active: [],
    live: ['doors_time', 'start_time'],
    teardown: [],
    post_mortem: [],
    archived: [],
};

/**
 * POST /api/events/[id]/phase
 * Transition an event to a new phase with validation
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requirePolicy('entity.write');
        if (auth.error) return auth.error;
        const { user, supabase } = auth;

        const body = await request.json();
        const { phase: targetPhase, notes } = body;

        if (!targetPhase) {
            return badRequest('Target phase is required');
        }

        // Get the current event
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !event) {
            return notFound('Event');
        }

        const currentPhase = event.phase;

        // Validate phase transition is allowed
        const allowedTransitions = PHASE_TRANSITIONS[currentPhase] || [];
        if (!allowedTransitions.includes(targetPhase)) {
            return badRequest(
                `Cannot transition from '${currentPhase}' to '${targetPhase}'`,
                { allowed_transitions: allowedTransitions }
            );
        }

        // Validate required fields for target phase
        const requiredFields = PHASE_REQUIREMENTS[targetPhase] || [];
        const missingFields = requiredFields.filter(field => !event[field]);

        if (missingFields.length > 0) {
            return badRequest(
                `Missing required fields for ${targetPhase} phase`,
                { missing_fields: missingFields }
            );
        }

        // Update the event phase
        const { data, error } = await supabase
            .from('events')
            .update({
                phase: targetPhase,
                updated_at: new Date().toISOString(),
                metadata: {
                    ...event.metadata,
                    phase_history: [
                        ...(event.metadata?.phase_history || []),
                        {
                            from: currentPhase,
                            to: targetPhase,
                            changed_by: user.id,
                            changed_at: new Date().toISOString(),
                            notes: notes || null,
                        }
                    ]
                }
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return supabaseError(error);
        }

        // Create audit log entry
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: event.organization_id,
                user_id: user.id,
                action: 'phase_changed',
                entity_type: 'event',
                entity_id: id,
                old_values: { phase: currentPhase },
                new_values: { phase: targetPhase },
            });

        return apiSuccess(data, {
            transition: { from: currentPhase, to: targetPhase },
            message: `Event transitioned to ${targetPhase} phase`,
        });
    } catch (e) {
        console.error('[API] Event phase transition error:', e);
        return serverError('Phase transition failed');
    }
}

/**
 * GET /api/events/[id]/phase
 * Get available phase transitions for an event
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { id } = await params;

    try {
        const { data: event, error } = await supabase
            .from('events')
            .select('id, phase, metadata')
            .eq('id', id)
            .single();

        if (error || !event) {
            return notFound('Event');
        }

        const currentPhase = event.phase;
        const availableTransitions = PHASE_TRANSITIONS[currentPhase] || [];

        return apiSuccess({
            current_phase: currentPhase,
            available_transitions: availableTransitions,
            phase_history: event.metadata?.phase_history || [],
        });
    } catch (e) {
        console.error('[API] Get event phase error:', e);
        return serverError('Failed to get phase info');
    }
}
