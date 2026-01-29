# Workflow Engine Documentation

## Overview

The ATLVS Workflow Engine provides a comprehensive automation system for business processes across all domains. It supports 116 pre-built workflow templates spanning 9 categories.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Engine                          │
├─────────────────────────────────────────────────────────────┤
│  WorkflowService     │  WorkflowEngine    │  ActionHandlers │
│  - CRUD operations   │  - Step execution  │  - 25+ handlers │
│  - Template mgmt     │  - Condition eval  │  - DB operations│
│  - Scheduling        │  - Variable interp │  - Integrations │
├─────────────────────────────────────────────────────────────┤
│  NotificationService │  IntegrationManager                  │
│  - 30+ templates     │  - Email (SendGrid)                  │
│  - Multi-channel     │  - SMS (Twilio)                      │
│  - Template render   │  - Push (Firebase)                   │
└─────────────────────────────────────────────────────────────┘
```

## Step Types

| Type | Description |
|------|-------------|
| `action` | Execute database operations or custom logic |
| `condition` | Branch based on expression evaluation |
| `notification` | Send notifications via email/SMS/push/Slack |
| `delay` | Wait for specified duration |
| `loop` | Iterate over collections |
| `parallel` | Execute branches concurrently |
| `http` | Make external API calls |
| `transform` | Transform data between steps |
| `approval` | Request human approval |

## Action Types

### Core Database Actions
- `query` - Query entities with filters
- `createEntity` - Create new records
- `updateEntity` - Update existing records
- `deleteEntity` - Delete records
- `bulkUpdate` - Batch update operations
- `bulkCreate` - Batch create operations

### Lead/CRM Actions
- `calculateLeadScore` - Score leads based on engagement
- `enrichCompanyData` - Enrich company information
- `assignLead` - Assign leads to sales reps
- `createDealFromLead` - Convert leads to deals

### Email/Campaign Actions
- `sendEmail` - Send transactional emails
- `createEmailCampaign` - Create marketing campaigns
- `trackEmailEvent` - Track email engagement

### Support/Ticket Actions
- `categorizeTicket` - Auto-categorize support tickets
- `determineTicketPriority` - Set priority based on customer tier
- `findAvailableAgent` - Route to available agents
- `findTicketsAtSLARisk` - Identify SLA breach risks
- `findDuplicateTickets` - Detect duplicate tickets

### Document/Knowledge Actions
- `generateDocument` - Generate documents from templates
- `searchKnowledgeBase` - Search knowledge articles

### Approval Actions
- `createApprovalRequest` - Create approval workflows
- `processApprovalDecision` - Handle approval responses

### Notification Actions
- `sendPushNotification` - Send push notifications
- `sendSMS` - Send SMS messages

### Utility Actions
- `scheduleWorkflow` - Schedule future workflow execution
- `sendCalendarInvite` - Send calendar invitations
- `checkBudgetUtilization` - Check budget status

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Integration Adapters (Optional)
```env
# Email - SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS - Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Push Notifications - Firebase
FIREBASE_SERVER_KEY=your_firebase_server_key

# Slack
SLACK_BOT_TOKEN=your_slack_bot_token
```

## Database Tables

The workflow engine requires the following tables (created via migration):

### Core Tables
- `workflows` - Workflow definitions
- `workflow_executions` - Execution history
- `scheduled_workflows` - Scheduled triggers

### Supporting Tables
- `leads` - Lead management
- `deals` - Deal/opportunity tracking
- `support_tickets` - Support ticket management
- `email_campaigns` - Email campaign management
- `email_logs` - Email send history
- `email_events` - Email engagement tracking
- `approval_requests` - Approval workflow requests
- `approval_decisions` - Approval decisions
- `knowledge_base_articles` - Knowledge base content
- `push_notifications` - Push notification logs
- `sms_logs` - SMS message logs

## Usage

### Creating a Workflow from Template

```typescript
import { WorkflowService } from '@/lib/workflow-engine';

const service = new WorkflowService();

// Get available templates
const templates = service.getTemplates();

// Create workflow from template
const workflow = await service.createFromTemplate(
  'lead-scoring-automation',
  organizationId,
  userId
);
```

### Executing a Workflow

```typescript
// Execute workflow with input data
const execution = await service.executeWorkflow(workflowId, {
  leadId: 'lead_123',
  source: 'website'
});

// Check execution status
const status = await service.getExecution(execution.id);
```

### Registering Custom Action Handlers

```typescript
import { registerActionHandler } from '@/lib/workflow-engine';

registerActionHandler('customAction', async (params, context) => {
  // Custom logic here
  return { success: true, result: 'custom result' };
});
```

## UI Components

### WorkflowTemplateSelector
Browse and select from 116 workflow templates organized by category.

### WorkflowBuilder
Visual workflow configuration with:
- Trigger configuration (manual, scheduled, event-based)
- Step management (add, remove, reorder)
- Step configuration by type

### WorkflowExecutionMonitor
Real-time monitoring with:
- Execution status and progress
- Step-by-step execution details
- Auto-refresh capability

## Template Categories

| Category | Count | Description |
|----------|-------|-------------|
| Sales/CRM | 10 | Lead management, deal tracking |
| Marketing | 12 | Campaigns, nurturing, analytics |
| Finance | 12 | Invoicing, budgets, approvals |
| Procurement | 10 | Purchase orders, vendors |
| HR/Workforce | 16 | Onboarding, reviews, scheduling |
| Projects | 13 | Task management, milestones |
| Production/Events | 20 | Event planning, logistics |
| Support | 8 | Ticket routing, SLA management |
| Compliance | 10 | Audits, certifications, incidents |

## Best Practices

1. **Use Templates**: Start with pre-built templates and customize
2. **Test First**: Use draft status to test workflows before activation
3. **Monitor Executions**: Regularly check execution logs for failures
4. **Handle Errors**: Implement error handling in custom action handlers
5. **Use Variables**: Leverage context variables for dynamic data
6. **Optimize Queries**: Use filters to limit data in query actions
