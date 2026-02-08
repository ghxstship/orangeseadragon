import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/contracts/check-expiry
 * Batch check contracts approaching expiry and send notifications
 * This should be called by a scheduled job (e.g., daily cron)
 */
export async function POST(request: NextRequest) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    try {

        const body = await request.json();
        const { days_ahead = 30 } = body;

        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days_ahead);

        // Find contracts expiring within the specified window
        const { data: expiringContracts, error: fetchError } = await supabase
            .from('contracts')
            .select(`
        id, 
        contract_number,
        title,
        organization_id,
        counterparty_name,
        end_date,
        value,
        renewal_type,
        renewal_notice_days,
        created_by
      `)
            .eq('status', 'active')
            .not('end_date', 'is', null)
            .gte('end_date', today.toISOString().split('T')[0])
            .lte('end_date', futureDate.toISOString().split('T')[0]);

        if (fetchError) {
            return supabaseError(fetchError);
        }

        if (!expiringContracts || expiringContracts.length === 0) {
            return apiSuccess(null, {
                message: 'No contracts expiring in the specified window',
                notifications_sent: 0,
            });
        }

        // Group by organization and create notifications
        const notificationsCreated: Array<{ contract_id: string; contract_number: string; days_to_expiry: number }> = [];

        for (const contract of expiringContracts) {
            const expiryDate = new Date(contract.end_date);
            const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Determine urgency level
            let urgency = 'info';
            if (daysToExpiry <= 7) {
                urgency = 'critical';
            } else if (daysToExpiry <= 14) {
                urgency = 'warning';
            }

            // Get organization owners/admins to notify
            const { data: admins } = await supabase
                .from('organization_members')
                .select('user_id')
                .eq('organization_id', contract.organization_id)
                .eq('is_owner', true);

            const recipientsList: string[] = [];
            if (admins) {
                admins.forEach(a => recipientsList.push(a.user_id));
            }
            if (contract.created_by) {
                recipientsList.push(contract.created_by);
            }

            const recipientIds = Array.from(new Set(recipientsList));

            // Create notifications
            const notifications = recipientIds.map(userId => ({
                organization_id: contract.organization_id,
                user_id: userId,
                type: 'contract_expiring',
                title: `Contract Expiring in ${daysToExpiry} Days`,
                message: `"${contract.title}" with ${contract.counterparty_name} expires on ${contract.end_date}`,
                data: {
                    contract_id: contract.id,
                    contract_number: contract.contract_number,
                    end_date: contract.end_date,
                    days_to_expiry: daysToExpiry,
                    urgency,
                    renewal_type: contract.renewal_type,
                },
                entity_type: 'contract',
                entity_id: contract.id,
            }));

            if (notifications.length > 0) {
                await supabase.from('notifications').insert(notifications);
                notificationsCreated.push({
                    contract_id: contract.id,
                    contract_number: contract.contract_number,
                    days_to_expiry: daysToExpiry,
                });
            }

            // Handle auto-renewal contracts
            if (contract.renewal_type === 'auto') {
                const renewalNoticeDays = contract.renewal_notice_days || 30;

                if (daysToExpiry <= renewalNoticeDays) {
                    // Mark for auto-renewal review
                    await supabase
                        .from('contracts')
                        .update({
                            metadata: {
                                auto_renewal_pending: true,
                                auto_renewal_notice_sent: new Date().toISOString(),
                            },
                        })
                        .eq('id', contract.id);
                }
            }
        }

        return apiSuccess(notificationsCreated, {
            message: `Processed ${expiringContracts.length} expiring contracts`,
            contracts_checked: expiringContracts.length,
            notifications_sent: notificationsCreated.length,
        });
    } catch (e) {
        console.error('[API] Contract expiry check error:', e);
        return serverError('Expiry check failed');
    }
}
