export interface SendEmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: 'attachment' | 'inline';
  }>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, string>;
  listIds?: string[];
}
