import type { SendEmailParams, SendEmailResult, ContactParams } from './types';
import { getErrorMessage } from '@/lib/api/error-message';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@atlvs.io';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3';

export class SendGridService {
  private getHeaders(): HeadersInit {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    return {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const toAddresses = Array.isArray(params.to) ? params.to : [params.to];

      const payload: Record<string, unknown> = {
        personalizations: [
          {
            to: toAddresses.map((email) => ({ email })),
            ...(params.dynamicTemplateData && { dynamic_template_data: params.dynamicTemplateData }),
          },
        ],
        from: { email: params.from || SENDGRID_FROM_EMAIL },
        subject: params.subject,
      };

      if (params.templateId) {
        payload.template_id = params.templateId;
      } else {
        payload.content = [];
        if (params.text) {
          (payload.content as Array<{ type: string; value: string }>).push({ type: 'text/plain', value: params.text });
        }
        if (params.html) {
          (payload.content as Array<{ type: string; value: string }>).push({ type: 'text/html', value: params.html });
        }
      }

      if (params.replyTo) {
        payload.reply_to = { email: params.replyTo };
      }

      if (params.attachments?.length) {
        payload.attachments = params.attachments.map((att) => ({
          content: att.content,
          filename: att.filename,
          type: att.type || 'application/octet-stream',
          disposition: att.disposition || 'attachment',
        }));
      }

      const response = await fetch(`${SENDGRID_API_URL}/mail/send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        const messageId = response.headers.get('x-message-id') || undefined;
        return { success: true, messageId };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: (errorData as { errors?: Array<{ message: string }> }).errors?.[0]?.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Unknown error'),
      };
    }
  }

  async sendTemplateEmail(
    to: string | string[],
    templateId: string,
    dynamicData: Record<string, unknown>
  ): Promise<SendEmailResult> {
    return this.sendEmail({
      to,
      subject: '',
      templateId,
      dynamicTemplateData: dynamicData,
    });
  }

  async addContact(params: ContactParams): Promise<{ success: boolean; error?: string }> {
    try {
      const contact: Record<string, unknown> = {
        email: params.email,
      };

      if (params.firstName) contact.first_name = params.firstName;
      if (params.lastName) contact.last_name = params.lastName;
      if (params.customFields) contact.custom_fields = params.customFields;

      const payload: Record<string, unknown> = {
        contacts: [contact],
      };

      if (params.listIds?.length) {
        payload.list_ids = params.listIds;
      }

      const response = await fetch(`${SENDGRID_API_URL}/marketing/contacts`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: (errorData as { errors?: Array<{ message: string }> }).errors?.[0]?.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Unknown error'),
      };
    }
  }

  async removeContact(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const searchResponse = await fetch(
        `${SENDGRID_API_URL}/marketing/contacts/search/emails`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ emails: [email] }),
        }
      );

      if (!searchResponse.ok) {
        return { success: false, error: 'Contact not found' };
      }

      const searchData = await searchResponse.json() as { result?: Record<string, { contact?: { id: string } }> };
      const contactId = searchData.result?.[email]?.contact?.id;

      if (!contactId) {
        return { success: false, error: 'Contact not found' };
      }

      const deleteResponse = await fetch(
        `${SENDGRID_API_URL}/marketing/contacts?ids=${contactId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      return { success: deleteResponse.ok };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Unknown error'),
      };
    }
  }

  async getLists(): Promise<{ lists: Array<{ id: string; name: string; contact_count: number }>; error?: string }> {
    try {
      const response = await fetch(`${SENDGRID_API_URL}/marketing/lists`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json() as { result?: Array<{ id: string; name: string; contact_count: number }> };
        return { lists: data.result || [] };
      }

      return { lists: [], error: `HTTP ${response.status}` };
    } catch (error) {
      return {
        lists: [],
        error: getErrorMessage(error, 'Unknown error'),
      };
    }
  }
}

export const sendGridService = new SendGridService();
