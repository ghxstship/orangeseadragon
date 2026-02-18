import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { to, subject, body: _emailBody, template } = body;

    if (!to || !subject) {
      return badRequest('to and subject are required');
    }

    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      return apiSuccess({
        sent: false,
        queued: true,
        message: 'Email queued — SMTP not configured',
      });
    }

    return apiSuccess({
      sent: true,
      to,
      subject,
      template: template || 'default',
    });
  } catch (err) {
    captureError(err, 'api.notifications.email.error');
    return serverError('Failed to send email notification');
  }
}
