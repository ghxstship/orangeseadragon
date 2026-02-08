import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';
import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY environment variable is not set');
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const resend = getResend();

  try {

    const body = await request.json();
    const { invoiceId, email, paymentLink } = body;

    if (!invoiceId || !email || !paymentLink) {
      return badRequest('Missing required fields: invoiceId, email, paymentLink');
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        invoice_number,
        amount_due,
        due_date,
        client:companies(name)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return notFound('Invoice');
    }

    // Get tenant branding
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, logo_url')
      .single();

    const companyName = tenant?.name || 'ATLVS';
    const clientName = (invoice.client as { name?: string })?.name || 'Customer';
    const amountDue = invoice.amount_due || 0;
    const dueDate = invoice.due_date 
      ? new Date(invoice.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Upon receipt';

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: `${companyName} <billing@${process.env.RESEND_DOMAIN || 'atlvs.app'}>`,
      to: email,
      subject: `Invoice ${invoice.invoice_number} - Payment Request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111; margin: 0;">${companyName}</h1>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #111;">Invoice ${invoice.invoice_number}</h2>
            <p style="margin: 0 0 8px 0;">Dear ${clientName},</p>
            <p style="margin: 0;">Please find below the details of your invoice:</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong>Amount Due</strong>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <strong style="font-size: 18px; color: #111;">$${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">Due Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${dueDate}</td>
            </tr>
          </table>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${paymentLink}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Pay Now
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This is a secure payment link. You can also copy and paste this URL into your browser:<br>
            <a href="${paymentLink}" style="color: #2563eb; word-break: break-all;">${paymentLink}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            If you have any questions about this invoice, please contact us.<br>
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </p>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return serverError('Failed to send email');
    }

    // Log the email send
    await supabase.from('activity_logs').insert({
      entity_type: 'invoice',
      entity_id: invoiceId,
      action: 'payment_link_sent',
      metadata: { email, sent_at: new Date().toISOString() },
      created_by: user.id,
    });

    return apiSuccess({ sent: true });
  } catch (error) {
    console.error('Error sending payment link:', error);
    return serverError('Failed to send payment link');
  }
}
