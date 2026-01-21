# ATLVS Workflow Templates

## Workflow Engine Architecture

### Trigger Types

| Type | Description | Example |
|------|-------------|---------|
| `entity_created` | New record created | Task created |
| `entity_updated` | Record modified | Status changed |
| `entity_deleted` | Record removed | Asset retired |
| `field_changed` | Specific field updated | Priority changed |
| `status_changed` | Status transition | Draft → Published |
| `schedule` | Cron-based trigger | Daily at 9 AM |
| `webhook` | External HTTP call | Stripe payment |
| `manual` | User-initiated | Run report |
| `form_submitted` | Form completion | Application submitted |
| `approval_decision` | Approval action | Expense approved |
| `scan_event` | QR/Barcode scan | Asset checked out |

### Condition Operators

| Operator | Description |
|----------|-------------|
| `equals` | Exact match |
| `not_equals` | Not equal |
| `contains` | String contains |
| `in_list` | Value in array |
| `greater_than` | Numeric comparison |
| `less_than` | Numeric comparison |
| `is_empty` | Null or empty |
| `changed_to` | Field changed to value |
| `changed_from` | Field changed from value |

### Action Types

| Action | Description |
|--------|-------------|
| `update_field` | Modify entity field |
| `create_entity` | Create new record |
| `send_notification` | In-app notification |
| `send_email` | Email via template |
| `send_sms` | SMS notification |
| `assign_user` | Assign to user/team |
| `add_tag` | Add tag to entity |
| `create_task` | Create follow-up task |
| `create_approval_request` | Start approval flow |
| `trigger_webhook` | Call external API |
| `delay` | Wait before next action |
| `branch` | Conditional logic |

---

## Project Management Workflows

### 1. Task Due Reminder

```yaml
id: task_due_reminder
name: Task Due Reminder
trigger:
  type: schedule
  cron: "0 9 * * *"  # Daily 9 AM
conditions:
  - field: status
    operator: not_in
    value: [done, cancelled]
  - field: due_date
    operator: between
    value: [now, now+48h]
actions:
  - type: send_notification
    template: task_due_reminder
    recipients: [assignees]
    channels: [in_app, email]
```

### 2. Task Overdue Escalation

```yaml
id: task_overdue_escalation
name: Task Overdue Escalation
trigger:
  type: schedule
  cron: "0 10 * * *"
conditions:
  - field: due_date
    operator: less_than
    value: now
  - field: status
    operator: not_in
    value: [done, cancelled]
actions:
  - type: add_tag
    value: overdue
  - type: send_notification
    template: task_overdue
    recipients: [assignees, project_manager]
    channels: [in_app, email, slack]
```

### 3. Project Budget Alert

```yaml
id: project_budget_alert
name: Project Budget Threshold Alert
trigger:
  type: field_changed
  entity: budget_line_items
  field: actual_amount
conditions:
  - expression: "(actual_amount / planned_amount) >= 0.8"
actions:
  - type: send_notification
    template: budget_threshold_warning
    recipients: [project_manager, finance_manager]
  - type: create_task
    title: "Review budget for {{project.name}}"
    assignee: finance_manager
```

---

## Live Production Workflows

### 4. Event Phase Transition

```yaml
id: event_phase_transition
name: Event Phase Transition
trigger:
  type: field_changed
  entity: events
  field: phase
actions:
  - type: create_entity
    entity: event_phases
    data:
      event_id: "{{entity.id}}"
      phase: "{{entity.phase}}"
      started_at: now
      transitioned_by: "{{user.id}}"
  - type: send_notification
    template: event_phase_changed
    recipients: [event_team]
    channels: [in_app, email, sms]
  - type: create_task
    template: "phase_checklist_{{entity.phase}}"
```

### 5. Show Call Published

```yaml
id: show_call_published
name: Show Call Published
trigger:
  type: status_changed
  entity: show_calls
  from: draft
  to: published
actions:
  - type: send_notification
    template: show_call_published
    recipients: [crew_assignments]
    channels: [in_app, email, sms, push]
  - type: create_calendar_event
    title: "{{entity.name}}"
    start: "{{entity.date}} {{entity.call_time}}"
    attendees: [crew_assignments]
```

### 6. Runsheet Delay Adjustment

```yaml
id: runsheet_delay_adjustment
name: Runsheet Delay Adjustment
trigger:
  type: field_changed
  entity: runsheet_items
  field: actual_start
conditions:
  - expression: "actual_start > scheduled_time + 5min"
actions:
  - type: update_field
    entity: runsheet_items
    filter: "runsheet_id = {{entity.runsheet_id}} AND position > {{entity.position}}"
    field: scheduled_time
    value: "scheduled_time + ({{entity.actual_start}} - {{entity.scheduled_time}})"
  - type: send_notification
    template: runsheet_delayed
    recipients: [stage_manager, production_manager]
```

---

## Workforce Workflows

### 7. Shift Confirmation Request

```yaml
id: shift_confirmation_request
name: Shift Confirmation Request
trigger:
  type: schedule
  cron: "0 9 * * *"
conditions:
  - field: status
    operator: equals
    value: scheduled
  - field: start_time
    operator: between
    value: [now+48h, now+72h]
actions:
  - type: send_notification
    template: shift_confirmation_request
    recipients: [user_id]
    channels: [in_app, email, push]
    actions:
      - label: Confirm
        action: confirm_shift
      - label: Decline
        action: decline_shift
```

### 8. Timesheet Submission Reminder

```yaml
id: timesheet_submission_reminder
name: Timesheet Submission Reminder
trigger:
  type: schedule
  cron: "0 17 * * 5"  # Friday 5 PM
conditions:
  - field: status
    operator: equals
    value: draft
  - field: period_end
    operator: less_than
    value: now
actions:
  - type: send_notification
    template: timesheet_reminder
    recipients: [user_id]
    channels: [in_app, email]
```

### 9. Certification Expiry Alert

```yaml
id: certification_expiry_alert
name: Certification Expiry Alert
trigger:
  type: schedule
  cron: "0 8 * * 1"  # Monday 8 AM
conditions:
  - field: expiry_date
    operator: between
    value: [now, now+30d]
  - field: status
    operator: equals
    value: active
actions:
  - type: send_notification
    template: certification_expiring
    recipients: [user_id, manager]
    channels: [in_app, email]
  - type: create_task
    title: "Renew {{certification.name}}"
    assignee: "{{user_id}}"
    due_date: "{{expiry_date}}"
```

---

## Asset Management Workflows

### 10. Asset Checkout Approval

```yaml
id: asset_checkout_approval
name: High-Value Asset Checkout Approval
trigger:
  type: entity_created
  entity: asset_check_in_out
  filter: "action_type = 'check_out'"
conditions:
  - field: asset.purchase_price
    operator: greater_than
    value: 5000
actions:
  - type: update_field
    field: status
    value: pending_approval
  - type: create_approval_request
    approvers: [asset_manager]
    type: single_approver
    on_approve:
      - type: update_field
        field: status
        value: approved
    on_reject:
      - type: send_notification
        template: checkout_rejected
        recipients: [user_id]
```

### 11. Asset Overdue Reminder

```yaml
id: asset_overdue_reminder
name: Asset Overdue Reminder
trigger:
  type: schedule
  cron: "0 9 * * *"
conditions:
  - field: expected_return
    operator: less_than
    value: now
  - field: actual_return
    operator: is_empty
actions:
  - type: send_notification
    template: asset_overdue
    recipients: [user_id]
    channels: [in_app, email, sms]
  - type: delay
    duration: 24h
  - type: send_notification
    template: asset_overdue_escalation
    recipients: [user_id, asset_manager]
```

### 12. Maintenance Due Scheduling

```yaml
id: maintenance_due_scheduling
name: Maintenance Due Scheduling
trigger:
  type: schedule
  cron: "0 6 * * *"
conditions:
  - field: next_maintenance_date
    operator: between
    value: [now, now+7d]
actions:
  - type: create_entity
    entity: asset_maintenance
    data:
      asset_id: "{{entity.id}}"
      maintenance_type: preventive
      scheduled_date: "{{entity.next_maintenance_date}}"
      status: scheduled
  - type: send_notification
    template: maintenance_scheduled
    recipients: [maintenance_team]
```

---

## Finance Workflows

### 13. Expense Approval Routing

```yaml
id: expense_approval_routing
name: Expense Approval Routing
trigger:
  type: status_changed
  entity: expenses
  to: submitted
actions:
  - type: branch
    conditions:
      - condition:
          field: amount
          operator: less_than
          value: 500
        action:
          type: create_approval_request
          approvers: [department_head]
          type: single_approver
      - condition:
          field: amount
          operator: less_than
          value: 5000
        action:
          type: create_approval_request
          approvers: [department_head, finance_manager]
          type: sequential_chain
      - condition:
          field: amount
          operator: greater_than
          value: 5000
        action:
          type: create_approval_request
          approvers: [department_head, finance_manager, cfo]
          type: sequential_chain
```

### 14. Invoice Overdue Reminder

```yaml
id: invoice_overdue_reminder
name: Invoice Overdue Reminder
trigger:
  type: schedule
  cron: "0 9 * * *"
conditions:
  - field: due_date
    operator: less_than
    value: now
  - field: status
    operator: in
    value: [sent, viewed, partially_paid]
actions:
  - type: update_field
    field: status
    value: overdue
  - type: send_email
    template: invoice_overdue
    recipients: [contact.email]
  - type: create_task
    title: "Follow up on overdue invoice {{invoice_number}}"
    assignee: account_manager
```

### 15. Purchase Order Approval

```yaml
id: purchase_order_approval
name: Purchase Order Approval
trigger:
  type: entity_created
  entity: purchase_orders
conditions:
  - field: total_amount
    operator: greater_than
    value: 1000
actions:
  - type: create_approval_request
    approvers: [budget_owner, finance_manager]
    type: sequential_chain
    on_approve:
      - type: update_field
        field: status
        value: approved
      - type: send_email
        template: po_to_vendor
        recipients: [vendor.email]
```

---

## Talent Management Workflows

### 16. Booking Confirmation

```yaml
id: booking_confirmation
name: Booking Confirmation Workflow
trigger:
  type: status_changed
  entity: talent_bookings
  to: confirmed
actions:
  - type: create_entity
    entity: contracts
    data:
      contract_type: talent
      talent_id: "{{entity.talent_id}}"
      event_id: "{{entity.event_id}}"
      value: "{{entity.fee_amount}}"
  - type: create_entity
    entity: riders
    data:
      talent_id: "{{entity.talent_id}}"
      booking_id: "{{entity.id}}"
      status: draft
  - type: send_notification
    template: booking_confirmed
    recipients: [talent_agent, production_manager]
```

### 17. Rider Review Routing

```yaml
id: rider_review_routing
name: Rider Review Routing
trigger:
  type: status_changed
  entity: riders
  to: submitted
actions:
  - type: create_approval_request
    approvers: [production_manager, technical_director]
    type: parallel_chain
    on_approve:
      - type: update_field
        field: status
        value: approved
      - type: send_notification
        template: rider_approved
        recipients: [talent_agent]
```

### 18. Payment Due Reminder

```yaml
id: talent_payment_reminder
name: Talent Payment Due Reminder
trigger:
  type: schedule
  cron: "0 9 * * *"
conditions:
  - field: due_date
    operator: between
    value: [now, now+7d]
  - field: status
    operator: equals
    value: pending
actions:
  - type: send_notification
    template: payment_due_reminder
    recipients: [finance_manager]
  - type: create_task
    title: "Process payment for {{talent.name}}"
    assignee: accounts_payable
    due_date: "{{due_date}}"
```

---

## Experience Management Workflows

### 19. Ticket Purchase Confirmation

```yaml
id: ticket_purchase_confirmation
name: Ticket Purchase Confirmation
trigger:
  type: entity_created
  entity: tickets
  filter: "status = 'purchased'"
actions:
  - type: send_email
    template: ticket_confirmation
    recipients: [attendee_email]
    attachments: [ticket_pdf, calendar_invite]
  - type: update_field
    entity: ticket_types
    field: quantity_sold
    value: "quantity_sold + 1"
```

### 20. Guest Check-In Notification

```yaml
id: guest_checkin_notification
name: Guest Check-In Notification
trigger:
  type: status_changed
  entity: guest_list_entries
  to: checked_in
actions:
  - type: send_notification
    template: guest_arrived
    recipients: [guest_list.owner_id]
    channels: [push, in_app]
```

### 21. Hospitality Fulfillment

```yaml
id: hospitality_fulfillment
name: Hospitality Request Fulfillment
trigger:
  type: entity_created
  entity: hospitality_requests
actions:
  - type: branch
    conditions:
      - condition:
          field: request_type
          operator: equals
          value: accommodation
        action:
          type: assign_user
          role: travel_coordinator
      - condition:
          field: request_type
          operator: equals
          value: transportation
        action:
          type: assign_user
          role: logistics_coordinator
      - condition:
          field: request_type
          operator: equals
          value: catering
        action:
          type: assign_user
          role: hospitality_manager
  - type: send_notification
    template: hospitality_request_assigned
    recipients: [assigned_to]
```

---

## Approval Workflow Types

| Type | Description | Use Case |
|------|-------------|----------|
| `single_approver` | One person approves | Low-value expenses |
| `any_of_list` | Any one from list | Team lead approval |
| `all_of_list` | All must approve | Contract signing |
| `sequential_chain` | Ordered approvals | Budget approval |
| `parallel_chain` | Simultaneous review | Technical review |
| `manager_hierarchy` | Up the org chart | PTO requests |
| `role_based` | By role assignment | Department approval |
