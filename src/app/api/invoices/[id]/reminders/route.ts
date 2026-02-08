import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/invoices/[id]/reminders
 * Send overdue reminder for an invoice based on configured reminder sequence
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Fetch invoice with client details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email),
        company:companies(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return notFound('Invoice');
    }

    if (invoice.status === 'paid') {
      return badRequest('Invoice is already paid');
    }

    if (invoice.status === 'draft') {
      return badRequest('Cannot send reminders for draft invoices');
    }

    // Calculate days overdue
    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue < 0) {
      return badRequest('Invoice is not yet overdue');
    }

    // Find the org's active reminder sequence
    const { data: sequence } = await supabase
      .from('invoice_reminder_sequences')
      .select(`
        *,
        steps:invoice_reminder_steps(*)
      `)
      .eq('organization_id', invoice.organization_id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    // Determine which step to send
    let stepToSend = null;
    if (sequence?.steps) {
      // Get already sent reminders for this invoice
      const { data: sentReminders } = await supabase
        .from('invoice_reminder_log')
        .select('step_id')
        .eq('invoice_id', id);

      const sentStepIds = new Set((sentReminders || []).map((r: { step_id: string }) => r.step_id));

      // Find the next unsent step that matches days_after_due
      interface ReminderStep {
        id: string;
        days_after_due: number;
        step_number: number;
        subject_template: string;
        body_template: string;
        escalation_level: string;
        cc_account_manager: boolean;
      }
      const sortedSteps = (sequence.steps as ReminderStep[])
        .sort((a, b) => a.step_number - b.step_number);

      for (const step of sortedSteps) {
        if (!sentStepIds.has(step.id) && daysOverdue >= step.days_after_due) {
          stepToSend = step;
          break;
        }
      }
    }

    // Build reminder content
    const recipientEmail = (invoice.contact as { email?: string })?.email
      || (invoice.company as { email?: string })?.email;

    if (!recipientEmail) {
      return badRequest('No recipient email found for this invoice');
    }

    const contactName = (invoice.contact as { first_name?: string; last_name?: string })
      ? `${(invoice.contact as { first_name: string }).first_name} ${(invoice.contact as { last_name: string }).last_name}`
      : (invoice.company as { name?: string })?.name || 'Customer';

    const typedStep = stepToSend as { escalation_level?: string; subject_template?: string } | null;

    const escalationLevel = typedStep?.escalation_level
      || (daysOverdue > 60 ? 'final' : daysOverdue > 30 ? 'urgent' : 'standard');

    const subject = typedStep?.subject_template
      ? typedStep.subject_template
          .replace('{{invoice_number}}', invoice.invoice_number || id)
          .replace('{{company_name}}', (invoice.company as { name?: string })?.name || '')
      : `Payment Reminder: Invoice ${invoice.invoice_number || id} — ${daysOverdue} days overdue`;

    // Log the reminder
    const { data: reminderLog, error: logError } = await supabase
      .from('invoice_reminder_log')
      .insert({
        organization_id: invoice.organization_id,
        invoice_id: id,
        step_id: stepToSend?.id || null,
        sent_to: recipientEmail,
        subject,
        status: 'sent',
      })
      .select()
      .single();

    if (logError) {
      return supabaseError(logError);
    }

    // Create notification for the invoice owner
    await supabase.from('notifications').insert({
      organization_id: invoice.organization_id,
      user_id: user.id,
      type: 'invoice_reminder_sent',
      title: 'Invoice Reminder Sent',
      message: `Reminder sent to ${contactName} for invoice ${invoice.invoice_number || id}`,
      data: { invoice_id: id, reminder_id: reminderLog.id },
      entity_type: 'invoice',
      entity_id: id,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: invoice.organization_id,
      user_id: user.id,
      action: 'invoice_reminder_sent',
      entity_type: 'invoice',
      entity_id: id,
      new_values: {
        recipient: recipientEmail,
        days_overdue: daysOverdue,
        escalation_level: escalationLevel,
        step_id: stepToSend?.id,
      },
    });

    return apiSuccess({
      reminder_id: reminderLog.id,
      sent_to: recipientEmail,
      subject,
      days_overdue: daysOverdue,
      escalation_level: escalationLevel,
      contact_name: contactName,
    });
  } catch (e) {
    console.error('[API] Invoice reminder error:', e);
    return serverError('Failed to send reminder');
  }
}

/**
 * GET /api/invoices/[id]/reminders
 * List all reminders sent for an invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { data, error } = await supabase
      .from('invoice_reminder_log')
      .select(`
        *,
        step:invoice_reminder_steps(step_number, escalation_level, days_after_due)
      `)
      .eq('invoice_id', id)
      .order('sent_at', { ascending: false });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    console.error('[API] Invoice reminder list error:', e);
    return serverError('Failed to list reminders');
  }
}
