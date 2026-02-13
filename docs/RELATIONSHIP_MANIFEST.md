# Database ↔ Frontend Relationship Manifest

> **Auto-generated** from frontend schema definitions.
> This document serves as the Single Source of Truth for all entity relationships
> declared in the frontend schema layer, ensuring DB ↔ frontend synchronization.

## Summary

| Metric | Count |
|--------|-------|
| Schemas with relationships | 152 |
| Total belongsTo declarations | 234 |
| Total hasMany declarations | 26 |
| Total relation field configs | 224 |

## ON DELETE Cascade Policy

| Data Category | ON DELETE Action | Rationale |
|---------------|-----------------|-----------|
| Financial (invoices, payments, journals, settlements, payroll) | `RESTRICT` | Immutable financial records — cannot be orphaned or deleted |
| Compliance (audit logs, credentials, certificates) | `RESTRICT` | Regulatory retention requirements |
| Organization-scoped child records | `CASCADE` | Tenant isolation — org deletion removes all child data |
| Optional references (assigned_to, approved_by, etc.) | `SET NULL` | Preserve record when referenced user is removed |
| Owned child records (line items, phases, fulfillment stages) | `CASCADE` | Parent deletion removes dependent children |

## Entity Relationship Details

### `Accommodation`

**File:** `src/lib/schemas/accommodation.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `booking_id` | `resourceBooking` | Booking |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `resourceBooking` | `name` |
| `booking_id` | `resourceBooking` | `name` |

---

### `Activity`

**File:** `src/lib/schemas/activityFeed.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `user` | `name` |

---

### `Approval`

**File:** `src/lib/schemas/approval.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `assigned_to` | `user` | Assigned To |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `requested_by` | `user` | `full_name` |
| `assigned_to` | `user` | `full_name` |

---

### `Approval Request`

**File:** `src/lib/schemas/expenseApproval.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `expense` | `description` |
| `submittedBy` | `user` | `full_name` |

---

### `Asset`

**File:** `src/lib/schemas/asset.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `warehouse_location_id` | `storageBin` | Warehouse Bin |
| `assigned_to` | `user` | Assigned To |
| `catalog_item_id` | `catalogItem` | Catalog Item |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `assetMaintenance` | `asset_id` | Maintenance Records | `delete` |
| `reservation` | `asset_id` | Reservations | `nullify` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `insurance_policy_id` | `insurancePolicy` | `policy_number` |
| `assigned_to` | `user` | `full_name` |

---

### `Asset Transfer`

**File:** `src/lib/schemas/assetTransfer.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `asset_id` | `asset` | Asset |
| `approved_by` | `user` | Approved By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `asset_id` | `asset` | `name` |
| `requested_by` | `user` | `full_name` |
| `approved_by` | `user` | `full_name` |

---

### `AssetAuditLog`

**File:** `src/lib/schemas/assetAuditLog.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `asset_id` | `asset` | Asset |

---

### `AssetKit`

**File:** `src/lib/schemas/asset_kit.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `category_id` | `category` | Category |
| `template_id` | `template` | Template |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `category_id` | `category` | `name` |

---

### `Bank Account`

**File:** `src/lib/schemas/bankAccount.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `currency_id` | `currency` | Currency |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `gl_account_id` | `chart_of_account` | `name` |

---

### `Bank Connection`

**File:** `src/lib/schemas/bankConnection.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `bankAccountId` | `bankAccount` | Bank Account |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `bankAccountId` | `bankAccount` | `name` |

---

### `Budget Phase`

**File:** `src/lib/schemas/budgetPhase.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `budget_id` | `budget` | Budget |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `budget` | `name` |

---

### `Catering Order`

**File:** `src/lib/schemas/catering.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `booking_id` | `resourceBooking` | Booking |
| `vendor_id` | `company` | Vendor |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `booking_id` | `company` | `name` |
| `vendor_id` | `company` | `name` |

---

### `Certificate of Insurance`

**File:** `src/lib/schemas/certificateOfInsurance.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `company_id` | `company` | Company |
| `vendor_id` | `company` | Vendor |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `company_id` | `company` | `name` |
| `vendor_id` | `company` | `name` |

---

### `Checklist`

**File:** `src/lib/schemas/checklist.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `assigned_to` | `user` | Assigned To |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `assigned_to` | `user` | `full_name` |

---

### `Client Portal Access`

**File:** `src/lib/schemas/clientPortalAccess.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `company_id` | `company` | Company |
| `contact_id` | `contact` | Contact |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `contact_id` | `contact` | `name` |

---

### `Clock Entry`

**File:** `src/lib/schemas/clockEntry.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `employee_id` | `employeeProfile` | Employee |
| `shift_id` | `shift` | Shift |
| `approved_by_id` | `user` | Approved By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `user_profile` | `headline` |
| `shift_id` | `user_profile` | `headline` |
| `approved_by_id` | `user_profile` | `headline` |

---

### `Connection`

**File:** `src/lib/schemas/connection.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `requestee_id` | `user` | `name` |

---

### `Credit Note`

**File:** `src/lib/schemas/creditNote.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `invoice_id` | `invoice` | Invoice |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `invoice_id` | `invoice` | `invoice_number` |

---

### `Crew Call`

**File:** `src/lib/schemas/crewCall.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `Crew Rating`

**File:** `src/lib/schemas/crewGigRating.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `employee_id` | `employeeProfile` | Employee |
| `project_id` | `project` | Project |
| `rated_by` | `user` | Rated By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `project_id` | `projects` | `name` |
| `rated_by` | `user` | `full_name` |

---

### `Daily Report`

**File:** `src/lib/schemas/dailyReport.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `Document`

**File:** `src/lib/schemas/document.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `folder_id` | `folder` | Folder |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `folder_id` | `folder` | `name` |

---

### `Earned Badge`

**File:** `src/lib/schemas/gamification.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `user` | `name` |
| `badge_id` | `badge` | `name` |

---

### `Email`

**File:** `src/lib/schemas/emailMessage.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `contact_id` | `contact` | Contact |
| `company_id` | `company` | Company |
| `deal_id` | `deal` | Deal |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `contact_id` | `deal` | `name` |
| `company_id` | `deal` | `name` |
| `deal_id` | `deal` | `name` |

---

### `Feedback`

**File:** `src/lib/schemas/feedback.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `Fiscal Year`

**File:** `src/lib/schemas/fiscalYear.ts`

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `financial_periods` | `fiscal_year_id` | Periods | `none` |

---

### `Flight`

**File:** `src/lib/schemas/flight.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `booking_id` | `resourceBooking` | Booking |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `resourceBooking` | `name` |
| `booking_id` | `resourceBooking` | `name` |

---

### `Follow`

**File:** `src/lib/schemas/userFollow.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `user` | `name` |

---

### `Ground Transport`

**File:** `src/lib/schemas/groundTransport.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `booking_id` | `resourceBooking` | Booking |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `resourceBooking` | `name` |
| `booking_id` | `resourceBooking` | `name` |

---

### `Guest List`

**File:** `src/lib/schemas/guestList.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `Hospitality Request`

**File:** `src/lib/schemas/hospitalityRequest.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `contact_id` | `contact` | Contact |
| `vendor_id` | `company` | Vendor |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `event` | `name` |
| `contact_id` | `contact` | `full_name` |
| `vendor_id` | `company` | `name` |

---

### `Inbox Item`

**File:** `src/lib/schemas/inboxItem.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `from_user_id` | `user` | `full_name` |
| `user_id` | `user` | `full_name` |

---

### `Invoice Line Item`

**File:** `src/lib/schemas/invoiceLineItem.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `invoice_id` | `invoice` | Invoice |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `invoice` | `invoice_number` |
| `budget_category_id` | `budget_category` | `name` |

---

### `Issued Credential`

**File:** `src/lib/schemas/issuedCredential.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `holder_contact_id` | `contact` | `full_name` |
| `issued_by_user_id` | `profile` | `full_name` |

---

### `Journal Entry`

**File:** `src/lib/schemas/journalEntry.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `fiscal_period_id` | `fiscal_period` | `name` |
| `posted_by_user_id` | `profile` | `full_name` |

---

### `KitItem`

**File:** `src/lib/schemas/kitItem.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `kit_id` | `kit` | Kit |
| `asset_id` | `asset` | Asset |
| `category_id` | `category` | Category |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `asset_id` | `category` | `name` |
| `category_id` | `category` | `name` |

---

### `Landing Page`

**File:** `src/lib/schemas/landingPage.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `campaign_id` | `campaign` | Campaign |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `campaign_id` | `form_template` | `name` |
| `form_id` | `form_template` | `name` |

---

### `Leave Request`

**File:** `src/lib/schemas/leaveRequest.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `staff_member_id` | `staffMember` | Employee |
| `leave_type_id` | `leaveType` | Leave Type |
| `approver_id` | `staffMember` | Approver |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `leave_type_id` | `leave_type` | `name` |
| `approver_id` | `user` | `full_name` |

---

### `MaintenanceRecord`

**File:** `src/lib/schemas/maintenance.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `asset_id` | `asset` | Asset |

---

### `Media Asset`

**File:** `src/lib/schemas/mediaAsset.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `project_id` | `project` | Project |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `project_id` | `project` | `name` |

---

### `Meeting`

**File:** `src/lib/schemas/meetingBooking.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `meeting_type_id` | `meetingType` | Meeting Type |
| `contact_id` | `contact` | Contact |
| `company_id` | `company` | Company |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `meeting_type_id` | `meetingType` | `name` |
| `contact_id` | `deal` | `name` |
| `company_id` | `deal` | `name` |
| `deal_id` | `deal` | `name` |

---

### `Message`

**File:** `src/lib/schemas/message.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `conversation_id` | `conversation` | Conversation |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `conversation` | `id` |
| `sender_id` | `user` | `name` |

---

### `Milestone`

**File:** `src/lib/schemas/challengeMilestone.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `challenge_id` | `challenge` | Challenge |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `challenge` | `title` |

---

### `Networking Session`

**File:** `src/lib/schemas/networkingSession.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `event` | `name` |
| `venue_space_id` | `venue_space` | `name` |

---

### `Notification`

**File:** `src/lib/schemas/notification.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `user_id` | `user` | `full_name` |

---

### `OAuth Connection`

**File:** `src/lib/schemas/oauthConnection.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `people` | `name` |

---

### `Offboarding Template`

**File:** `src/lib/schemas/offboardingTemplate.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `department_id` | `department` | Department |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `position_type_id` | `department` | `name` |
| `department_id` | `department` | `name` |

---

### `Onboarding Template`

**File:** `src/lib/schemas/onboardingTemplate.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `department_id` | `department` | Department |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `employment_type_id` | `employment_type` | `name` |

---

### `Open Shift`

**File:** `src/lib/schemas/shiftSwap.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `shift` | `name` |
| `claimedBy` | `employee_profile` | `full_name` |

---

### `Organization Unit`

**File:** `src/lib/schemas/orgUnit.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `parent_id` | `user_profile` | `name` |
| `head_id` | `user_profile` | `headline` |

---

### `PackingList`

**File:** `src/lib/schemas/packingList.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `shipment_id` | `event` | `name` |
| `event_id` | `event` | `name` |

---

### `PackingListItem`

**File:** `src/lib/schemas/packingList.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `asset_id` | `asset` | `name` |

---

### `Participant`

**File:** `src/lib/schemas/challengeParticipant.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `challenge_id` | `challenge` | Challenge |
| `user_id` | `user` | User |
| `team_id` | `team` | Team |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `challenge` | `title` |
| `user_id` | `user` | `name` |
| `team_id` | `team` | `name` |

---

### `Partner`

**File:** `src/lib/schemas/partner.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `company_id` | `company` | Company |
| `contract_id` | `contract` | Contract |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `status_id` | `contract` | `name` |
| `contract_id` | `contract` | `name` |

---

### `Payment Milestone`

**File:** `src/lib/schemas/paymentMilestone.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `budget_id` | `budget` | Budget |
| `invoice_id` | `invoice` | Invoice |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `budget` | `name` |
| `invoice_id` | `invoice` | `invoice_number` |

---

### `Payroll Run`

**File:** `src/lib/schemas/payrollRun.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `approved_by_id` | `user` | Approved By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `approved_by_id` | `user` | `full_name` |

---

### `Performance Review`

**File:** `src/lib/schemas/performanceReview.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `employee_id` | `employeeProfile` | Employee |
| `reviewer_id` | `user` | Reviewer |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `reviewer_id` | `user` | `full_name` |

---

### `Points`

**File:** `src/lib/schemas/gamification.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `user` | `name` |

---

### `Post-Mortem`

**File:** `src/lib/schemas/projectPostMortem.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `project_id` | `project` | Project |
| `facilitator_id` | `user` | Facilitator |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `projects` | `name` |
| `facilitator_id` | `user` | `full_name` |

---

### `Project Resource`

**File:** `src/lib/schemas/projectResource.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `project_id` | `project` | Project |
| `contact_id` | `contact` | Contact |
| `budget_id` | `budget` | Budget |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `contact_id` | `contact` | `full_name` |
| `budget_id` | `budget` | `name` |

---

### `Project Template`

**File:** `src/lib/schemas/projectTemplate.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `budget_template_id` | `budget_template` | `name` |

---

### `Punch List`

**File:** `src/lib/schemas/punchList.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `venue_id` | `venue` | Venue |
| `assigned_to` | `user` | Assigned To |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `venue` | `name` |
| `venue_id` | `venue` | `name` |
| `assigned_to` | `user` | `full_name` |

---

### `Purchase Order`

**File:** `src/lib/schemas/purchaseOrder.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `vendor_id` | `company` | Vendor |
| `event_id` | `event` | Event |
| `project_id` | `project` | Project |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `purchaseOrderItem` | `purchase_order_id` | Line Items | `delete` |
| `goodsReceipt` | `purchase_order_id` | Receipts | `restrict` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `project` | `name` |
| `project_id` | `project` | `name` |
| `billing_address_id` | `currency` | `code` |
| `currency_id` | `currency` | `code` |
| `approved_by_user_id` | `profile` | `full_name` |

---

### `Quote`

**File:** `src/lib/schemas/quote.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `clientId` | `company` | Client |
| `contactId` | `contact` | Contact |
| `projectId` | `project` | Project |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `projectId` | `event` | `name` |
| `eventId` | `event` | `name` |
| `convertedInvoiceId` | `invoice` | `invoice_number` |

---

### `RFP Response`

**File:** `src/lib/schemas/rfpResponse.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `deal_id` | `deal` | Deal |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `deal_id` | `deal` | `name` |
| `response_document_id` | `documents` | `name` |

---

### `Rate Card`

**File:** `src/lib/schemas/crewRateCard.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `employee_id` | `employeeProfile` | Employee |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `people` | `name` |

---

### `Reaction`

**File:** `src/lib/schemas/reaction.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `user` | `name` |
| `views` | `user` | `name` |

---

### `Receipt Scan`

**File:** `src/lib/schemas/receiptScan.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `expenseId` | `expense` | Expense |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `expenseId` | `expense` | `description` |

---

### `Recurring Invoice`

**File:** `src/lib/schemas/recurringInvoice.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `clientId` | `company` | Client |
| `projectId` | `project` | Project |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `clientId` | `company` | `name` |
| `projectId` | `project` | `name` |

---

### `Reply`

**File:** `src/lib/schemas/discussionReply.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `discussion_id` | `discussion` | Discussion |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `discussion` | `title` |
| `parent_reply_id` | `discussionReply` | `id` |
| `author_id` | `user` | `name` |

---

### `Resource Booking`

**File:** `src/lib/schemas/resourceBooking.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |
| `contact_id` | `contact` | Contact |
| `project_id` | `project` | Project |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `deal` | `name` |
| `deal_id` | `deal` | `name` |
| `budget_id` | `labor_rule_set` | `name` |
| `labor_rule_set_id` | `labor_rule_set` | `name` |

---

### `Saved View`

**File:** `src/lib/schemas/savedView.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `user_id` | `user` | `full_name` |

---

### `Service History`

**File:** `src/lib/schemas/serviceHistory.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `asset_id` | `asset` | Asset |
| `vendor_id` | `company` | Vendor |
| `work_order_id` | `workOrder` | Work Order |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `performed_by` | `company` | `name` |
| `vendor_id` | `company` | `name` |
| `work_order_id` | `workOrder` | `work_order_number` |

---

### `Service Ticket`

**File:** `src/lib/schemas/serviceTicket.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `contact_id` | `contact` | Contact |
| `assigned_to_id` | `user` | Assigned To |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `contact_id` | `contact` | `full_name` |
| `assigned_to_id` | `user` | `full_name` |
| `related_order_id` | `order` | `order_number` |

---

### `Session`

**File:** `src/lib/schemas/eventSession.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `track_id` | `venue_space` | `name` |
| `venue_space_id` | `venue_space` | `name` |
| `status_id` | `status` | `name` |

---

### `Shift Swap Request`

**File:** `src/lib/schemas/shiftSwap.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `targetEmployeeId` | `employee_profile` | `full_name` |

---

### `Stage`

**File:** `src/lib/schemas/stage.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `venue_id` | `venue` | Venue |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `venue` | `name` |
| `venue_id` | `venue` | `name` |

---

### `Storage Bin`

**File:** `src/lib/schemas/storageBin.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `warehouse_id` | `warehouse` | Warehouse |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `warehouse_id` | `warehouse` | `name` |

---

### `Submission`

**File:** `src/lib/schemas/challengeSubmission.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `challenge_id` | `challenge` | Challenge |
| `participant_id` | `challengeParticipant` | Participant |
| `milestone_id` | `milestone` | Milestone |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `challenge` | `title` |
| `participant_id` | `challengeParticipant` | `user_id` |
| `milestone_id` | `challengeMilestone` | `title` |
| `reviewer_id` | `user` | `name` |

---

### `Support Ticket`

**File:** `src/lib/schemas/supportTicket.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `contact_id` | `contact` | Contact |
| `company_id` | `company` | Company |
| `category_id` | `category` | Category |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `category_id` | `ticket_category` | `name` |
| `assigned_to_user_id` | `team` | `name` |
| `assigned_team_id` | `team` | `name` |
| `event_id` | `registration` | `confirmation_number` |
| `registration_id` | `registration` | `confirmation_number` |

---

### `Talent Booking`

**File:** `src/lib/schemas/talentBooking.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `stage_id` | `stage` | Stage |
| `contract_id` | `contract` | Contract |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `stage` | `name` |
| `stage_id` | `stage` | `name` |
| `contract_id` | `rider` | `name` |
| `rider_id` | `rider` | `name` |

---

### `Task`

**File:** `src/lib/schemas/task.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `project_id` | `projects` | Project |
| `list_id` | `task_lists` | List |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `task_assignments` | `task_id` | Assignees | `none` |
| `task_dependencies` | `task_id` | Dependencies | `none` |
| `time_entries` | `task_id` | Time Entries | `none` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `assignee_id` | `project` | `name` |
| `project_id` | `project` | `name` |
| `list_id` | `taskList` | `name` |

---

### `Task Dependency`

**File:** `src/lib/schemas/taskDependency.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `task_id` | `task` | Task |

---

### `Ticket Type`

**File:** `src/lib/schemas/ticketType.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `currency_id` | `currency` | Currency |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |
| `currency_id` | `currency` | `code` |
| `registration_type_id` | `registration_type` | `name` |

---

### `Time Entry`

**File:** `src/lib/schemas/timePunch.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `eventId` | `event` | `name` |

---

### `Time Punch`

**File:** `src/lib/schemas/timePunch.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `employee_profile` | `full_name` |
| `eventId` | `venue` | `name` |
| `venueId` | `venue` | `name` |

---

### `Timer Session`

**File:** `src/lib/schemas/timerSession.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |
| `project_id` | `project` | Project |
| `task_id` | `task` | Task |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `task_id` | `event` | `name` |
| `event_id` | `event` | `name` |
| `time_entry_id` | `timeEntry` | `description` |

---

### `Training Assignment`

**File:** `src/lib/schemas/trainingAssignment.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `user_id` | `user` | `name` |
| `assigned_by` | `user` | `full_name` |

---

### `Training Program`

**File:** `src/lib/schemas/trainingProgram.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `certification_type_id` | `certification_type` | `name` |

---

### `WarehouseLocation`

**File:** `src/lib/schemas/warehouseLocation.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `warehouse_id` | `warehouse` | Warehouse |

---

### `Workflow Run`

**File:** `src/lib/schemas/workflowRun.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `workflow_id` | `workflow` | Workflow |

---

### `Workflow Trigger`

**File:** `src/lib/schemas/workflowTrigger.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `workflow_id` | `workflow` | Workflow |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `workflow_id` | `workflow` | `name` |

---

### `advanceCategory`

**File:** `src/lib/schemas/advancing.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `parent_category_id` | `advanceCategory` | Parent Category |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `advanceItem` | `category_id` | Items | `nullify` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `parent_category_id` | `category` | `name` |

---

### `advanceItem`

**File:** `src/lib/schemas/advancing.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `production_advance_id` | `productionAdvance` | Advance |
| `category_id` | `advanceCategory` | Category |
| `vendor_id` | `company` | Vendor |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `advanceItemFulfillment` | `advance_item_id` | Fulfillment Stages | `delete` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `vendor_id` | `company` | `name` |
| `assigned_to` | `user` | `full_name` |

---

### `advanceItemFulfillment`

**File:** `src/lib/schemas/advancing.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `advance_item_id` | `advanceItem` | Advance Item |
| `assigned_to` | `user` | Assigned To |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `data` | `advanceItem` | `name` |
| `assigned_to` | `user` | `full_name` |

---

### `advancingCatalogItem`

**File:** `src/lib/schemas/advancing.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `category_id` | `advanceCategory` | Category |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `category_id` | `advanceCategory` | `name` |

---

### `backlog`

**File:** `src/lib/schemas/backlog.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `projectId` | `project` | Project |

---

### `board`

**File:** `src/lib/schemas/board.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `projectId` | `project` | Project |

---

### `budget`

**File:** `src/lib/schemas/budget.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `project_id` | `project` | Project |
| `event_id` | `event` | Event |
| `department_id` | `department` | Department |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `budgetLineItem` | `budget_id` | Line Items | `delete` |
| `budgetPhase` | `budget_id` | Phases | `delete` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `parent_budget_id` | `department` | `name` |
| `department_id` | `department` | `name` |

---

### `campaign`

**File:** `src/lib/schemas/campaign.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `template_id` | `template` | Template |
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `template_id` | `template` | `name` |
| `event_id` | `event` | `name` |

---

### `chart_of_account`

**File:** `src/lib/schemas/chartOfAccounts.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `parent_account_id` | `chart_of_account` | `name` |

---

### `checkInOut`

**File:** `src/lib/schemas/checkInOut.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `assetId` | `asset` | Asset |
| `eventId` | `event` | Event |

---

### `checkpoint`

**File:** `src/lib/schemas/checkpoint.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `venueId` | `venue` | Venue |
| `zoneId` | `zone` | Zone |

---

### `company`

**File:** `src/lib/schemas/company.ts`

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `contact` | `company_id` | Contacts | `nullify` |
| `deal` | `company_id` | Deals | `nullify` |
| `project` | `client_id` | Projects | `restrict` |

---

### `contact`

**File:** `src/lib/schemas/contact.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `company_id` | `company` | Company |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `deal` | `contact_id` | Deals | `nullify` |
| `invoice` | `contact_id` | Invoices | `nullify` |
| `registration` | `contact_id` | Registrations | `nullify` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `companyId` | `company` | `name` |

---

### `contract`

**File:** `src/lib/schemas/contract.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `companyId` | `company` | Company |
| `dealId` | `deal` | Deal |

---

### `credential`

**File:** `src/lib/schemas/credential.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

---

### `crew_checkin`

**File:** `src/lib/schemas/crewCheckin.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `shift_id` | `shift` | Shift |
| `department_id` | `department` | Department |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `shift_id` | `department` | `name` |
| `department_id` | `department` | `name` |

---

### `deal`

**File:** `src/lib/schemas/deal.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `company_id` | `company` | Company |
| `contact_id` | `contact` | Contact |
| `pipeline_id` | `pipeline` | Pipeline |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `venueHold` | `deal_id` | Venue Holds | `delete` |
| `proposal` | `deal_id` | Proposals | `delete` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `company_id` | `pipeline` | `name` |
| `pipeline_id` | `pipeline` | `name` |
| `referral_contact_id` | `contact` | `full_name` |
| `converted_project_id` | `project` | `name` |

---

### `equipment_tracking`

**File:** `src/lib/schemas/equipmentTracking.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |
| `zone_id` | `user` | `full_name` |
| `assigned_to_id` | `user` | `full_name` |

---

### `escalation_chain`

**File:** `src/lib/schemas/escalationChain.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `venue_id` | `venue` | Venue |
| `created_by_id` | `user` | Created By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `venue` | `name` |
| `venue_id` | `venue` | `name` |
| `created_by_id` | `user` | `full_name` |

---

### `event`

**File:** `src/lib/schemas/event.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `venueId` | `venue` | Venue |
| `clientId` | `company` | Client |

---

### `exhibitor`

**File:** `src/lib/schemas/exhibitor.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `contact_id` | `contact` | Contact |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `contact_id` | `contact` | `full_name` |

---

### `expense`

**File:** `src/lib/schemas/expense.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `projectId` | `project` | Project |
| `eventId` | `event` | Event |

---

### `floorPlan`

**File:** `src/lib/schemas/floorPlan.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `venueId` | `venue` | Venue |

---

### `incident`

**File:** `src/lib/schemas/incident.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |
| `venueId` | `venue` | Venue |
| `reported_by_id` | `user` | Reported By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `eventId` | `venue` | `name` |
| `venueId` | `venue` | `name` |
| `reported_by_id` | `user` | `full_name` |
| `assigned_to_id` | `user` | `full_name` |

---

### `inspection`

**File:** `src/lib/schemas/inspection.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `work_order_id` | `workOrder` | Work Order |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `workOrder` | `work_order_number` |
| `work_order_id` | `workOrder` | `work_order_number` |

---

### `invoice`

**File:** `src/lib/schemas/invoice.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `company_id` | `company` | Client / Company |
| `contact_id` | `contact` | Billing Contact |
| `project_id` | `project` | Project |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `invoiceLineItem` | `invoice_id` | Line Items | `delete` |
| `payment` | `invoice_id` | Payments | `restrict` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `project_id` | `event` | `name` |
| `event_id` | `event` | `name` |

---

### `kit`

**File:** `src/lib/schemas/kit.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `categoryId` | `category` | Category |

---

### `lead`

**File:** `src/lib/schemas/lead.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `contactId` | `contact` | Contact |
| `companyId` | `company` | Company |

---

### `payment`

**File:** `src/lib/schemas/payment.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `invoiceId` | `invoice` | Invoice |

---

### `permit`

**File:** `src/lib/schemas/permit.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `venue_id` | `venue` | Venue |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `venue` | `name` |
| `venue_id` | `venue` | `name` |

---

### `position`

**File:** `src/lib/schemas/position.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `departmentId` | `department` | Department |

---

### `production`

**File:** `src/lib/schemas/production.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `client_id` | `company` | Client |
| `venue_id` | `venue` | Venue |
| `project_id` | `project` | Project |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `venue_id` | `project` | `name` |
| `project_id` | `project` | `name` |

---

### `productionAdvance`

**File:** `src/lib/schemas/advancing.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `assigned_to` | `user` | Assigned To |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `advanceItem` | `production_advance_id` | Items | `delete` |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |
| `assigned_to` | `user` | `full_name` |

---

### `project`

**File:** `src/lib/schemas/project.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `client_id` | `company` | Client |
| `venue_id` | `venue` | Venue |

**hasMany:**

| Target Entity | Foreign Key | Label | Cascade |
|---------------|-------------|-------|---------|
| `task` | `project_id` | Tasks | `delete` |
| `budget` | `project_id` | Budgets | `delete` |
| `timeEntry` | `project_id` | Time Entries | `delete` |

---

### `proposal`

**File:** `src/lib/schemas/proposal.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `dealId` | `deal` | Deal |
| `companyId` | `company` | Company |

---

### `punch_item`

**File:** `src/lib/schemas/punchItem.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `work_order_id` | `workOrder` | Work Order |
| `category` | `category` | Category |
| `reported_by_id` | `user` | Reported By |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `work_order_id` | `workOrder` | `work_order_number` |
| `category` | `category` | `name` |
| `reported_by_id` | `user` | `full_name` |

---

### `radioChannel`

**File:** `src/lib/schemas/radioChannel.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |
| `departmentId` | `department` | Department |

---

### `registration`

**File:** `src/lib/schemas/registration.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `contact_id` | `contact` | Contact |
| `currency_id` | `currency` | Currency |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `status_id` | `currency` | `name` |
| `currency_id` | `currency` | `code` |

---

### `reservation`

**File:** `src/lib/schemas/reservation.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `assetId` | `asset` | Asset |
| `eventId` | `event` | Event |

---

### `roadmap`

**File:** `src/lib/schemas/roadmap.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `projectId` | `project` | Project |

---

### `runsheet`

**File:** `src/lib/schemas/runsheet.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |
| `stageId` | `stage` | Stage |

---

### `runsheet_cue`

**File:** `src/lib/schemas/runsheetCue.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `runsheet_id` | `runsheet` | Runsheet |
| `assigned_to_id` | `user` | Assigned To |
| `department_id` | `department` | Department |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `assigned_to_id` | `department` | `name` |
| `department_id` | `department` | `name` |

---

### `schedule`

**File:** `src/lib/schemas/schedule.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |

---

### `settlement`

**File:** `src/lib/schemas/settlement.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |

---

### `shift`

**File:** `src/lib/schemas/shift.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `scheduleId` | `schedule` | Schedule |
| `positionId` | `position` | Position |

---

### `shipment`

**File:** `src/lib/schemas/shipment.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `show`

**File:** `src/lib/schemas/show.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |

---

### `sprint`

**File:** `src/lib/schemas/sprint.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `projectId` | `project` | Project |

---

### `subscriber`

**File:** `src/lib/schemas/subscriber.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `contact_id` | `contact` | Contact |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `contact_id` | `contact` | `full_name` |

---

### `talent`

**File:** `src/lib/schemas/talent.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `contact_id` | `contact` | Contact |
| `currency_id` | `currency` | Currency |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `talent_type_id` | `talent_type` | `name` |
| `status_id` | `status` | `name` |

---

### `team`

**File:** `src/lib/schemas/team.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `projectId` | `project` | Project |
| `leadId` | `lead` | Lead |

---

### `techSpec`

**File:** `src/lib/schemas/techSpec.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `eventId` | `event` | Event |
| `venueId` | `venue` | Venue |

---

### `timesheet`

**File:** `src/lib/schemas/timesheet.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `user_id` | `user` | User |

---

### `travel_request`

**File:** `src/lib/schemas/travelRequest.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `vendor`

**File:** `src/lib/schemas/vendor.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `company_id` | `company` | Company |
| `contact_id` | `contact` | Contact |

---

### `vendorRating`

**File:** `src/lib/schemas/advancing.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `vendor_id` | `company` | Vendor |
| `event_id` | `event` | Event |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `vendor_document`

**File:** `src/lib/schemas/vendorPortal.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `document_id` | `document` | `name` |

---

### `vendor_portal_access`

**File:** `src/lib/schemas/vendorPortal.ts`

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `event` | `name` |

---

### `work_order`

**File:** `src/lib/schemas/workOrder.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `event_id` | `event` | Event |
| `venue_id` | `venue` | Venue |

**Relation Fields:**

| Field | Entity | Display |
|-------|--------|---------|
| `event_id` | `venue` | `name` |
| `venue_id` | `venue` | `name` |

---

### `zone`

**File:** `src/lib/schemas/zone.ts`

**belongsTo:**

| Foreign Key | Target Entity | Label |
|-------------|---------------|-------|
| `venueId` | `venue` | Venue |

---
