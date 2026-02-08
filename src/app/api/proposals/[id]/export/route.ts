import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, notFound, serverError } from '@/lib/api/response';

/**
 * GET /api/proposals/[id]/export
 * Export a proposal as PDF-ready HTML document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Fetch proposal with related data
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select(`
        *,
        deal:deals(
          id, name, value, currency,
          company:companies(id, name, email, phone, address),
          contact:contacts(id, first_name, last_name, email, phone, title)
        ),
        line_items:proposal_line_items(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !proposal) {
      return notFound('Proposal');
    }

    // Fetch organization branding
    const { data: org } = await supabase
      .from('organizations')
      .select('name, logo_url, address, phone, email, website')
      .eq('id', proposal.organization_id)
      .single();

    const lineItems = (proposal.line_items || []) as Array<{
      name: string;
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;

    const subtotal = lineItems.reduce((sum, item) => sum + (item.total || item.quantity * item.unit_price || 0), 0);
    const taxRate = (proposal.tax_rate as number) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    const currency = (proposal.deal as { currency?: string })?.currency || 'USD';

    const deal = proposal.deal as {
      name?: string;
      company?: { name?: string; email?: string; phone?: string; address?: string };
      contact?: { first_name?: string; last_name?: string; email?: string; title?: string };
    } | null;

    // Generate PDF-ready HTML
    const html = `<!DOCTYPE html>
<html>
<head>
<title>Proposal: ${proposal.title || proposal.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.6; }
  .page { max-width: 800px; margin: 0 auto; padding: 48px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
  .company-name { font-size: 24px; font-weight: 700; }
  .company-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .proposal-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .proposal-meta { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; }
  .info-value { font-size: 14px; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f9fafb; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
  td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
  .total-row.grand { font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
  .terms { font-size: 12px; color: #6b7280; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">${org?.name || 'ATLVS'}</div>
      <div class="company-details">${org?.address || ''}<br/>${org?.phone || ''} | ${org?.email || ''}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:12px;color:#6b7280">PROPOSAL</div>
      <div style="font-size:14px;font-weight:600">#${proposal.proposal_number || id.slice(0, 8).toUpperCase()}</div>
      <div style="font-size:12px;color:#6b7280">${new Date(proposal.created_at).toLocaleDateString()}</div>
    </div>
  </div>

  <div class="proposal-title">${proposal.title || proposal.name}</div>
  <div class="proposal-meta">${proposal.description || ''}</div>

  <div class="section">
    <div class="section-title">Client</div>
    <div class="client-info">
      <div>
        <div class="info-label">Company</div>
        <div class="info-value">${deal?.company?.name || '—'}</div>
      </div>
      <div>
        <div class="info-label">Contact</div>
        <div class="info-value">${deal?.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '—'}</div>
      </div>
      <div>
        <div class="info-label">Email</div>
        <div class="info-value">${deal?.contact?.email || deal?.company?.email || '—'}</div>
      </div>
      <div>
        <div class="info-label">Project</div>
        <div class="info-value">${deal?.name || '—'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Line Items</div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.description || ''}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${currency} ${(item.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="text-right">${currency} ${(item.total || item.quantity * item.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${currency} ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
      ${taxRate > 0 ? `<div class="total-row"><span>Tax (${taxRate}%)</span><span>${currency} ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>` : ''}
      <div class="total-row grand"><span>Total</span><span>${currency} ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    </div>
  </div>

  ${proposal.terms ? `
  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <div class="terms">${proposal.terms}</div>
  </div>` : ''}

  ${proposal.valid_until ? `
  <div class="section">
    <div class="section-title">Validity</div>
    <div class="terms">This proposal is valid until ${new Date(proposal.valid_until).toLocaleDateString()}</div>
  </div>` : ''}

  <div class="footer">
    Generated by ATLVS on ${new Date().toLocaleDateString()} | ${org?.website || ''}
  </div>
</div>
</body>
</html>`;

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: proposal.organization_id,
      user_id: user.id,
      action: 'proposal_exported',
      entity_type: 'proposal',
      entity_id: id,
      new_values: { format: 'pdf' },
    });

    return apiSuccess({
      filename: `proposal_${proposal.proposal_number || id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.html`,
      content_type: 'text/html',
      content: html,
      total,
      currency,
    });
  } catch (e) {
    console.error('[API] Proposal export error:', e);
    return serverError('Failed to export proposal');
  }
}
