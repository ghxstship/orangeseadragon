# GHXSTSHIP/ATLVS Platform — Integration Connectors

## Overview

This document outlines the integration connectors required to complete Phase 4 of the gap implementation plan. These integrations connect the platform to external services for payments, communication, productivity, and automation.

---

## Integration Status

| Integration | Priority | Status | Use Cases |
|-------------|----------|--------|-----------|
| **Stripe** | ⚡ Critical | 📋 Planned | Payments, subscriptions, invoicing |
| **Slack** | 🔴 High | 📋 Planned | Notifications, team communication |
| **Google Workspace** | 🔴 High | 📋 Planned | Calendar sync, Drive, SSO |
| **Microsoft 365** | 🟡 Medium | 📋 Planned | Calendar sync, OneDrive, SSO |
| **Zapier** | 🟡 Medium | 📋 Planned | Workflow automation, 3rd party apps |
| **Twilio** | 🟡 Medium | 📋 Planned | SMS notifications, voice |
| **SendGrid** | 🔴 High | 📋 Planned | Transactional email |
| **QuickBooks** | 🟡 Medium | 📋 Planned | Accounting sync |

---

## 1. Stripe Integration

### Purpose
Payment processing for event registrations, ticketing, invoices, and subscriptions.

### Required Scopes
- `payment_intents` — Process payments
- `customers` — Manage customer records
- `subscriptions` — Handle recurring billing
- `invoices` — Create and manage invoices
- `refunds` — Process refunds
- `webhooks` — Receive event notifications

### Implementation

#### Environment Variables
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Webhook Events to Handle
```typescript
// /api/webhooks/stripe/route.ts
const STRIPE_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'charge.refunded',
  'checkout.session.completed',
];
```

#### Service Interface
```typescript
// /lib/integrations/stripe/service.ts
interface StripeService {
  // Payments
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<PaymentIntent>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<Refund>;
  
  // Customers
  createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Customer>;
  updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<Customer>;
  
  // Subscriptions
  createSubscription(customerId: string, priceId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;
  
  // Invoices
  createInvoice(customerId: string, items: InvoiceItem[]): Promise<Invoice>;
  sendInvoice(invoiceId: string): Promise<Invoice>;
  
  // Checkout
  createCheckoutSession(lineItems: LineItem[], successUrl: string, cancelUrl: string): Promise<CheckoutSession>;
}
```

#### Database Sync
```sql
-- Stripe customer mapping
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment records
CREATE TABLE stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'registration', 'invoice', 'subscription'
  source_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Slack Integration

### Purpose
Real-time notifications, team communication, and workflow alerts.

### Required Scopes
- `chat:write` — Send messages
- `channels:read` — List channels
- `users:read` — Get user info
- `incoming-webhook` — Webhook notifications

### Implementation

#### Environment Variables
```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_ID=...
```

#### Notification Types
```typescript
// /lib/integrations/slack/notifications.ts
type SlackNotificationType =
  | 'task_assigned'
  | 'task_due_soon'
  | 'approval_required'
  | 'event_reminder'
  | 'budget_alert'
  | 'incident_reported'
  | 'registration_received'
  | 'payment_received';

interface SlackNotification {
  type: SlackNotificationType;
  channel: string;
  message: string;
  blocks?: SlackBlock[];
  metadata?: Record<string, unknown>;
}
```

#### Service Interface
```typescript
// /lib/integrations/slack/service.ts
interface SlackService {
  sendMessage(channel: string, text: string, blocks?: SlackBlock[]): Promise<void>;
  sendDirectMessage(userId: string, text: string): Promise<void>;
  createChannel(name: string, isPrivate?: boolean): Promise<Channel>;
  inviteToChannel(channelId: string, userIds: string[]): Promise<void>;
  postNotification(notification: SlackNotification): Promise<void>;
}
```

---

## 3. Google Workspace Integration

### Purpose
Calendar synchronization, Google Drive file storage, and SSO authentication.

### Required Scopes
- `calendar.events` — Read/write calendar events
- `calendar.readonly` — Read calendar data
- `drive.file` — Access Drive files
- `userinfo.email` — Get user email for SSO
- `userinfo.profile` — Get user profile for SSO

### Implementation

#### Environment Variables
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
```

#### Service Interface
```typescript
// /lib/integrations/google/service.ts
interface GoogleCalendarService {
  listCalendars(): Promise<Calendar[]>;
  listEvents(calendarId: string, timeMin: Date, timeMax: Date): Promise<CalendarEvent[]>;
  createEvent(calendarId: string, event: CalendarEventInput): Promise<CalendarEvent>;
  updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEventInput>): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
  syncEvents(calendarId: string, syncToken?: string): Promise<SyncResult>;
}

interface GoogleDriveService {
  listFiles(folderId?: string): Promise<DriveFile[]>;
  uploadFile(file: File, folderId?: string): Promise<DriveFile>;
  downloadFile(fileId: string): Promise<Blob>;
  createFolder(name: string, parentId?: string): Promise<DriveFile>;
  shareFile(fileId: string, email: string, role: 'reader' | 'writer'): Promise<void>;
}
```

---

## 4. Microsoft 365 Integration

### Purpose
Calendar synchronization, OneDrive file storage, and SSO authentication.

### Required Scopes
- `Calendars.ReadWrite` — Read/write calendar events
- `Files.ReadWrite` — Access OneDrive files
- `User.Read` — Get user profile for SSO

### Implementation

#### Environment Variables
```env
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...
MICROSOFT_REDIRECT_URI=...
```

#### Service Interface
```typescript
// /lib/integrations/microsoft/service.ts
interface MicrosoftCalendarService {
  listCalendars(): Promise<Calendar[]>;
  listEvents(calendarId: string, startDateTime: string, endDateTime: string): Promise<CalendarEvent[]>;
  createEvent(calendarId: string, event: CalendarEventInput): Promise<CalendarEvent>;
  updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEventInput>): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}

interface OneDriveService {
  listFiles(folderId?: string): Promise<DriveItem[]>;
  uploadFile(file: File, folderId?: string): Promise<DriveItem>;
  downloadFile(fileId: string): Promise<Blob>;
  createFolder(name: string, parentId?: string): Promise<DriveItem>;
}
```

---

## 5. Zapier Integration

### Purpose
Connect ATLVS to 5000+ apps via Zapier for custom automation workflows.

### Implementation

#### Triggers (ATLVS → Zapier)
```typescript
// Events that can trigger Zaps
const ZAPIER_TRIGGERS = [
  'registration.created',
  'registration.confirmed',
  'registration.cancelled',
  'contact.created',
  'contact.updated',
  'lead.created',
  'lead.status_changed',
  'deal.created',
  'deal.won',
  'deal.lost',
  'task.created',
  'task.completed',
  'invoice.created',
  'invoice.paid',
  'event.created',
  'event.published',
];
```

#### Actions (Zapier → ATLVS)
```typescript
// Actions Zapier can perform in ATLVS
const ZAPIER_ACTIONS = [
  'contact.create',
  'contact.update',
  'lead.create',
  'lead.update',
  'task.create',
  'registration.create',
  'note.create',
  'tag.add',
];
```

#### Webhook Endpoint
```typescript
// /api/webhooks/zapier/route.ts
export async function POST(request: Request) {
  const { action, data, zapId } = await request.json();
  
  // Validate Zapier signature
  // Execute action
  // Return result
}
```

---

## 6. SendGrid Integration

### Purpose
Transactional email delivery for notifications, confirmations, and marketing campaigns.

### Required Scopes
- Mail Send
- Template Engine
- Event Webhook

### Implementation

#### Environment Variables
```env
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@example.com
SENDGRID_FROM_NAME=ATLVS Platform
```

#### Email Templates
```typescript
// /lib/integrations/sendgrid/templates.ts
const EMAIL_TEMPLATES = {
  registration_confirmation: 'd-xxxxx',
  ticket_delivery: 'd-xxxxx',
  password_reset: 'd-xxxxx',
  invoice_sent: 'd-xxxxx',
  payment_receipt: 'd-xxxxx',
  event_reminder: 'd-xxxxx',
  task_assigned: 'd-xxxxx',
  approval_request: 'd-xxxxx',
};
```

#### Service Interface
```typescript
// /lib/integrations/sendgrid/service.ts
interface SendGridService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendTemplateEmail(to: string, templateId: string, dynamicData: Record<string, unknown>): Promise<void>;
  sendBulkEmail(recipients: EmailRecipient[], templateId: string): Promise<void>;
}
```

---

## 7. Twilio Integration

### Purpose
SMS notifications and voice calls for urgent alerts.

### Implementation

#### Environment Variables
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

#### Service Interface
```typescript
// /lib/integrations/twilio/service.ts
interface TwilioService {
  sendSMS(to: string, message: string): Promise<void>;
  sendBulkSMS(recipients: string[], message: string): Promise<void>;
  makeCall(to: string, twimlUrl: string): Promise<void>;
}
```

---

## 8. QuickBooks Integration

### Purpose
Sync financial data with QuickBooks for accounting.

### Required Scopes
- `com.intuit.quickbooks.accounting`

### Implementation

#### Sync Entities
- Customers ↔ Contacts/Companies
- Invoices ↔ Invoices
- Payments ↔ Payments
- Expenses ↔ Expenses
- Chart of Accounts ↔ GL Accounts

#### Service Interface
```typescript
// /lib/integrations/quickbooks/service.ts
interface QuickBooksService {
  // Customers
  syncCustomer(contactId: string): Promise<void>;
  
  // Invoices
  createInvoice(invoice: InvoiceData): Promise<QBInvoice>;
  syncInvoice(invoiceId: string): Promise<void>;
  
  // Payments
  recordPayment(payment: PaymentData): Promise<QBPayment>;
  
  // Expenses
  createExpense(expense: ExpenseData): Promise<QBExpense>;
  
  // Sync
  fullSync(): Promise<SyncResult>;
  incrementalSync(since: Date): Promise<SyncResult>;
}
```

---

## Integration Architecture

### Connector Base Class
```typescript
// /lib/integrations/base.ts
abstract class IntegrationConnector {
  abstract name: string;
  abstract isConfigured(): boolean;
  abstract testConnection(): Promise<boolean>;
  abstract getAuthUrl?(): string;
  abstract handleCallback?(code: string): Promise<void>;
  abstract disconnect(): Promise<void>;
}
```

### Integration Registry
```typescript
// /lib/integrations/registry.ts
const integrations = {
  stripe: new StripeConnector(),
  slack: new SlackConnector(),
  google: new GoogleConnector(),
  microsoft: new MicrosoftConnector(),
  zapier: new ZapierConnector(),
  sendgrid: new SendGridConnector(),
  twilio: new TwilioConnector(),
  quickbooks: new QuickBooksConnector(),
};
```

### Settings Page
```
/modules/settings/integrations/
├── page.tsx              (Integration dashboard)
├── stripe/page.tsx       (Stripe settings)
├── slack/page.tsx        (Slack settings)
├── google/page.tsx       (Google settings)
├── microsoft/page.tsx    (Microsoft settings)
├── zapier/page.tsx       (Zapier settings)
├── sendgrid/page.tsx     (SendGrid settings)
├── twilio/page.tsx       (Twilio settings)
└── quickbooks/page.tsx   (QuickBooks settings)
```

---

## Next Steps

1. **Stripe** — Implement first (critical for payments)
2. **SendGrid** — Implement second (required for email notifications)
3. **Slack** — Implement third (team notifications)
4. **Google/Microsoft** — Implement fourth (calendar sync)
5. **Zapier** — Implement fifth (automation)
6. **Twilio** — Implement sixth (SMS)
7. **QuickBooks** — Implement last (accounting sync)

---

## Security Considerations

- Store all API keys and secrets in environment variables
- Use OAuth 2.0 for user-authorized integrations
- Implement webhook signature verification
- Log all integration API calls for audit
- Implement rate limiting for outbound API calls
- Use encryption for stored tokens
- Implement token refresh for OAuth integrations
