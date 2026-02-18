import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, notFound, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/invoices/[id]/export
 * Export invoice as PDF-ready HTML, optionally with timesheet attachment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const includeTimesheet = request.nextUrl.searchParams.get('include_timesheet') === 'true';

    // Fetch invoice with line items and related data
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*),
        contact:contacts(id, first_name, last_name, email, phone),
        company:companies(id, name, email, phone, legacy_address)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return notFound('Invoice');
    }

    // Fetch org details
    const { data: org } = await supabase
      .from('organizations')
      .select('name, logo_url, legacy_address, phone, email, website')
      .eq('id', invoice.organization_id)
      .single();

    const lineItems = (invoice.line_items || []) as Array<{
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
      tax_rate: number;
      tax_amount: number;
    }>;

    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || item.quantity * item.unit_price || 0), 0);
    const totalTax = lineItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    const total = subtotal + totalTax;

    const company = invoice.company as { name?: string; email?: string; legacy_address?: string } | null;
    const contact = invoice.contact as { first_name?: string; last_name?: string; email?: string } | null;

    // Optionally fetch timesheet data
    let timesheetHtml = '';
    if (includeTimesheet && invoice.project_id) {
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('*, user:auth_users_view(email)')
        .eq('project_id', invoice.project_id)
        .order('date', { ascending: true });

      if (timeEntries && timeEntries.length > 0) {
        const totalHours = timeEntries.reduce((sum, e) => sum + ((e.hours as number) || 0), 0);
        timesheetHtml = `
  <div style="page-break-before:always"></div>
  <div class="section">
    <div class="section-title">Timesheet Attachment</div>
    <table>
      <thead><tr><th>Date</th><th>Person</th><th>Description</th><th class="text-right">Hours</th><th class="text-right">Billable</th></tr></thead>
      <tbody>
        ${timeEntries.map((e: Record<string, unknown>) => `
        <tr>
          <td>${e.date}</td>
          <td>${(e.user as { email?: string })?.email || '—'}</td>
          <td>${e.description || ''}</td>
          <td class="text-right">${e.hours}</td>
          <td class="text-right">${e.billable ? 'Yes' : 'No'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div style="text-align:right;margin-top:8px;font-weight:600">Total Hours: ${totalHours.toFixed(1)}</div>
  </div>`;
      }
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Invoice ${invoice.invoice_number || id}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.6; }
  .page { max-width: 800px; margin: 0 auto; padding: 48px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
  .company-name { font-size: 24px; font-weight: 700; }
  .company-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f9fafb; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; margin-top: 16px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .total-row.grand { font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">${org?.name || 'ATLVS'}</div>
      <div class="company-details">${org?.legacy_address || ''}<br/>${org?.phone || ''} | ${org?.email || ''}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:12px;color:#6b7280">INVOICE</div>
      <div style="font-size:18px;font-weight:700">#${invoice.invoice_number || id.slice(0, 8).toUpperCase()}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">
        Issued: ${new Date(invoice.issue_date || invoice.created_at).toLocaleDateString()}<br/>
        Due: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}
      </div>
      <div class="status-badge" style="margin-top:8px;background:${invoice.status === 'paid' ? '#dcfce7;color:#166534' : '#fef3c7;color:#92400e'}">${invoice.status}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <div style="font-weight:600">${company?.name || '—'}</div>
    <div style="font-size:13px;color:#6b7280">
      ${contact ? `${contact.first_name} ${contact.last_name}` : ''}<br/>
      ${contact?.email || company?.email || ''}<br/>
      ${company?.legacy_address || ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Line Items</div>
    <table>
      <thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Tax</th><th class="text-right">Amount</th></tr></thead>
      <tbody>
        ${lineItems.map(item => `
        <tr>
          <td>${item.description || ''}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${(item.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="text-right">${(item.tax_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="text-right">${(item.amount || item.quantity * item.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
      ${totalTax > 0 ? `<div class="total-row"><span>Tax</span><span>${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>` : ''}
      <div class="total-row grand"><span>Total Due</span><span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    </div>
  </div>

  ${invoice.notes ? `<div class="section"><div class="section-title">Notes</div><div style="font-size:13px;color:#6b7280">${invoice.notes}</div></div>` : ''}

  ${timesheetHtml}

  <div class="footer">Generated by ATLVS on ${new Date().toLocaleDateString()} | ${org?.website || ''}</div>
</div>
</body>
</html>`;

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: invoice.organization_id,
      user_id: user.id,
      action: 'invoice_exported',
      entity_type: 'invoice',
      entity_id: id,
      new_values: { include_timesheet: includeTimesheet },
    });

    return apiSuccess({
      filename: `invoice_${invoice.invoice_number || id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.html`,
      content_type: 'text/html',
      content: html,
      total,
      include_timesheet: includeTimesheet,
    });
  } catch (e) {
    captureError(e, 'api.invoices.id.export.error');
    return serverError('Failed to export invoice');
  }
}
