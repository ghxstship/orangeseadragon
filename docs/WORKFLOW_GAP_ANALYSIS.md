# GHXSTSHIP/ATLVS Platform — Workflow & Feature Gap Analysis

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Platform Comparison Matrix](#1-platform-comparison-matrix)
3. [Workflow Inventory](#2-workflow-inventory--required-workflows-by-domain)
4. [Feature Gap Inventory](#3-feature-gap-inventory)
5. [Gap Summary Statistics](#4-gap-summary-statistics)
6. [**Workflow-to-Page Mapping**](#11-workflow-to-page-mapping) ← NEW
7. [Implementation Roadmap](#5-implementation-roadmap)
8. [Database Schema Additions](#6-database-schema-additions-required)
9. [New Workflow Templates](#7-new-workflow-templates-required)

---

## Executive Summary

This document provides a comprehensive comparison of the GHXSTSHIP platform's Information Architecture against leading enterprise SaaS platforms including **Odoo**, **ClickUp**, **NetSuite**, **HubSpot**, **Bizzabo/Cvent** (event management), **Monday.com**, and **ServiceNow**. The analysis identifies workflow and feature gaps that should be implemented to achieve enterprise parity.

**Current State:**
- 7 Management Modules (Projects, Production, Operations, Workforce, Assets, Finance, Business)
- 6 Core Personal Tools (Dashboard, Calendar, Tasks, Workflows, Activity, Documents)
- 6 Network/Community Features
- 21 documented workflow templates
- ~287 database tables specified

---

## 1. Platform Comparison Matrix

### 1.1 Core ERP Modules Comparison

| Domain | GHXSTSHIP | Odoo | NetSuite | ClickUp | HubSpot | Gap Status |
|--------|-----------|------|----------|---------|---------|------------|
| **Sales/CRM** | ✅ Business Module | ✅ CRM + Sales | ✅ CRM | ⚠️ Basic | ✅ Full Suite | Partial |
| **Inventory** | ✅ Assets Module | ✅ Full | ✅ Full | ❌ | ❌ | ✅ Complete |
| **Accounting** | ⚠️ Finance Module | ✅ Full | ✅ Full | ❌ | ❌ | **GAP** |
| **HR/Workforce** | ✅ Workforce Module | ✅ Full | ✅ Full | ⚠️ Basic | ❌ | Partial |
| **Manufacturing** | ⚠️ Production | ✅ Full | ✅ Full | ❌ | ❌ | **GAP** |
| **Purchasing** | ⚠️ Partial | ✅ Full | ✅ Full | ❌ | ❌ | **GAP** |
| **Project Mgmt** | ✅ Projects Module | ✅ Full | ⚠️ Basic | ✅ Full | ⚠️ Basic | ✅ Complete |
| **Marketing** | ⚠️ Partial | ✅ Full | ⚠️ Basic | ❌ | ✅ Full | **GAP** |
| **E-commerce** | ❌ | ✅ Full | ✅ Full | ❌ | ⚠️ Basic | **GAP** |
| **Website/CMS** | ❌ | ✅ Full | ❌ | ❌ | ✅ CMS Hub | **GAP** |
| **Point of Sale** | ❌ | ✅ Full | ❌ | ❌ | ❌ | **GAP** |
| **Event Lifecycle** | ✅ Production Module | ❌ | ❌ | ❌ | ❌ | ✅ Unique |

### 1.2 Event Management Platform Comparison (vs. Bizzabo/Cvent)

| Feature | GHXSTSHIP | Bizzabo | Cvent | Gap Status |
|---------|-----------|---------|-------|------------|
| Event Registration | ⚠️ Partial | ✅ Full | ✅ Full | **GAP** |
| Ticketing System | ❌ | ✅ Full | ✅ Full | **GAP** |
| Attendee Management | ⚠️ Partial | ✅ Full | ✅ Full | **GAP** |
| Mobile Event App | ❌ | ✅ Full | ✅ Full | **GAP** |
| Virtual/Hybrid Events | ❌ | ✅ Full | ✅ Full | **GAP** |
| Sponsor Management | ❌ | ✅ Full | ✅ Full | **GAP** |
| Exhibitor Portal | ❌ | ✅ Full | ✅ Full | **GAP** |
| Event Analytics | ⚠️ Basic | ✅ Full | ✅ Full | **GAP** |
| Networking/Matchmaking | ❌ | ✅ Full | ✅ Full | **GAP** |
| Badge Printing | ❌ | ✅ Full | ✅ Full | **GAP** |
| Check-in/Access Control | ⚠️ Partial | ✅ Full | ✅ Full | **GAP** |
| Session Management | ⚠️ Runsheets | ✅ Full | ✅ Full | Partial |
| Speaker Management | ⚠️ Partial | ✅ Full | ✅ Full | **GAP** |
| Venue Management | ✅ Full | ⚠️ Basic | ✅ Full | ✅ Complete |
| Production Lifecycle | ✅ Full | ❌ | ❌ | ✅ Unique |

---

## 2. Workflow Inventory — Required Workflows by Domain

### 2.1 Sales & CRM Workflows (HubSpot/Odoo Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 1 | Lead Scoring Automation | ❌ Missing | High |
| 2 | Lead Assignment Routing | ❌ Missing | High |
| 3 | Lead Nurture Sequences | ❌ Missing | High |
| 4 | Deal Stage Progression | ❌ Missing | High |
| 5 | Quote Expiration Reminder | ❌ Missing | Medium |
| 6 | Contract Renewal Reminder | ❌ Missing | High |
| 7 | Win/Loss Analysis Trigger | ❌ Missing | Medium |
| 8 | Customer Onboarding Sequence | ❌ Missing | High |
| 9 | Upsell/Cross-sell Triggers | ❌ Missing | Medium |
| 10 | Churn Risk Detection | ❌ Missing | High |
| 11 | NPS/CSAT Survey Automation | ❌ Missing | Medium |
| 12 | Re-engagement Campaigns | ❌ Missing | Medium |
| 13 | Sales Activity Logging | ❌ Missing | Medium |
| 14 | Pipeline Velocity Alerts | ❌ Missing | Low |
| 15 | Commission Calculation | ❌ Missing | Medium |

### 2.2 Marketing Automation Workflows (HubSpot Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 16 | Email Campaign Automation | ❌ Missing | High |
| 17 | Drip Campaign Sequences | ❌ Missing | High |
| 18 | Form Submission Follow-up | ❌ Missing | High |
| 19 | Landing Page Lead Capture | ❌ Missing | Medium |
| 20 | Social Media Scheduling | ❌ Missing | Medium |
| 21 | Content Publishing Workflow | ❌ Missing | Medium |
| 22 | A/B Test Automation | ❌ Missing | Low |
| 23 | Event Registration Marketing | ❌ Missing | High |
| 24 | Webinar Follow-up Sequence | ❌ Missing | Medium |
| 25 | Newsletter Subscription | ❌ Missing | Medium |
| 26 | Unsubscribe Processing | ❌ Missing | High |
| 27 | Marketing Attribution | ❌ Missing | Medium |

### 2.3 Finance & Accounting Workflows (Odoo/NetSuite Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 28 | Invoice Generation | ⚠️ Partial | High |
| 29 | Invoice Overdue Reminder | ✅ Exists | — |
| 30 | Payment Reconciliation | ❌ Missing | High |
| 31 | Expense Approval Routing | ✅ Exists | — |
| 32 | Purchase Order Approval | ✅ Exists | — |
| 33 | Budget Threshold Alerts | ✅ Exists | — |
| 34 | Vendor Payment Processing | ❌ Missing | High |
| 35 | Bank Reconciliation | ❌ Missing | High |
| 36 | Revenue Recognition | ❌ Missing | Medium |
| 37 | Tax Calculation & Filing | ❌ Missing | Medium |
| 38 | Financial Period Close | ❌ Missing | High |
| 39 | Audit Trail Generation | ⚠️ Partial | Medium |
| 40 | Multi-currency Conversion | ❌ Missing | Medium |
| 41 | Credit Limit Monitoring | ❌ Missing | Medium |
| 42 | Accounts Aging Reports | ❌ Missing | Medium |
| 43 | Journal Entry Automation | ❌ Missing | Medium |

### 2.4 Inventory & Asset Workflows (Odoo/NetSuite Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 44 | Asset Checkout Approval | ✅ Exists | — |
| 45 | Asset Overdue Reminder | ✅ Exists | — |
| 46 | Maintenance Scheduling | ✅ Exists | — |
| 47 | Low Stock Alert | ❌ Missing | High |
| 48 | Reorder Point Trigger | ❌ Missing | High |
| 49 | Stock Transfer Request | ❌ Missing | Medium |
| 50 | Inventory Valuation | ❌ Missing | Medium |
| 51 | Lot/Serial Tracking | ❌ Missing | Medium |
| 52 | Warehouse Location Assignment | ❌ Missing | Medium |
| 53 | Cycle Count Scheduling | ❌ Missing | Medium |
| 54 | Depreciation Calculation | ❌ Missing | Medium |
| 55 | Asset Disposal Workflow | ❌ Missing | Low |
| 56 | Warranty Expiration Alert | ❌ Missing | Medium |

### 2.5 HR & Workforce Workflows (Odoo/Rippling Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 57 | Shift Confirmation Request | ✅ Exists | — |
| 58 | Timesheet Submission Reminder | ✅ Exists | — |
| 59 | Certification Expiry Alert | ✅ Exists | — |
| 60 | Employee Onboarding | ❌ Missing | High |
| 61 | Employee Offboarding | ❌ Missing | High |
| 62 | Leave Request Approval | ❌ Missing | High |
| 63 | Leave Balance Notification | ❌ Missing | Medium |
| 64 | Performance Review Cycle | ❌ Missing | Medium |
| 65 | Goal Setting & Tracking | ❌ Missing | Medium |
| 66 | Training Assignment | ❌ Missing | Medium |
| 67 | Payroll Processing | ❌ Missing | High |
| 68 | Benefits Enrollment | ❌ Missing | Medium |
| 69 | Compensation Review | ❌ Missing | Medium |
| 70 | Org Chart Updates | ❌ Missing | Low |
| 71 | Emergency Contact Updates | ❌ Missing | Low |
| 72 | Document Expiry (Visa/License) | ❌ Missing | High |
| 73 | Availability Conflict Detection | ❌ Missing | Medium |
| 74 | Overtime Approval | ❌ Missing | Medium |
| 75 | Shift Swap Request | ❌ Missing | Medium |

### 2.6 Project Management Workflows (ClickUp/Monday Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 76 | Task Due Reminder | ✅ Exists | — |
| 77 | Task Overdue Escalation | ✅ Exists | — |
| 78 | Project Budget Alert | ✅ Exists | — |
| 79 | Sprint Auto-creation | ❌ Missing | Medium |
| 80 | Sprint Completion Summary | ❌ Missing | Medium |
| 81 | Backlog Prioritization | ❌ Missing | Medium |
| 82 | Dependency Blocking Alert | ❌ Missing | High |
| 83 | Milestone Approaching | ⚠️ Partial | Medium |
| 84 | Resource Overallocation | ❌ Missing | High |
| 85 | Project Status Report | ❌ Missing | Medium |
| 86 | Stakeholder Update | ❌ Missing | Medium |
| 87 | Risk Escalation | ❌ Missing | Medium |
| 88 | Change Request Approval | ❌ Missing | Medium |
| 89 | Project Closure Checklist | ❌ Missing | Medium |
| 90 | Time Entry Reminder | ❌ Missing | Medium |
| 91 | Workload Balancing | ❌ Missing | Medium |

### 2.7 Production & Event Lifecycle Workflows (Unique + Bizzabo/Cvent)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 92 | Event Phase Transition | ✅ Exists | — |
| 93 | Show Call Published | ✅ Exists | — |
| 94 | Runsheet Delay Adjustment | ✅ Exists | — |
| 95 | Booking Confirmation | ✅ Exists | — |
| 96 | Rider Review Routing | ✅ Exists | — |
| 97 | Ticket Purchase Confirmation | ✅ Exists | — |
| 98 | Guest Check-in Notification | ✅ Exists | — |
| 99 | Hospitality Fulfillment | ✅ Exists | — |
| 100 | Event Registration Confirmation | ❌ Missing | High |
| 101 | Waitlist Management | ❌ Missing | High |
| 102 | Session Capacity Alert | ❌ Missing | Medium |
| 103 | Speaker Confirmation | ❌ Missing | High |
| 104 | Speaker Reminder Sequence | ❌ Missing | Medium |
| 105 | Sponsor Deliverable Tracking | ❌ Missing | High |
| 106 | Exhibitor Onboarding | ❌ Missing | Medium |
| 107 | Badge Generation | ❌ Missing | High |
| 108 | Access Credential Issuance | ❌ Missing | High |
| 109 | Event Feedback Collection | ❌ Missing | High |
| 110 | Post-Event Survey | ❌ Missing | Medium |
| 111 | Attendee Networking Match | ❌ Missing | Medium |
| 112 | Session Recording Processing | ❌ Missing | Medium |
| 113 | On-Demand Content Publishing | ❌ Missing | Medium |
| 114 | Event ROI Calculation | ❌ Missing | Medium |
| 115 | Venue Booking Confirmation | ❌ Missing | Medium |
| 116 | Catering Order Confirmation | ❌ Missing | Medium |
| 117 | AV Equipment Reservation | ❌ Missing | Medium |
| 118 | Security Briefing Distribution | ❌ Missing | Medium |
| 119 | Weather Alert Notification | ❌ Missing | Medium |
| 120 | Emergency Protocol Activation | ❌ Missing | High |

### 2.8 Procurement & Supply Chain Workflows (Odoo/NetSuite Parity)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 121 | RFQ Creation & Distribution | ❌ Missing | High |
| 122 | Vendor Bid Evaluation | ❌ Missing | Medium |
| 123 | Vendor Onboarding | ❌ Missing | High |
| 124 | Vendor Performance Review | ❌ Missing | Medium |
| 125 | Contract Negotiation Tracking | ❌ Missing | Medium |
| 126 | Goods Receipt Confirmation | ❌ Missing | High |
| 127 | Quality Inspection | ❌ Missing | Medium |
| 128 | Return to Vendor (RTV) | ❌ Missing | Medium |
| 129 | Vendor Invoice Matching | ❌ Missing | High |
| 130 | Blanket Order Release | ❌ Missing | Low |

### 2.9 Service & Support Workflows (ServiceNow/HubSpot Service Hub)

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 131 | Ticket Creation | ⚠️ Partial | High |
| 132 | Ticket Assignment Routing | ❌ Missing | High |
| 133 | SLA Breach Warning | ❌ Missing | High |
| 134 | Ticket Escalation | ❌ Missing | High |
| 135 | Customer Satisfaction Survey | ❌ Missing | Medium |
| 136 | Knowledge Base Suggestion | ❌ Missing | Medium |
| 137 | Ticket Resolution Confirmation | ❌ Missing | Medium |
| 138 | Recurring Issue Detection | ❌ Missing | Medium |
| 139 | Service Level Reporting | ❌ Missing | Medium |

### 2.10 Compliance & Governance Workflows

| # | Workflow | Current Status | Priority |
|---|----------|----------------|----------|
| 140 | Policy Acknowledgment | ❌ Missing | High |
| 141 | Compliance Training Assignment | ❌ Missing | High |
| 142 | Audit Schedule Notification | ❌ Missing | Medium |
| 143 | Incident Report Filing | ⚠️ Partial | Medium |
| 144 | Risk Assessment Review | ❌ Missing | Medium |
| 145 | Document Retention Policy | ❌ Missing | Medium |
| 146 | GDPR Data Request | ❌ Missing | High |
| 147 | Data Breach Notification | ❌ Missing | High |
| 148 | License/Permit Renewal | ❌ Missing | Medium |
| 149 | Insurance Policy Renewal | ❌ Missing | Medium |
| 150 | Safety Inspection Scheduling | ❌ Missing | Medium |

---

## 3. Feature Gap Inventory

### 3.1 Missing Core Features

| # | Feature | Domain | Competitor Reference | Priority |
|---|---------|--------|---------------------|----------|
| F1 | **Full Accounting/GL** | Finance | Odoo, NetSuite | Critical |
| F2 | **Bank Reconciliation** | Finance | Odoo, NetSuite | High |
| F3 | **Multi-currency Support** | Finance | Odoo, NetSuite | High |
| F4 | **Tax Management** | Finance | Odoo, NetSuite | High |
| F5 | **E-commerce/Online Store** | Sales | Odoo, Shopify | Medium |
| F6 | **Point of Sale (POS)** | Sales | Odoo, Square | Medium |
| F7 | **Manufacturing/BOM** | Production | Odoo, NetSuite | Medium |
| F8 | **Quality Control** | Production | Odoo, NetSuite | Medium |
| F9 | **Email Marketing Engine** | Marketing | HubSpot, Mailchimp | High |
| F10 | **Landing Page Builder** | Marketing | HubSpot | Medium |
| F11 | **Social Media Management** | Marketing | HubSpot, Hootsuite | Medium |
| F12 | **Lead Scoring Engine** | CRM | HubSpot, Salesforce | High |
| F13 | **Sales Sequences/Cadences** | CRM | HubSpot, Outreach | High |
| F14 | **Meeting Scheduler** | CRM | HubSpot, Calendly | Medium |
| F15 | **Call Tracking/Recording** | CRM | HubSpot, Gong | Medium |

### 3.2 Missing Event Management Features

| # | Feature | Competitor Reference | Priority |
|---|---------|---------------------|----------|
| F16 | **Event Registration Portal** | Bizzabo, Cvent, Eventbrite | Critical |
| F17 | **Ticketing System** | Eventbrite, Cvent | Critical |
| F18 | **Attendee Mobile App** | Bizzabo, Cvent | High |
| F19 | **Virtual Event Platform** | Hopin, Bizzabo | High |
| F20 | **Hybrid Event Support** | Bizzabo, Cvent | High |
| F21 | **Sponsor Portal** | Bizzabo, Cvent | High |
| F22 | **Exhibitor Management** | Cvent | High |
| F23 | **Badge Design & Printing** | Cvent, Bizzabo | High |
| F24 | **QR Code Check-in** | Bizzabo, Cvent | High |
| F25 | **Networking/Matchmaking** | Bizzabo, Brella | Medium |
| F26 | **Session Builder** | Cvent, Sched | Medium |
| F27 | **Speaker Portal** | Cvent, Sessionize | Medium |
| F28 | **Event Analytics Dashboard** | Bizzabo, Cvent | High |
| F29 | **Lead Retrieval** | Cvent, Bizzabo | Medium |
| F30 | **Event Website Builder** | Cvent, Splash | Medium |

### 3.3 Missing Project Management Features (ClickUp/Monday Parity)

| # | Feature | Competitor Reference | Priority |
|---|---------|---------------------|----------|
| F31 | **Gantt Chart View** | ClickUp, Monday, Asana | High |
| F32 | **Workload View** | ClickUp, Monday | High |
| F33 | **Time Tracking** | ClickUp, Toggl | High |
| F34 | **Resource Management** | Monday, Float | High |
| F35 | **Dependencies Visualization** | ClickUp, Monday | Medium |
| F36 | **Sprint Points/Velocity** | ClickUp, Jira | Medium |
| F37 | **Burndown/Burnup Charts** | Jira, ClickUp | Medium |
| F38 | **Custom Automations Builder** | ClickUp, Monday | High |
| F39 | **Form Builder** | ClickUp, Monday | Medium |
| F40 | **Mind Map View** | ClickUp | Low |

### 3.4 Missing HR/Workforce Features

| # | Feature | Competitor Reference | Priority |
|---|---------|---------------------|----------|
| F41 | **Payroll Processing** | Rippling, Gusto | High |
| F42 | **Benefits Administration** | Rippling, Gusto | Medium |
| F43 | **Performance Management** | Lattice, 15Five | Medium |
| F44 | **Learning Management (LMS)** | Rippling, Workday | Medium |
| F45 | **Applicant Tracking (ATS)** | Greenhouse, Lever | Medium |
| F46 | **Employee Self-Service Portal** | Rippling, BambooHR | High |
| F47 | **Org Chart Builder** | Rippling, Lucidchart | Medium |
| F48 | **Compensation Planning** | Lattice, Pave | Medium |

### 3.5 Missing Integration Connectors

| # | Integration | Category | Priority |
|---|-------------|----------|----------|
| I1 | Stripe/Payment Processing | Finance | Critical |
| I2 | QuickBooks/Xero | Accounting | High |
| I3 | Salesforce | CRM | High |
| I4 | HubSpot | Marketing/CRM | High |
| I5 | Slack | Communication | High |
| I6 | Microsoft Teams | Communication | High |
| I7 | Google Workspace | Productivity | High |
| I8 | Microsoft 365 | Productivity | High |
| I9 | Zoom | Video | High |
| I10 | Twilio | SMS/Voice | High |
| I11 | SendGrid/Mailgun | Email | High |
| I12 | DocuSign/PandaDoc | E-signature | Medium |
| I13 | Zapier | Automation | High |
| I14 | Make (Integromat) | Automation | Medium |
| I15 | Shopify | E-commerce | Medium |
| I16 | Square | POS | Medium |
| I17 | ADP/Paychex | Payroll | Medium |
| I18 | Eventbrite | Ticketing | High |
| I19 | Mailchimp | Email Marketing | Medium |
| I20 | LinkedIn | Social/Recruiting | Medium |

---

## 4. Gap Summary Statistics

### 4.1 Workflow Coverage

| Category | Total Required | Currently Exists | Gap Count | Coverage % |
|----------|---------------|------------------|-----------|------------|
| Sales/CRM | 15 | 0 | 15 | 0% |
| Marketing | 12 | 0 | 12 | 0% |
| Finance | 16 | 4 | 12 | 25% |
| Inventory/Assets | 13 | 3 | 10 | 23% |
| HR/Workforce | 19 | 3 | 16 | 16% |
| Project Management | 16 | 3 | 13 | 19% |
| Production/Events | 29 | 9 | 20 | 31% |
| Procurement | 10 | 0 | 10 | 0% |
| Service/Support | 9 | 1 | 8 | 11% |
| Compliance | 11 | 1 | 10 | 9% |
| **TOTAL** | **150** | **24** | **126** | **16%** |

### 4.2 Feature Coverage

| Category | Total Required | Currently Exists | Gap Count | Coverage % |
|----------|---------------|------------------|-----------|------------|
| Core ERP Features | 15 | 3 | 12 | 20% |
| Event Management | 15 | 3 | 12 | 20% |
| Project Management | 10 | 4 | 6 | 40% |
| HR/Workforce | 8 | 2 | 6 | 25% |
| Integrations | 20 | 2 | 18 | 10% |
| **TOTAL** | **68** | **14** | **54** | **21%** |

---

## 11. Workflow-to-Page Mapping

This section maps all 150 workflows to existing pages/subpages/tabs or recommends new pages to create.

### Legend
- **✅ EXISTS** — Page/subpage already exists
- **📍 TAB** — Add as tab within existing page
- **🆕 NEW** — Create new page/subpage
- **⚡ IMPACT** — High-impact new page recommendation

---

### 11.1 Sales & CRM Workflows → `/modules/business/`

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 1 | Lead Scoring Automation | `/modules/business/leads` | 📍 TAB | Add "Scoring" tab with rules config |
| 2 | Lead Assignment Routing | `/modules/business/leads` | 📍 TAB | Add "Assignment Rules" tab |
| 3 | Lead Nurture Sequences | `/modules/business/leads` | 🆕 NEW | **Create `/modules/business/sequences`** ⚡ |
| 4 | Deal Stage Progression | `/modules/business/deals` | 📍 TAB | Add "Automation" tab on deal detail |
| 5 | Quote Expiration Reminder | `/modules/business/proposals` | 📍 TAB | Add "Reminders" settings tab |
| 6 | Contract Renewal Reminder | `/modules/business/contracts` | 📍 TAB | Add "Renewals" tab with upcoming list |
| 7 | Win/Loss Analysis Trigger | `/modules/business/deals` | 📍 TAB | Add "Analytics" tab |
| 8 | Customer Onboarding Sequence | `/modules/business/contacts` | 🆕 NEW | **Create `/modules/business/onboarding`** ⚡ |
| 9 | Upsell/Cross-sell Triggers | `/modules/business/deals` | 📍 TAB | Add "Opportunities" tab |
| 10 | Churn Risk Detection | `/modules/business/contacts` | 📍 TAB | Add "Health Score" tab |
| 11 | NPS/CSAT Survey Automation | `/modules/business/contacts` | 🆕 NEW | **Create `/modules/business/surveys`** |
| 12 | Re-engagement Campaigns | `/modules/business/contacts` | 📍 TAB | Link to sequences |
| 13 | Sales Activity Logging | `/modules/business/pipeline/activities` | ✅ EXISTS | Enhance existing |
| 14 | Pipeline Velocity Alerts | `/modules/business/pipeline` | 📍 TAB | Add "Insights" tab |
| 15 | Commission Calculation | `/modules/business/` | 🆕 NEW | **Create `/modules/business/commissions`** |

**New Pages Recommended for Business Module:**
```
/modules/business/
├── sequences/          ⚡ HIGH IMPACT - Email/nurture sequences
│   ├── page.tsx           (Sequence list)
│   ├── [id]/page.tsx      (Sequence builder)
│   └── templates/page.tsx (Sequence templates)
├── onboarding/         ⚡ HIGH IMPACT - Customer onboarding flows
│   ├── page.tsx           (Onboarding journeys)
│   └── [id]/page.tsx      (Journey detail)
├── surveys/            - NPS/CSAT surveys
│   ├── page.tsx           (Survey list)
│   └── [id]/page.tsx      (Survey builder)
└── commissions/        - Sales commissions
    ├── page.tsx           (Commission dashboard)
    ├── rules/page.tsx     (Commission rules)
    └── payouts/page.tsx   (Payout history)
```

---

### 11.2 Marketing Automation Workflows → `/content/` (NEW GROUP)

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 16 | Email Campaign Automation | `/content/campaigns` | ✅ EXISTS | Enhance with automation |
| 17 | Drip Campaign Sequences | `/content/campaigns` | 📍 TAB | Add "Sequences" tab |
| 18 | Form Submission Follow-up | `/content/` | 🆕 NEW | **Create `/content/forms`** ⚡ |
| 19 | Landing Page Lead Capture | `/content/` | 🆕 NEW | **Create `/content/landing-pages`** ⚡ |
| 20 | Social Media Scheduling | `/content/social` | ✅ EXISTS | Enhance existing |
| 21 | Content Publishing Workflow | `/content/` | 📍 TAB | Add workflow to media/brand |
| 22 | A/B Test Automation | `/content/campaigns` | 📍 TAB | Add "A/B Tests" tab |
| 23 | Event Registration Marketing | `/content/campaigns` | 📍 TAB | Add "Event Campaigns" filter |
| 24 | Webinar Follow-up Sequence | `/content/webinars` | ✅ EXISTS | Add automation tab |
| 25 | Newsletter Subscription | `/content/` | 🆕 NEW | **Create `/content/subscribers`** |
| 26 | Unsubscribe Processing | `/content/subscribers` | 📍 TAB | Add "Preferences" tab |
| 27 | Marketing Attribution | `/content/` | 🆕 NEW | **Create `/content/attribution`** |

**New Pages Recommended for Content Module:**
```
/content/
├── forms/              ⚡ HIGH IMPACT - Form builder
│   ├── page.tsx           (Form list)
│   ├── [id]/page.tsx      (Form builder)
│   └── submissions/page.tsx (All submissions)
├── landing-pages/      ⚡ HIGH IMPACT - Landing page builder
│   ├── page.tsx           (Page list)
│   ├── [id]/page.tsx      (Page editor)
│   └── templates/page.tsx (Templates)
├── subscribers/        - Email subscriber management
│   ├── page.tsx           (Subscriber list)
│   ├── segments/page.tsx  (Segments)
│   └── preferences/page.tsx (Preference center)
└── attribution/        - Marketing attribution
    └── page.tsx           (Attribution dashboard)
```

---

### 11.3 Finance & Accounting Workflows → `/modules/finance/`

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 28 | Invoice Generation | `/modules/finance/invoices` | ✅ EXISTS | Enhance automation |
| 29 | Invoice Overdue Reminder | `/modules/finance/invoices` | ✅ EXISTS | Already implemented |
| 30 | Payment Reconciliation | `/modules/finance/payments` | 📍 TAB | Add "Reconciliation" tab |
| 31 | Expense Approval Routing | `/modules/finance/expenses` | ✅ EXISTS | Already implemented |
| 32 | Purchase Order Approval | `/modules/finance/` | 🆕 NEW | **Create `/modules/finance/purchase-orders`** |
| 33 | Budget Threshold Alerts | `/modules/finance/budgets` | ✅ EXISTS | Already implemented |
| 34 | Vendor Payment Processing | `/modules/finance/payments` | 📍 TAB | Add "Vendor Payments" tab |
| 35 | Bank Reconciliation | `/modules/finance/` | 🆕 NEW | **Create `/modules/finance/banking`** ⚡ |
| 36 | Revenue Recognition | `/modules/finance/` | 🆕 NEW | **Create `/modules/finance/revenue`** |
| 37 | Tax Calculation & Filing | `/modules/finance/` | 🆕 NEW | **Create `/modules/finance/tax`** |
| 38 | Financial Period Close | `/modules/finance/` | 🆕 NEW | **Create `/modules/finance/periods`** ⚡ |
| 39 | Audit Trail Generation | `/modules/finance/reports` | 📍 TAB | Add "Audit Log" tab |
| 40 | Multi-currency Conversion | `/modules/finance/accounts` | 📍 TAB | Add "Currencies" tab |
| 41 | Credit Limit Monitoring | `/modules/business/contacts` | 📍 TAB | Add "Credit" tab on company |
| 42 | Accounts Aging Reports | `/modules/finance/reports` | 📍 TAB | Add "Aging" report type |
| 43 | Journal Entry Automation | `/modules/finance/` | 🆕 NEW | **Create `/modules/finance/journal`** |

**New Pages Recommended for Finance Module:**
```
/modules/finance/
├── banking/            ⚡ HIGH IMPACT - Bank account management
│   ├── page.tsx           (Bank accounts list)
│   ├── [id]/page.tsx      (Account detail)
│   ├── transactions/page.tsx (Transaction feed)
│   └── reconciliation/page.tsx (Reconciliation tool)
├── purchase-orders/    - PO management
│   ├── page.tsx           (PO list)
│   └── [id]/page.tsx      (PO detail)
├── journal/            - Journal entries
│   ├── page.tsx           (Entry list)
│   └── [id]/page.tsx      (Entry detail)
├── periods/            ⚡ HIGH IMPACT - Period close management
│   ├── page.tsx           (Period list)
│   └── [id]/page.tsx      (Period close checklist)
├── revenue/            - Revenue recognition
│   └── page.tsx           (Revenue schedules)
├── tax/                - Tax management
│   ├── page.tsx           (Tax dashboard)
│   ├── rates/page.tsx     (Tax rates)
│   └── filings/page.tsx   (Filing history)
└── gl-accounts/        - Chart of accounts (may exist)
    └── page.tsx           (Account tree)
```

---

### 11.4 Inventory & Asset Workflows → `/modules/assets/`

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 44 | Asset Checkout Approval | `/modules/assets/check` | ✅ EXISTS | Already implemented |
| 45 | Asset Overdue Reminder | `/modules/assets/check` | ✅ EXISTS | Already implemented |
| 46 | Maintenance Scheduling | `/modules/assets/maintenance` | ✅ EXISTS | Already implemented |
| 47 | Low Stock Alert | `/modules/assets/inventory` | 📍 TAB | Add "Alerts" tab |
| 48 | Reorder Point Trigger | `/modules/assets/inventory` | 📍 TAB | Add "Reorder" settings |
| 49 | Stock Transfer Request | `/modules/assets/` | 🆕 NEW | **Create `/modules/assets/transfers`** |
| 50 | Inventory Valuation | `/modules/assets/inventory` | 📍 TAB | Add "Valuation" tab |
| 51 | Lot/Serial Tracking | `/modules/assets/inventory/[id]` | 📍 TAB | Add "Tracking" tab on item |
| 52 | Warehouse Location Assignment | `/modules/assets/` | 🆕 NEW | **Create `/modules/assets/locations`** ⚡ |
| 53 | Cycle Count Scheduling | `/modules/assets/` | 🆕 NEW | **Create `/modules/assets/counts`** |
| 54 | Depreciation Calculation | `/modules/assets/inventory/[id]` | 📍 TAB | Add "Depreciation" tab |
| 55 | Asset Disposal Workflow | `/modules/assets/` | 🆕 NEW | **Create `/modules/assets/disposal`** |
| 56 | Warranty Expiration Alert | `/modules/assets/maintenance` | 📍 TAB | Add "Warranties" tab |

**New Pages Recommended for Assets Module:**
```
/modules/assets/
├── locations/          ⚡ HIGH IMPACT - Warehouse/location management
│   ├── page.tsx           (Location hierarchy)
│   └── [id]/page.tsx      (Location detail with inventory)
├── transfers/          - Stock transfers
│   ├── page.tsx           (Transfer list)
│   └── [id]/page.tsx      (Transfer detail)
├── counts/             - Cycle counting
│   ├── page.tsx           (Count schedules)
│   └── [id]/page.tsx      (Count session)
└── disposal/           - Asset disposal
    ├── page.tsx           (Disposal queue)
    └── [id]/page.tsx      (Disposal record)
```

---

### 11.5 HR & Workforce Workflows → `/modules/workforce/`

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 57 | Shift Confirmation Request | `/modules/workforce/shifts` | ✅ EXISTS | Already implemented |
| 58 | Timesheet Submission Reminder | `/modules/workforce/timesheets` | ✅ EXISTS | Already implemented |
| 59 | Certification Expiry Alert | `/modules/workforce/certifications` | ✅ EXISTS | Already implemented |
| 60 | Employee Onboarding | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/onboarding`** ⚡ |
| 61 | Employee Offboarding | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/offboarding`** ⚡ |
| 62 | Leave Request Approval | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/leave`** ⚡ |
| 63 | Leave Balance Notification | `/modules/workforce/leave` | 📍 TAB | Add "Balances" tab |
| 64 | Performance Review Cycle | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/performance`** |
| 65 | Goal Setting & Tracking | `/modules/workforce/performance` | 📍 TAB | Add "Goals" tab |
| 66 | Training Assignment | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/training`** |
| 67 | Payroll Processing | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/payroll`** ⚡ |
| 68 | Benefits Enrollment | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/benefits`** |
| 69 | Compensation Review | `/modules/workforce/roster/[id]` | 📍 TAB | Add "Compensation" tab |
| 70 | Org Chart Updates | `/modules/workforce/` | 🆕 NEW | **Create `/modules/workforce/org-chart`** |
| 71 | Emergency Contact Updates | `/modules/workforce/roster/[id]` | 📍 TAB | Add "Emergency" tab |
| 72 | Document Expiry (Visa/License) | `/modules/workforce/credentials` | ✅ EXISTS | Enhance with alerts |
| 73 | Availability Conflict Detection | `/modules/workforce/schedules` | 📍 TAB | Add "Conflicts" view |
| 74 | Overtime Approval | `/modules/workforce/timesheets` | 📍 TAB | Add "Overtime" approval queue |
| 75 | Shift Swap Request | `/modules/workforce/shifts` | 📍 TAB | Add "Swap Requests" tab |

**New Pages Recommended for Workforce Module:**
```
/modules/workforce/
├── onboarding/         ⚡ HIGH IMPACT - Employee onboarding
│   ├── page.tsx           (Onboarding queue)
│   ├── [id]/page.tsx      (Onboarding checklist)
│   └── templates/page.tsx (Onboarding templates)
├── offboarding/        ⚡ HIGH IMPACT - Employee offboarding
│   ├── page.tsx           (Offboarding queue)
│   └── [id]/page.tsx      (Offboarding checklist)
├── leave/              ⚡ HIGH IMPACT - Leave management
│   ├── page.tsx           (Leave requests)
│   ├── calendar/page.tsx  (Leave calendar)
│   ├── balances/page.tsx  (Balance overview)
│   └── policies/page.tsx  (Leave policies)
├── payroll/            ⚡ HIGH IMPACT - Payroll processing
│   ├── page.tsx           (Payroll runs)
│   ├── [id]/page.tsx      (Run detail)
│   └── history/page.tsx   (Pay history)
├── performance/        - Performance management
│   ├── page.tsx           (Review cycles)
│   ├── reviews/page.tsx   (All reviews)
│   └── goals/page.tsx     (Goal tracking)
├── training/           - Training/LMS
│   ├── page.tsx           (Training catalog)
│   ├── assignments/page.tsx (Assignments)
│   └── completions/page.tsx (Completions)
├── benefits/           - Benefits administration
│   ├── page.tsx           (Benefits overview)
│   └── enrollment/page.tsx (Enrollment)
└── org-chart/          - Organization chart
    └── page.tsx           (Interactive org chart)
```

---

### 11.6 Project Management Workflows → `/modules/projects/`

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 76 | Task Due Reminder | `/core/tasks` | ✅ EXISTS | Already implemented |
| 77 | Task Overdue Escalation | `/core/tasks` | ✅ EXISTS | Already implemented |
| 78 | Project Budget Alert | `/modules/projects/projects/[id]` | ✅ EXISTS | Already implemented |
| 79 | Sprint Auto-creation | `/modules/projects/sprints` | 📍 TAB | Add "Auto-create" settings |
| 80 | Sprint Completion Summary | `/modules/projects/sprints/[id]` | 📍 TAB | Add "Summary" tab |
| 81 | Backlog Prioritization | `/modules/projects/backlogs` | ✅ EXISTS | Enhance with automation |
| 82 | Dependency Blocking Alert | `/modules/projects/projects/[id]` | 📍 TAB | Add "Dependencies" view |
| 83 | Milestone Approaching | `/modules/projects/roadmaps` | 📍 TAB | Add "Milestones" alerts |
| 84 | Resource Overallocation | `/modules/projects/` | 🆕 NEW | **Create `/modules/projects/resources`** ⚡ |
| 85 | Project Status Report | `/modules/projects/reports` | ✅ EXISTS | Add report template |
| 86 | Stakeholder Update | `/modules/projects/projects/[id]` | 📍 TAB | Add "Updates" tab |
| 87 | Risk Escalation | `/modules/projects/` | 🆕 NEW | **Create `/modules/projects/risks`** |
| 88 | Change Request Approval | `/modules/projects/` | 🆕 NEW | **Create `/modules/projects/changes`** |
| 89 | Project Closure Checklist | `/modules/projects/projects/[id]` | 📍 TAB | Add "Closure" tab |
| 90 | Time Entry Reminder | `/modules/projects/` | 🆕 NEW | **Create `/modules/projects/time`** ⚡ |
| 91 | Workload Balancing | `/modules/projects/resources` | 📍 TAB | Add "Workload" view |

**New Pages Recommended for Projects Module:**
```
/modules/projects/
├── resources/          ⚡ HIGH IMPACT - Resource management
│   ├── page.tsx           (Resource overview)
│   ├── workload/page.tsx  (Workload view)
│   └── allocation/page.tsx (Allocation matrix)
├── time/               ⚡ HIGH IMPACT - Time tracking
│   ├── page.tsx           (Time entries)
│   ├── reports/page.tsx   (Time reports)
│   └── approvals/page.tsx (Time approvals)
├── risks/              - Risk management
│   ├── page.tsx           (Risk register)
│   └── [id]/page.tsx      (Risk detail)
└── changes/            - Change requests
    ├── page.tsx           (Change log)
    └── [id]/page.tsx      (Change detail)
```

---

### 11.7 Production & Event Lifecycle Workflows → `/modules/production/`

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 92 | Event Phase Transition | `/modules/production/events/[id]` | ✅ EXISTS | Already implemented |
| 93 | Show Call Published | `/modules/production/shows` | ✅ EXISTS | Already implemented |
| 94 | Runsheet Delay Adjustment | `/modules/production/runsheets` | ✅ EXISTS | Already implemented |
| 95 | Booking Confirmation | `/modules/production/` | 🆕 NEW | **Create `/modules/production/bookings`** ⚡ |
| 96 | Rider Review Routing | `/modules/production/riders` | ✅ EXISTS | Already implemented |
| 97 | Ticket Purchase Confirmation | `/modules/production/` | 🆕 NEW | **Create `/modules/production/ticketing`** ⚡ |
| 98 | Guest Check-in Notification | `/modules/production/` | 🆕 NEW | **Create `/modules/production/check-in`** ⚡ |
| 99 | Hospitality Fulfillment | `/modules/production/` | 🆕 NEW | **Create `/modules/production/hospitality`** |
| 100 | Event Registration Confirmation | `/modules/production/` | 🆕 NEW | **Create `/modules/production/registration`** ⚡ |
| 101 | Waitlist Management | `/modules/production/registration` | 📍 TAB | Add "Waitlist" tab |
| 102 | Session Capacity Alert | `/modules/production/` | 🆕 NEW | **Create `/modules/production/sessions`** ⚡ |
| 103 | Speaker Confirmation | `/modules/production/` | 🆕 NEW | **Create `/modules/production/speakers`** ⚡ |
| 104 | Speaker Reminder Sequence | `/modules/production/speakers` | 📍 TAB | Add "Communications" tab |
| 105 | Sponsor Deliverable Tracking | `/modules/production/` | 🆕 NEW | **Create `/modules/production/sponsors`** ⚡ |
| 106 | Exhibitor Onboarding | `/modules/production/` | 🆕 NEW | **Create `/modules/production/exhibitors`** |
| 107 | Badge Generation | `/modules/production/` | 🆕 NEW | **Create `/modules/production/badges`** ⚡ |
| 108 | Access Credential Issuance | `/modules/production/` | 🆕 NEW | **Create `/modules/production/credentials`** |
| 109 | Event Feedback Collection | `/modules/production/events/[id]` | 📍 TAB | Add "Feedback" tab |
| 110 | Post-Event Survey | `/modules/production/events/[id]` | 📍 TAB | Add "Surveys" tab |
| 111 | Attendee Networking Match | `/modules/production/` | 🆕 NEW | **Create `/modules/production/networking`** |
| 112 | Session Recording Processing | `/modules/production/sessions` | 📍 TAB | Add "Recordings" tab |
| 113 | On-Demand Content Publishing | `/modules/production/sessions` | 📍 TAB | Add "On-Demand" tab |
| 114 | Event ROI Calculation | `/modules/production/reports` | 📍 TAB | Add "ROI" report |
| 115 | Venue Booking Confirmation | `/modules/operations/venues` | 📍 TAB | Add "Bookings" tab |
| 116 | Catering Order Confirmation | `/modules/production/hospitality` | 📍 TAB | Add "Catering" tab |
| 117 | AV Equipment Reservation | `/modules/assets/reservations` | ✅ EXISTS | Enhance for AV |
| 118 | Security Briefing Distribution | `/modules/production/` | 📍 TAB | Add to event detail |
| 119 | Weather Alert Notification | `/modules/operations/weather` | ✅ EXISTS | Enhance with alerts |
| 120 | Emergency Protocol Activation | `/modules/operations/incidents` | ✅ EXISTS | Enhance with protocols |

**New Pages Recommended for Production Module:**
```
/modules/production/
├── registration/       ⚡ CRITICAL - Event registration
│   ├── page.tsx           (Registration dashboard)
│   ├── [event_id]/page.tsx (Event registrations)
│   ├── forms/page.tsx     (Registration forms)
│   └── waitlist/page.tsx  (Waitlist management)
├── ticketing/          ⚡ CRITICAL - Ticketing system
│   ├── page.tsx           (Ticket dashboard)
│   ├── [event_id]/page.tsx (Event tickets)
│   ├── types/page.tsx     (Ticket types)
│   └── orders/page.tsx    (Order history)
├── check-in/           ⚡ HIGH IMPACT - Check-in management
│   ├── page.tsx           (Check-in dashboard)
│   ├── [event_id]/page.tsx (Event check-in)
│   └── kiosk/page.tsx     (Kiosk mode)
├── sessions/           ⚡ HIGH IMPACT - Session management
│   ├── page.tsx           (Session list)
│   ├── [id]/page.tsx      (Session detail)
│   ├── tracks/page.tsx    (Session tracks)
│   └── schedule/page.tsx  (Session scheduler)
├── talent/             ⚡ HIGH IMPACT - Talent management (CONSOLIDATED: replaces speakers/)
│   ├── page.tsx           (Talent directory - all types)
│   ├── [id]/page.tsx      (Talent profile)
│   ├── portal/page.tsx    (Talent portal - self-service)
│   ├── types/page.tsx     (Talent types: Speaker, Performer, Artist, DJ, MC, etc.)
│   ├── bookings/page.tsx  (Talent bookings & contracts)
│   └── riders/page.tsx    (Technical & hospitality riders)
├── partners/           ⚡ HIGH IMPACT - Partner management (CONSOLIDATED: replaces sponsors/ + exhibitors/)
│   ├── page.tsx           (Partner list - all types)
│   ├── [id]/page.tsx      (Partner detail)
│   ├── types/page.tsx     (Partner types: Sponsor, Exhibitor, Vendor, Media, etc.)
│   ├── levels/page.tsx    (Sponsorship levels)
│   ├── deliverables/page.tsx (Deliverable tracking)
│   ├── booths/page.tsx    (Booth assignments - for exhibitor-type partners)
│   └── benefits/page.tsx  (Benefit fulfillment tracking)
├── credentials/        ⚡ HIGH IMPACT - Credential management (CONSOLIDATED: replaces badges/)
│   ├── page.tsx           (Credential dashboard)
│   ├── types/page.tsx     (Credential types: Badge, Wristband, Pass, Access Card, etc.)
│   ├── issued/page.tsx    (Issued credentials)
│   ├── designer/page.tsx  (Credential designer)
│   ├── print/page.tsx     (Print queue)
│   └── access-log/page.tsx (Access audit log)
├── hospitality/        - Hospitality management
│   ├── page.tsx           (Hospitality dashboard)
│   ├── catering/page.tsx  (Catering orders)
│   ├── accommodation/page.tsx (Accommodation)
│   └── transport/page.tsx (Transport)
├── networking/         - Attendee networking
│   ├── page.tsx           (Networking settings)
│   └── matches/page.tsx   (Match suggestions)
└── bookings/           ⚡ HIGH IMPACT - Talent/vendor bookings
    ├── page.tsx           (Booking list)
    └── [id]/page.tsx      (Booking detail)
```

---

### 11.8 Procurement & Supply Chain Workflows → `/modules/business/procurement/` (NEW)

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 121 | RFQ Creation & Distribution | `/modules/business/` | 🆕 NEW | **Create `/modules/business/procurement/rfq`** ⚡ |
| 122 | Vendor Bid Evaluation | `/modules/business/procurement/rfq` | 📍 TAB | Add "Bids" tab |
| 123 | Vendor Onboarding | `/modules/business/` | 🆕 NEW | **Create `/modules/business/procurement/vendors`** ⚡ |
| 124 | Vendor Performance Review | `/modules/business/procurement/vendors` | 📍 TAB | Add "Performance" tab |
| 125 | Contract Negotiation Tracking | `/modules/business/contracts` | 📍 TAB | Add "Negotiations" tab |
| 126 | Goods Receipt Confirmation | `/modules/business/` | 🆕 NEW | **Create `/modules/business/procurement/receipts`** |
| 127 | Quality Inspection | `/modules/business/procurement/receipts` | 📍 TAB | Add "QC" tab |
| 128 | Return to Vendor (RTV) | `/modules/business/` | 🆕 NEW | **Create `/modules/business/procurement/returns`** |
| 129 | Vendor Invoice Matching | `/modules/finance/invoices` | 📍 TAB | Add "Matching" tab |
| 130 | Blanket Order Release | `/modules/business/procurement/` | 📍 TAB | Add "Blanket Orders" |

**New Pages Recommended for Procurement:**
```
/modules/business/procurement/
├── page.tsx            - Procurement dashboard
├── rfq/                ⚡ HIGH IMPACT - RFQ management
│   ├── page.tsx           (RFQ list)
│   ├── [id]/page.tsx      (RFQ detail with bids)
│   └── templates/page.tsx (RFQ templates)
├── vendors/            ⚡ HIGH IMPACT - Vendor management
│   ├── page.tsx           (Vendor list)
│   ├── [id]/page.tsx      (Vendor detail)
│   └── onboarding/page.tsx (Onboarding queue)
├── receipts/           - Goods receipts
│   ├── page.tsx           (Receipt list)
│   └── [id]/page.tsx      (Receipt detail)
└── returns/            - Vendor returns
    ├── page.tsx           (Return list)
    └── [id]/page.tsx      (Return detail)
```

---

### 11.9 Service & Support Workflows → `/account/support/` + NEW

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 131 | Ticket Creation | `/account/support/tickets` | ✅ EXISTS | Enhance |
| 132 | Ticket Assignment Routing | `/account/support/tickets` | 📍 TAB | Add "Routing Rules" |
| 133 | SLA Breach Warning | `/account/support/` | 🆕 NEW | **Create `/modules/business/service/sla`** ⚡ |
| 134 | Ticket Escalation | `/account/support/tickets` | 📍 TAB | Add "Escalation" rules |
| 135 | Customer Satisfaction Survey | `/account/support/tickets/[id]` | 📍 TAB | Add "Feedback" tab |
| 136 | Knowledge Base Suggestion | `/account/support/knowledge-base` | ✅ EXISTS | Enhance with AI |
| 137 | Ticket Resolution Confirmation | `/account/support/tickets` | 📍 TAB | Add automation |
| 138 | Recurring Issue Detection | `/account/support/` | 🆕 NEW | **Create `/modules/business/service/insights`** |
| 139 | Service Level Reporting | `/account/support/` | 🆕 NEW | **Create `/modules/business/service/reports`** |

**New Pages Recommended - Service Hub:**
```
/modules/business/service/     ⚡ NEW MODULE - Customer Service Hub
├── page.tsx            - Service dashboard
├── tickets/            - Ticket management (internal)
│   ├── page.tsx           (All tickets)
│   └── [id]/page.tsx      (Ticket detail)
├── sla/                ⚡ HIGH IMPACT - SLA management
│   ├── page.tsx           (SLA policies)
│   └── [id]/page.tsx      (SLA detail)
├── insights/           - Service insights
│   └── page.tsx           (Issue patterns)
└── reports/            - Service reports
    └── page.tsx           (SLA reports)
```

---

### 11.10 Compliance & Governance Workflows → `/modules/business/compliance/` (NEW)

| # | Workflow | Target Page | Location Type | Implementation |
|---|----------|-------------|---------------|----------------|
| 140 | Policy Acknowledgment | `/modules/business/` | 🆕 NEW | **Create `/modules/business/compliance/policies`** ⚡ |
| 141 | Compliance Training Assignment | `/modules/workforce/training` | 📍 TAB | Add "Compliance" filter |
| 142 | Audit Schedule Notification | `/modules/business/` | 🆕 NEW | **Create `/modules/business/compliance/audits`** |
| 143 | Incident Report Filing | `/modules/operations/incidents` | ✅ EXISTS | Enhance |
| 144 | Risk Assessment Review | `/modules/business/` | 🆕 NEW | **Create `/modules/business/compliance/risks`** |
| 145 | Document Retention Policy | `/core/documents` | 📍 TAB | Add "Retention" settings |
| 146 | GDPR Data Request | `/account/` | 🆕 NEW | **Create `/account/privacy/requests`** ⚡ |
| 147 | Data Breach Notification | `/account/privacy` | 📍 TAB | Add "Incidents" tab |
| 148 | License/Permit Renewal | `/modules/business/` | 🆕 NEW | **Create `/modules/business/compliance/licenses`** |
| 149 | Insurance Policy Renewal | `/modules/business/` | 🆕 NEW | **Create `/modules/business/compliance/insurance`** |
| 150 | Safety Inspection Scheduling | `/modules/operations/` | 🆕 NEW | **Create `/modules/operations/safety`** |

**New Pages Recommended for Compliance:**
```
/modules/business/compliance/
├── page.tsx            - Compliance dashboard
├── policies/           ⚡ HIGH IMPACT - Policy management
│   ├── page.tsx           (Policy list)
│   ├── [id]/page.tsx      (Policy detail)
│   └── acknowledgments/page.tsx (Acknowledgment tracking)
├── audits/             - Audit management
│   ├── page.tsx           (Audit schedule)
│   └── [id]/page.tsx      (Audit detail)
├── risks/              - Risk register
│   ├── page.tsx           (Risk list)
│   └── [id]/page.tsx      (Risk detail)
├── licenses/           - License/permit tracking
│   ├── page.tsx           (License list)
│   └── [id]/page.tsx      (License detail)
└── insurance/          - Insurance management
    ├── page.tsx           (Policy list)
    └── [id]/page.tsx      (Policy detail)

/modules/operations/safety/
├── page.tsx            - Safety dashboard
├── inspections/page.tsx - Inspection schedule
└── checklists/page.tsx  - Safety checklists

/account/privacy/
├── page.tsx            - Privacy center
├── requests/page.tsx   ⚡ HIGH IMPACT - Data subject requests
└── incidents/page.tsx  - Breach incidents
```

---

## 11.11 Summary: New Pages Required

### Critical Priority (Create First)
| Page | Path | Workflows Enabled | Impact |
|------|------|-------------------|--------|
| **Event Registration** | `/modules/production/registration` | 100, 101 | Revenue |
| **Ticketing System** | `/modules/production/ticketing` | 97 | Revenue |
| **Check-in** | `/modules/production/check-in` | 98, 107, 108 | Operations |
| **Banking** | `/modules/finance/banking` | 35, 30 | Finance |
| **Sequences** | `/modules/business/sequences` | 3, 8, 17 | Sales |

### High Priority
| Page | Path | Workflows Enabled | Impact |
|------|------|-------------------|--------|
| Sessions | `/modules/production/sessions` | 102, 112, 113 | Event Experience |
| Speakers | `/modules/production/speakers` | 103, 104 | Event Experience |
| Sponsors | `/modules/production/sponsors` | 105 | Revenue |
| Badges | `/modules/production/badges` | 107 | Operations |
| Leave Management | `/modules/workforce/leave` | 62, 63 | HR |
| Onboarding | `/modules/workforce/onboarding` | 60 | HR |
| Payroll | `/modules/workforce/payroll` | 67 | HR |
| Resources | `/modules/projects/resources` | 84, 91 | PM |
| Time Tracking | `/modules/projects/time` | 90 | PM |
| Procurement | `/modules/business/procurement` | 121-130 | Operations |
| Compliance | `/modules/business/compliance` | 140-150 | Governance |

### Medium Priority
| Page | Path | Workflows Enabled |
|------|------|-------------------|
| Forms | `/content/forms` | 18 |
| Landing Pages | `/content/landing-pages` | 19 |
| Subscribers | `/content/subscribers` | 25, 26 |
| Exhibitors | `/modules/production/exhibitors` | 106 |
| Hospitality | `/modules/production/hospitality` | 99, 116 |
| Networking | `/modules/production/networking` | 111 |
| Performance | `/modules/workforce/performance` | 64, 65 |
| Training | `/modules/workforce/training` | 66 |
| Service Hub | `/modules/business/service` | 131-139 |

---

## 11.12 Tab Additions to Existing Pages

### `/modules/business/leads`
- **Scoring** — Lead scoring rules and current scores
- **Assignment Rules** — Auto-assignment configuration

### `/modules/business/deals`
- **Automation** — Stage progression rules
- **Analytics** — Win/loss analysis
- **Opportunities** — Upsell/cross-sell suggestions

### `/modules/business/contacts`
- **Health Score** — Churn risk indicators
- **Credit** — Credit limits and history

### `/modules/business/contracts`
- **Renewals** — Upcoming renewals list
- **Negotiations** — Negotiation tracking

### `/modules/finance/payments`
- **Reconciliation** — Payment matching
- **Vendor Payments** — AP payments

### `/modules/finance/invoices`
- **Matching** — 3-way matching (PO, receipt, invoice)

### `/modules/assets/inventory`
- **Alerts** — Low stock alerts config
- **Reorder** — Reorder point settings
- **Valuation** — Inventory valuation

### `/modules/workforce/shifts`
- **Swap Requests** — Shift swap queue

### `/modules/workforce/timesheets`
- **Overtime** — Overtime approval queue

### `/modules/workforce/schedules`
- **Conflicts** — Availability conflicts view

### `/modules/projects/sprints`
- **Auto-create** — Sprint auto-creation settings

### `/modules/projects/roadmaps`
- **Milestones** — Milestone alerts

### `/modules/production/events/[id]`
- **Feedback** — Event feedback collection
- **Surveys** — Post-event surveys
- **Security** — Security briefings

### `/modules/operations/venues`
- **Bookings** — Venue booking calendar

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-8) — Critical Gaps

**Priority: Critical/High workflows and features**

#### 5.1.1 Event Registration & Ticketing System
- Event registration portal with custom forms
- Ticketing system with pricing tiers
- Payment processing (Stripe integration)
- Confirmation emails and tickets
- Waitlist management

#### 5.1.2 Core CRM Workflows
- Lead scoring automation
- Lead assignment routing
- Deal stage progression
- Contract renewal reminders
- Customer onboarding sequences

#### 5.1.3 Finance Enhancements
- Full GL/Chart of Accounts
- Bank reconciliation
- Payment reconciliation
- Multi-currency support

### Phase 2: Event Experience (Weeks 9-16)

#### 5.2.1 Attendee Experience
- Mobile event app (React Native)
- QR code check-in
- Badge generation and printing
- Session management
- Speaker portal

#### 5.2.2 Sponsor & Exhibitor Management
- Sponsor portal with deliverable tracking
- Exhibitor onboarding workflow
- Lead retrieval system
- Booth assignment

#### 5.2.3 Virtual/Hybrid Events
- Live streaming integration
- Virtual networking rooms
- On-demand content library
- Hybrid session management

### Phase 3: Marketing & Sales Automation (Weeks 17-24)

#### 5.3.1 Marketing Automation Engine
- Email campaign builder
- Drip campaign sequences
- Landing page builder
- Form builder with conditional logic
- A/B testing

#### 5.3.2 Sales Enablement
- Sales sequences/cadences
- Meeting scheduler
- Call tracking
- Quote generation
- E-signature integration

### Phase 4: HR & Operations (Weeks 25-32)

#### 5.4.1 HR Workflows
- Employee onboarding/offboarding
- Leave management
- Performance reviews
- Payroll integration
- Benefits administration

#### 5.4.2 Procurement & Supply Chain
- RFQ management
- Vendor onboarding
- Goods receipt
- Invoice matching
- Quality inspection

### Phase 5: Advanced Features (Weeks 33-40)

#### 5.5.1 Advanced Analytics
- Custom dashboard builder
- Event ROI calculation
- Predictive analytics
- Anomaly detection

#### 5.5.2 Advanced Integrations
- Full Zapier/Make integration
- Salesforce bi-directional sync
- QuickBooks/Xero sync
- ADP/Paychex payroll

---

## 6. Database Schema Additions Required

### 6.0 3NF & SSOT Architecture Principles

All schema additions in this document adhere to **Third Normal Form (3NF)** and **Single Source of Truth (SSOT)** principles.

#### Schema Consolidation Summary (Lowest Common Denominator)

The following consolidations reduce table count and enforce SSOT by using polymorphic patterns:

| Before (Separate Tables) | After (Consolidated) | Rationale |
|--------------------------|---------------------|-----------|
| `speakers` | `talent` | Speakers, performers, artists, DJs, MCs, hosts are all **talent** with different `talent_type_id` |
| `speaker_roles` | `talent_roles` | Unified roles: Presenter, Moderator, Performer, Host, etc. |
| `speaker_topics` | `talent_skills` | Unified: topics, genres, techniques, instruments are all **skills** |
| `topics` | `skills` | Hierarchical skill taxonomy with categories |
| `speaker_social_links` | `talent_social_links` | Extended platforms: Spotify, SoundCloud, Bandcamp, TikTok |
| `session_speakers` | `session_talent` | Unified junction with fee tracking |
| `event_sponsors` + `exhibitors` | `event_partners` | Sponsors, exhibitors, vendors, media partners are all **partners** with different `partner_type_id` |
| `sponsor_deliverables` | `partner_deliverables` | Works for all partner types |
| `sponsor_contacts` | `partner_contacts` | Extended roles: booth_staff, technical |
| `exhibitor_requirements` | `partner_requirements` | Works for all partner types |
| `badge_types` | `credential_types` | Badges, wristbands, passes, access cards are all **credentials** with different `format` |
| `exhibitor_badges` | `issued_credentials` | Polymorphic: source_type tracks origin (registration, partner, talent, staff, etc.) |

**New Lookup Tables Added:**
- `talent_types` — Speaker, Performer, Artist, Host, DJ, MC, Musician, Comedian
- `partner_types` — Sponsor, Exhibitor, Vendor, Media Partner, Community Partner
- `credential_types.format` — badge, wristband, lanyard, digital_pass, access_card, ticket

**New Supporting Tables:**
- `talent_media` — Portfolio items, demo reels, recordings
- `talent_riders` — Technical/hospitality requirements
- `credential_access_log` — Immutable access audit trail
- `credential_print_queue` — Physical credential printing

#### Additional Consolidations (Cross-Cutting Concerns)

The following polymorphic patterns eliminate redundant per-entity tables:

| Pattern | Replaces | Consolidated Table | Polymorphic Key |
|---------|----------|-------------------|-----------------|
| **Addresses** | Embedded address fields on contacts, companies, venues, events | `addresses` | `addressable_type` + `addressable_id` |
| **Notes/Comments** | Per-entity notes tables | `notes` | `notable_type` + `notable_id` |
| **Tags** | Embedded tag arrays or per-entity tag tables | `tags` + `taggables` | `taggable_type` + `taggable_id` |
| **Attachments** | Scattered document references | `attachments` | `attachable_type` + `attachable_id` |
| **Audit Log** | Per-entity history/changelog tables | `audit_log` | `entity_type` + `entity_id` |
| **Custom Fields** | Per-entity custom field implementations | `custom_field_definitions` + `custom_field_values` | `entity_type` + `entity_id` |
| **Followers** | Per-entity watcher/subscriber tables | `followers` | `followable_type` + `followable_id` |
| **Activity Feed** | Per-entity activity/history streams | `activity_feed` | `entity_type` + `entity_id` |

**Cross-Cutting Table Count:** 8 polymorphic tables replace potentially 50+ per-entity tables

#### 3NF Compliance Rules
1. **1NF**: All fields are atomic (no arrays of composite data, no repeating groups)
2. **2NF**: All non-key attributes depend on the entire primary key
3. **3NF**: No transitive dependencies — non-key attributes depend only on the primary key

#### SSOT Compliance Rules
1. **Canonical Ownership**: Each entity has exactly ONE authoritative table
2. **Reference by FK**: Related data accessed via foreign keys, never duplicated
3. **Lookup Tables**: All enumerable values stored in dedicated lookup tables
4. **No Derived Storage**: Calculated values computed at query time, not stored (except for performance-critical aggregates with documented justification)
5. **Immutable History**: Financial and compliance records use versioning, not updates

#### Anti-Patterns to Avoid
| Anti-Pattern | Example | Correct Approach |
|--------------|---------|------------------|
| Denormalized status | `status TEXT` | `status_id UUID REFERENCES statuses(id)` |
| Embedded enums | `type IN ('a','b','c')` | Lookup table with FK reference |
| Duplicated contact info | `company TEXT, job_title TEXT` on speaker | FK to `contacts` table |
| Stored calculations | `total_amount` on parent | Compute from line items |
| Inline JSON arrays | `benefits JSONB DEFAULT '[]'` | Junction table for M:N |

---

### 6.0.1 Consolidated Lookup Tables (SSOT)

All status, type, and category enumerations are centralized in lookup tables. These are the **canonical sources** for all reference data.

```sql
-- ============================================================
-- SSOT: CONSOLIDATED LOOKUP TABLES
-- These are the SINGLE SOURCE OF TRUTH for all enumerable values
-- ============================================================

-- Generic Status Lookup (polymorphic, domain-scoped)
CREATE TABLE statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,  -- 'registration', 'ticket', 'session', 'sponsor', etc.
  code TEXT NOT NULL,    -- Machine-readable: 'pending', 'confirmed', 'cancelled'
  name TEXT NOT NULL,    -- Display name: 'Pending', 'Confirmed', 'Cancelled'
  description TEXT,
  color TEXT,            -- UI color code
  icon TEXT,             -- Icon identifier
  is_terminal BOOLEAN DEFAULT FALSE,  -- No further transitions allowed
  is_default BOOLEAN DEFAULT FALSE,   -- Default for new records
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain, code)
);

-- Status Transitions (defines valid state machine)
CREATE TABLE status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  from_status_id UUID REFERENCES statuses(id),
  to_status_id UUID REFERENCES statuses(id) NOT NULL,
  requires_permission TEXT,  -- Permission code required
  requires_approval BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain, from_status_id, to_status_id)
);

-- Currencies (SSOT for all monetary values)
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- ISO 4217: 'USD', 'EUR', 'GBP'
  name TEXT NOT NULL,             -- 'US Dollar', 'Euro'
  symbol TEXT NOT NULL,           -- '$', '€', '£'
  decimal_places INT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

-- Countries (SSOT for geographic reference)
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- ISO 3166-1 alpha-2: 'US', 'GB'
  code3 TEXT NOT NULL UNIQUE,     -- ISO 3166-1 alpha-3: 'USA', 'GBR'
  name TEXT NOT NULL,
  phone_code TEXT,                -- '+1', '+44'
  currency_id UUID REFERENCES currencies(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- Time Zones (SSOT)
CREATE TABLE time_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- 'America/New_York', 'Europe/London'
  name TEXT NOT NULL,             -- 'Eastern Time', 'GMT'
  utc_offset_minutes INT NOT NULL,
  observes_dst BOOLEAN DEFAULT FALSE
);

-- Languages (SSOT for i18n)
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- ISO 639-1: 'en', 'es', 'fr'
  name TEXT NOT NULL,             -- 'English', 'Spanish'
  native_name TEXT,               -- 'English', 'Español'
  direction TEXT DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
  is_active BOOLEAN DEFAULT TRUE
);

-- Units of Measure (SSOT for inventory/assets)
CREATE TABLE units_of_measure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- 'EA', 'HR', 'DAY', 'KG', 'M'
  name TEXT NOT NULL,             -- 'Each', 'Hour', 'Day', 'Kilogram', 'Meter'
  category TEXT NOT NULL,         -- 'quantity', 'time', 'weight', 'length'
  base_unit_id UUID REFERENCES units_of_measure(id),
  conversion_factor DECIMAL(18,6) DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

-- Document Types (SSOT)
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  allowed_extensions TEXT[],      -- ['.pdf', '.docx']
  max_size_bytes BIGINT,
  requires_approval BOOLEAN DEFAULT FALSE,
  retention_days INT,             -- NULL = indefinite
  is_active BOOLEAN DEFAULT TRUE
);

-- Notification Channels (SSOT)
CREATE TABLE notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- 'email', 'sms', 'push', 'in_app', 'slack'
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Payment Methods (SSOT)
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,      -- 'credit_card', 'bank_transfer', 'check', 'cash'
  name TEXT NOT NULL,
  processor TEXT,                 -- 'stripe', 'paypal', NULL for manual
  is_active BOOLEAN DEFAULT TRUE
);

-- Tax Categories (SSOT)
CREATE TABLE tax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  default_rate_percent DECIMAL(5,4),  -- 0.0825 = 8.25%
  is_active BOOLEAN DEFAULT TRUE
);
```

---

### 6.0.2 Domain-Specific Lookup Tables

```sql
-- ============================================================
-- DOMAIN: EVENT MANAGEMENT
-- ============================================================

CREATE TABLE registration_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  access_level INT DEFAULT 0,     -- Numeric for comparison
  badge_color TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

CREATE TABLE session_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,             -- 'Keynote', 'Breakout', 'Workshop', 'Panel'
  description TEXT,
  default_duration_minutes INT,
  requires_registration BOOLEAN DEFAULT FALSE,
  max_speakers INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id, code)
);

-- CONSOLIDATED: talent_roles replaces speaker_roles
-- Supports all talent types: speakers, performers, artists, hosts, etc.
CREATE TABLE talent_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Presenter', 'Moderator', 'Panelist', 'Host', 'Performer', 'DJ', 'MC', 'Artist'
  description TEXT,
  talent_type TEXT,               -- NULL = all types, or 'speaker', 'performer', 'artist', etc.
  sort_order INT DEFAULT 0
);

CREATE TABLE sponsorship_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,             -- 'Platinum', 'Gold', 'Silver', 'Bronze'
  description TEXT,
  base_price_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  max_sponsors INT,               -- NULL = unlimited
  sort_order INT DEFAULT 0,       -- 1 = highest tier
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id, code)
);

CREATE TABLE sponsorship_benefit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Logo on Website', 'Booth Space', 'Speaking Slot'
  description TEXT,
  category TEXT,                  -- 'branding', 'access', 'content', 'hospitality'
  is_quantifiable BOOLEAN DEFAULT FALSE,
  unit_of_measure_id UUID REFERENCES units_of_measure(id),
  sort_order INT DEFAULT 0
);

-- Junction: Which benefits each sponsorship level includes (3NF M:N)
CREATE TABLE sponsorship_level_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_level_id UUID NOT NULL REFERENCES sponsorship_levels(id) ON DELETE CASCADE,
  benefit_type_id UUID NOT NULL REFERENCES sponsorship_benefit_types(id),
  quantity INT DEFAULT 1,
  notes TEXT,
  UNIQUE(sponsorship_level_id, benefit_type_id)
);

CREATE TABLE deliverable_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Logo File', 'Company Description', 'Speaker Bio'
  description TEXT,
  document_type_id UUID REFERENCES document_types(id),
  default_due_days_before_event INT,
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- CONSOLIDATED: credential_types replaces badge_types
-- Credentials include: badges, passes, wristbands, lanyards, digital passes, access cards
CREATE TABLE credential_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,             -- 'Attendee Badge', 'VIP Pass', 'Staff Credential', 'Press Badge', 'Backstage Pass'
  description TEXT,
  
  -- Credential format
  format TEXT NOT NULL CHECK (format IN ('badge', 'wristband', 'lanyard', 'digital_pass', 'access_card', 'ticket')),
  template_id UUID,               -- Reference to design template
  
  -- Visual attributes
  color TEXT,
  icon TEXT,
  
  -- Access control
  access_level INT DEFAULT 0,     -- Numeric for comparison (higher = more access)
  access_zones UUID[],            -- venue_zones this credential grants access to
  
  -- Validity
  valid_from_event_start BOOLEAN DEFAULT TRUE,
  valid_until_event_end BOOLEAN DEFAULT TRUE,
  custom_valid_from TIMESTAMPTZ,
  custom_valid_until TIMESTAMPTZ,
  
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id, code)
);

-- ============================================================
-- DOMAIN: FINANCE & ACCOUNTING
-- ============================================================

CREATE TABLE account_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  sort_order INT DEFAULT 0
);

CREATE TABLE payment_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Net 30', 'Due on Receipt', '2/10 Net 30'
  days_until_due INT NOT NULL,
  discount_percent DECIMAL(5,4),
  discount_days INT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  gl_account_id UUID REFERENCES chart_of_accounts(id),
  requires_receipt_above_cents BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id, code)
);

-- ============================================================
-- DOMAIN: HR & WORKFORCE
-- ============================================================

CREATE TABLE employment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Full-time', 'Part-time', 'Contractor', 'Freelance'
  description TEXT,
  is_employee BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,             -- 'Vacation', 'Sick', 'Personal', 'Bereavement'
  description TEXT,
  default_days_per_year DECIMAL(5,2),
  accrual_rate_per_month DECIMAL(5,2),
  max_carryover_days DECIMAL(5,2),
  requires_approval BOOLEAN DEFAULT TRUE,
  is_paid BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id, code)
);

CREATE TABLE certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  issuing_authority TEXT,
  validity_months INT,            -- NULL = no expiration
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  UNIQUE(org_id, code)
);

CREATE TABLE position_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  default_hourly_rate_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  requires_certifications UUID[],  -- Array of certification_type IDs required
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id, code)
);

-- ============================================================
-- DOMAIN: LEAD SCORING & MARKETING
-- ============================================================

CREATE TABLE lead_score_rule_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Demographic', 'Behavioral', 'Engagement', 'Firmographic'
  description TEXT,
  max_score INT DEFAULT 100,
  sort_order INT DEFAULT 0
);

CREATE TABLE email_template_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Transactional', 'Marketing', 'Notification', 'Sequence'
  description TEXT,
  requires_unsubscribe BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE TABLE sequence_trigger_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Form Submission', 'List Membership', 'Deal Stage', 'Manual'
  description TEXT,
  entity_type TEXT,               -- Which entity triggers this
  sort_order INT DEFAULT 0
);
```

---

### 6.1 Event Registration & Ticketing (3NF Compliant)

```sql
-- ============================================================
-- EVENT REGISTRATION (3NF Compliant)
-- ============================================================
-- 3NF Analysis:
-- - No transitive dependencies (all FKs to lookup tables)
-- - No stored calculations (total computed from line items)
-- - Attendee info via FK to contacts (SSOT)
-- - Status via FK to statuses table (SSOT)
-- ============================================================

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- SSOT: Contact is canonical source for attendee info
  attendee_contact_id UUID NOT NULL REFERENCES contacts(id),
  
  -- SSOT: All types/statuses via FK to lookup tables
  registration_type_id UUID NOT NULL REFERENCES registration_types(id),
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='registration'
  
  -- Registration metadata (no duplication)
  confirmation_number TEXT NOT NULL UNIQUE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Check-in tracking (event-specific, not duplicated)
  checked_in_at TIMESTAMPTZ,
  checked_in_by_user_id UUID REFERENCES profiles(id),
  check_in_method TEXT CHECK (check_in_method IN ('qr_scan', 'manual', 'self_service')),
  
  -- Badge tracking
  badge_printed_at TIMESTAMPTZ,
  badge_type_id UUID REFERENCES badge_types(id),
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES profiles(id),
  
  -- Constraints
  UNIQUE(event_id, attendee_contact_id)  -- One registration per attendee per event
);

-- Registration Line Items (3NF: Separates ticket purchases from registration)
-- This allows multiple ticket types per registration and proper financial tracking
CREATE TABLE registration_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents BIGINT NOT NULL,  -- Captured at time of purchase
  currency_id UUID NOT NULL REFERENCES currencies(id),
  discount_cents BIGINT DEFAULT 0,
  tax_cents BIGINT DEFAULT 0,
  -- Note: line_total NOT stored (3NF) — computed as: (unit_price_cents * quantity) - discount_cents + tax_cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Types (3NF: No redundant event info)
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing (SSOT: currency via FK)
  price_cents BIGINT NOT NULL,
  currency_id UUID NOT NULL REFERENCES currencies(id),
  
  -- Inventory
  quantity_available INT,  -- NULL = unlimited
  -- Note: quantity_sold NOT stored (3NF) — computed from registration_line_items
  
  -- Sale window
  sale_start_at TIMESTAMPTZ,
  sale_end_at TIMESTAMPTZ,
  
  -- Order constraints
  min_per_order INT DEFAULT 1 CHECK (min_per_order >= 1),
  max_per_order INT DEFAULT 10 CHECK (max_per_order >= 1),
  
  -- Access control
  registration_type_id UUID REFERENCES registration_types(id),  -- What reg type this grants
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, code)
);

-- Waitlist (3NF: References canonical tables)
CREATE TABLE event_waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  
  -- Position managed by trigger/function for consistency
  position INT NOT NULL,
  
  -- Status via SSOT
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='waitlist'
  
  -- Notification tracking
  notified_at TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, contact_id, ticket_type_id)
);

-- Promo Codes (3NF: Separate from ticket types)
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,  -- NULL = org-wide
  
  code TEXT NOT NULL,
  description TEXT,
  
  -- Discount type (mutually exclusive)
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,  -- Percent (0-100) or cents
  currency_id UUID REFERENCES currencies(id),  -- Required if fixed_amount
  
  -- Constraints
  max_uses INT,  -- NULL = unlimited
  -- Note: times_used NOT stored (3NF) — computed from registration_promo_codes
  max_uses_per_contact INT DEFAULT 1,
  min_order_cents BIGINT,
  
  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- Junction: Promo codes applied to registrations (3NF M:N)
CREATE TABLE registration_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  discount_applied_cents BIGINT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(registration_id, promo_code_id)
);
```

### 6.2 Session & Talent Management (3NF Compliant)

```sql
-- ============================================================
-- SESSION MANAGEMENT (3NF Compliant)
-- ============================================================
-- 3NF Analysis:
-- - Session tracks are separate entity (no embedded track names)
-- - Room references venue_zones (SSOT for spaces)
-- - Talent info via contacts table (no duplication)
-- - Attendance tracked separately from registration
-- ============================================================

-- Session Tracks (3NF: Separate from sessions)
CREATE TABLE session_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(event_id, code)
);

CREATE TABLE event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- SSOT: Track and room via FK
  track_id UUID REFERENCES session_tracks(id),
  room_id UUID REFERENCES venue_zones(id),  -- SSOT: venue_zones is canonical for spaces
  
  -- Session details
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- SSOT: Type via lookup table
  session_type_id UUID NOT NULL REFERENCES session_types(id),
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='session'
  
  -- Schedule
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  
  -- Capacity (NULL = room capacity or unlimited)
  capacity_override INT,
  -- Note: registered_count NOT stored (3NF) — computed from session_registrations
  
  -- Flags
  is_featured BOOLEAN DEFAULT FALSE,
  requires_registration BOOLEAN DEFAULT FALSE,
  is_recordable BOOLEAN DEFAULT TRUE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, code),
  CONSTRAINT valid_schedule CHECK (scheduled_end_at > scheduled_start_at)
);

-- Session Resources (3NF: Separate table for recordings, slides, etc.)
CREATE TABLE session_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('recording', 'slides', 'handout', 'transcript', 'other')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  document_id UUID REFERENCES documents(id),  -- If stored internally
  is_public BOOLEAN DEFAULT FALSE,
  available_from TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, resource_type, name)
);

-- ============================================================
-- TALENT MANAGEMENT (3NF Compliant)
-- ============================================================
-- CONSOLIDATED: Replaces separate speakers table
-- Talent is polymorphic: speakers, performers, artists, hosts, DJs, MCs, etc.
-- Talent is a ROLE, not a person — person data lives in contacts
-- ============================================================

-- Talent Types (SSOT lookup for polymorphic talent)
CREATE TABLE talent_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Speaker', 'Performer', 'Artist', 'Host', 'DJ', 'MC', 'Musician', 'Comedian'
  description TEXT,
  category TEXT NOT NULL,         -- 'speaking', 'entertainment', 'facilitation'
  icon TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE talent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- SSOT: Contact is canonical source for name, email, phone
  contact_id UUID NOT NULL REFERENCES contacts(id),
  
  -- Talent type (polymorphic)
  talent_type_id UUID NOT NULL REFERENCES talent_types(id),
  
  -- Talent-specific attributes (may differ from contact)
  stage_name TEXT,                -- Artist/performer stage name
  professional_bio TEXT,          -- May differ from contact bio
  headshot_url TEXT,              -- May differ from contact photo
  
  -- Professional context (may differ from contact's company)
  professional_title TEXT,        -- "CEO & Founder", "Lead Singer", "Keynote Speaker"
  represented_company TEXT,       -- May represent differently per context
  
  -- Booking info
  booking_rate_cents BIGINT,
  booking_rate_type TEXT CHECK (booking_rate_type IN ('flat', 'hourly', 'daily', 'per_event')),
  currency_id UUID REFERENCES currencies(id),
  
  -- Agent/manager (if applicable)
  agent_contact_id UUID REFERENCES contacts(id),
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='talent'
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, contact_id, talent_type_id)  -- One talent record per contact per type per org
);

-- Talent Skills/Topics (3NF: M:N junction instead of array)
-- Unified: speakers have topics, performers have skills/genres
CREATE TABLE talent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),  -- SSOT: skills table (unified topics/skills)
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE(talent_id, skill_id)
);

-- Skills (SSOT - consolidates topics, skills, genres, expertise areas)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),  -- NULL = global
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,         -- 'topic', 'genre', 'technique', 'language', 'instrument'
  parent_skill_id UUID REFERENCES skills(id),  -- Hierarchical
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(COALESCE(org_id, '00000000-0000-0000-0000-000000000000'::UUID), code)
);

-- Talent Social Links (3NF: Separate table instead of JSONB)
CREATE TABLE talent_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'github', 'website', 'youtube', 'instagram', 'spotify', 'soundcloud', 'bandcamp', 'tiktok', 'other')),
  url TEXT NOT NULL,
  UNIQUE(talent_id, platform)
);

-- Talent Media (portfolio items, demo reels, recordings)
CREATE TABLE talent_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'audio', 'image', 'document', 'link')),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,           -- For video/audio
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Talent Junction (3NF: M:N with role)
-- Replaces session_speakers
CREATE TABLE session_talent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
  
  -- SSOT: Role via lookup table
  talent_role_id UUID NOT NULL REFERENCES talent_roles(id),
  
  -- Presentation/performance order
  sort_order INT DEFAULT 0,
  
  -- Time allocation (for multi-talent sessions)
  allocated_minutes INT,
  
  -- Confirmation tracking
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='session_talent'
  invited_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  -- Compensation for this specific engagement
  fee_cents BIGINT,
  fee_currency_id UUID REFERENCES currencies(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, talent_id)
);

-- Talent Riders (technical/hospitality requirements)
CREATE TABLE talent_riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
  rider_type TEXT NOT NULL CHECK (rider_type IN ('technical', 'hospitality', 'travel', 'security')),
  name TEXT NOT NULL,
  description TEXT,
  document_id UUID REFERENCES documents(id),
  is_mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Registrations (3NF: Attendance separate from registration status)
CREATE TABLE session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  
  -- SSOT: Status via lookup
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='session_registration'
  
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  
  UNIQUE(session_id, registration_id)
);

-- Session Attendance (3NF: Separate from registration for accurate tracking)
CREATE TABLE session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  check_in_method TEXT CHECK (check_in_method IN ('qr_scan', 'manual', 'beacon', 'self_service')),
  
  -- Duration tracking (for partial attendance)
  -- Note: duration NOT stored (3NF) — computed from checked_in_at/checked_out_at
  
  UNIQUE(session_id, registration_id)
);
```

### 6.3 Partner Management (3NF Compliant)

```sql
-- ============================================================
-- PARTNER MANAGEMENT (3NF Compliant)
-- ============================================================
-- CONSOLIDATED: Replaces separate sponsors and exhibitors tables
-- Partners is polymorphic: sponsors, exhibitors, vendors, media partners, etc.
-- 3NF Analysis:
-- - Company info via FK to companies (SSOT)
-- - Benefits via junction table (not JSONB array)
-- - Deliverables as separate entities with proper FKs
-- - Booth assignments separate from partner record
-- ============================================================

-- Partner Types (SSOT lookup for polymorphic partners)
CREATE TABLE partner_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- 'Sponsor', 'Exhibitor', 'Vendor', 'Media Partner', 'Community Partner'
  description TEXT,
  has_booth BOOLEAN DEFAULT FALSE,
  has_sponsorship_level BOOLEAN DEFAULT FALSE,
  icon TEXT,
  sort_order INT DEFAULT 0
);

-- Event Partners (consolidated sponsors + exhibitors)
CREATE TABLE event_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- SSOT: Company is canonical source for org info
  company_id UUID NOT NULL REFERENCES companies(id),
  
  -- Partner type (polymorphic)
  partner_type_id UUID NOT NULL REFERENCES partner_types(id),
  
  -- SSOT: Level (for sponsors) and status via lookup tables
  sponsorship_level_id UUID REFERENCES sponsorship_levels(id),  -- NULL for non-sponsors
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='partner'
  
  -- Contract reference (SSOT: contracts table)
  contract_id UUID REFERENCES contracts(id),
  
  -- Partner-specific overrides (may differ from company record)
  display_name TEXT,  -- NULL = use company.name
  display_logo_url TEXT,  -- NULL = use company.logo_url
  display_description TEXT,  -- NULL = use company.description
  display_website_url TEXT,  -- NULL = use company.website_url
  
  -- Note: total_value NOT stored (3NF) — computed from contract or level price
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, company_id, partner_type_id)  -- One partnership per type per company per event
);

-- Partner Benefits Granted (3NF: Junction table for M:N)
-- Tracks which specific benefits were granted to this partner
CREATE TABLE partner_benefits_granted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
  benefit_type_id UUID NOT NULL REFERENCES sponsorship_benefit_types(id),
  
  -- Quantity granted (may differ from level default)
  quantity_granted INT NOT NULL DEFAULT 1,
  quantity_used INT DEFAULT 0,
  
  -- Fulfillment tracking
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='benefit'
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, benefit_type_id)
);

-- Partner Deliverables (3NF: Proper entity with FKs)
-- Replaces sponsor_deliverables - works for all partner types
CREATE TABLE partner_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
  
  -- SSOT: Type via lookup table
  deliverable_type_id UUID NOT NULL REFERENCES deliverable_types(id),
  
  -- Deliverable details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Schedule
  due_at TIMESTAMPTZ NOT NULL,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Status tracking
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='deliverable'
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  
  -- Document reference (SSOT: documents table)
  document_id UUID REFERENCES documents(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner Contacts (3NF: Junction for M:N with role)
-- Links partners to their contact people with specific roles
CREATE TABLE partner_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  
  role TEXT NOT NULL CHECK (role IN ('primary', 'billing', 'marketing', 'logistics', 'executive', 'technical', 'booth_staff')),
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, contact_id, role)
);

-- ============================================================
-- BOOTH MANAGEMENT (for partners with booths)
-- ============================================================

-- Booth Assignments (3NF: Separate from partner)
CREATE TABLE booth_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES event_partners(id) ON DELETE SET NULL,  -- Can be unassigned
  
  -- Booth identification
  booth_number TEXT NOT NULL,
  booth_name TEXT,
  
  -- Location (SSOT: venue_zones for floor plan reference)
  zone_id UUID REFERENCES venue_zones(id),
  
  -- Booth specifications
  booth_type_id UUID NOT NULL REFERENCES booth_types(id),
  width_meters DECIMAL(5,2),
  depth_meters DECIMAL(5,2),
  -- Note: area NOT stored (3NF) — computed from width * depth
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='booth'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, booth_number)
);

-- Booth Types (SSOT lookup)
CREATE TABLE booth_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),  -- NULL = global
  code TEXT NOT NULL,
  name TEXT NOT NULL,  -- 'Standard', 'Corner', 'Island', 'Inline'
  description TEXT,
  default_width_meters DECIMAL(5,2),
  default_depth_meters DECIMAL(5,2),
  base_price_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  sort_order INT DEFAULT 0,
  UNIQUE(COALESCE(org_id, '00000000-0000-0000-0000-000000000000'::UUID), code)
);

-- Partner Requirements (3NF: Separate table instead of TEXT fields)
-- Replaces exhibitor_requirements - works for all partner types
CREATE TABLE partner_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
  requirement_type_id UUID NOT NULL REFERENCES requirement_types(id),
  
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  
  -- Fulfillment
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='requirement'
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, requirement_type_id)
);

-- Requirement Types (SSOT lookup)
CREATE TABLE requirement_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,  -- 'Electrical', 'Internet', 'Furniture', 'AV Equipment', 'Rigging'
  category TEXT NOT NULL,  -- 'utilities', 'furniture', 'av', 'services'
  description TEXT,
  default_cost_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  sort_order INT DEFAULT 0
);

-- ============================================================
-- CREDENTIAL MANAGEMENT (3NF Compliant)
-- ============================================================
-- CONSOLIDATED: Replaces badges, passes, wristbands, access cards
-- Credentials are polymorphic access tokens issued to people
-- ============================================================

-- Issued Credentials (replaces exhibitor_badges and all badge tables)
CREATE TABLE issued_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,  -- NULL = org-wide credential
  
  -- SSOT: Credential type defines format and access
  credential_type_id UUID NOT NULL REFERENCES credential_types(id),
  
  -- Who holds this credential (polymorphic holder)
  holder_contact_id UUID NOT NULL REFERENCES contacts(id),
  
  -- Context: Why was this credential issued?
  -- Polymorphic source - can be registration, partner, talent, staff, etc.
  source_type TEXT NOT NULL CHECK (source_type IN ('registration', 'partner', 'talent', 'staff', 'vip', 'press', 'vendor', 'manual')),
  source_entity_id UUID,  -- FK to the source record
  
  -- Credential identification
  credential_number TEXT NOT NULL,  -- Unique identifier (barcode/QR value)
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='credential'
  
  -- Lifecycle tracking
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  issued_by_user_id UUID REFERENCES profiles(id),
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  
  -- Physical credential tracking (for badges, wristbands, etc.)
  printed_at TIMESTAMPTZ,
  print_count INT DEFAULT 0,
  collected_at TIMESTAMPTZ,  -- When holder picked up physical credential
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, credential_number)
);

-- Credential Access Log (3NF: Immutable audit trail)
CREATE TABLE credential_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES issued_credentials(id) ON DELETE CASCADE,
  
  -- Access attempt details
  access_point_id UUID REFERENCES venue_zones(id),  -- Where access was attempted
  access_type TEXT NOT NULL CHECK (access_type IN ('entry', 'exit', 'scan', 'tap', 'verify')),
  
  -- Result
  was_granted BOOLEAN NOT NULL,
  denial_reason TEXT,  -- If not granted
  
  -- Context
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scanned_by_user_id UUID REFERENCES profiles(id),
  device_id TEXT,  -- Scanner/reader device identifier
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credential Print Queue (for physical credentials)
CREATE TABLE credential_print_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES issued_credentials(id) ON DELETE CASCADE,
  
  -- Print job details
  printer_id TEXT,
  priority INT DEFAULT 0,
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='print_job'
  
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.4 Lead Scoring & Marketing Automation (3NF Compliant)

```sql
-- ============================================================
-- LEAD SCORING (3NF Compliant)
-- ============================================================
-- 3NF Analysis:
-- - Score history via separate table (not JSONB array)
-- - Rule types via lookup table
-- - No stored aggregates (computed from history)
-- ============================================================

-- Lead Score Current (Materialized view pattern - documented exception)
-- JUSTIFICATION: Performance-critical for real-time lead prioritization
-- Kept in sync via triggers on lead_score_events
CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Current scores (materialized from lead_score_events for performance)
  -- DOCUMENTED EXCEPTION: These are derived values, updated via trigger
  total_score INT NOT NULL DEFAULT 0,
  demographic_score INT NOT NULL DEFAULT 0,
  behavioral_score INT NOT NULL DEFAULT 0,
  engagement_score INT NOT NULL DEFAULT 0,
  firmographic_score INT NOT NULL DEFAULT 0,
  
  -- Lifecycle
  score_grade TEXT CHECK (score_grade IN ('A', 'B', 'C', 'D', 'F')),  -- Computed from total_score
  last_activity_at TIMESTAMPTZ,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contact_id)
);

-- Lead Score Events (3NF: Immutable history, SSOT for score changes)
CREATE TABLE lead_score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- What triggered this score change
  rule_id UUID REFERENCES lead_scoring_rules(id),
  event_type TEXT NOT NULL,  -- 'rule_match', 'manual_adjustment', 'decay', 'reset'
  
  -- Score change details
  score_type_id UUID NOT NULL REFERENCES lead_score_rule_types(id),
  score_delta INT NOT NULL,  -- Can be negative
  score_before INT NOT NULL,
  score_after INT NOT NULL,
  
  -- Context
  source_entity_type TEXT,  -- 'activity', 'form_submission', 'email_event', etc.
  source_entity_id UUID,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Scoring Rules (3NF: Type via lookup)
CREATE TABLE lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- SSOT: Type via lookup table
  rule_type_id UUID NOT NULL REFERENCES lead_score_rule_types(id),
  
  -- Rule definition (structured, not free-form JSONB)
  entity_type TEXT NOT NULL,  -- 'contact', 'activity', 'form_submission', 'email_event'
  field_path TEXT NOT NULL,   -- 'job_title', 'company.industry', 'activity.type'
  operator TEXT NOT NULL CHECK (operator IN ('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in', 'is_set', 'is_not_set')),
  value TEXT,  -- Comparison value (NULL for is_set/is_not_set)
  
  -- Score adjustment
  score_adjustment INT NOT NULL,
  
  -- Constraints
  max_applications_per_contact INT,  -- NULL = unlimited
  cooldown_hours INT,  -- Minimum hours between applications
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,  -- Higher = evaluated first
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL CAMPAIGNS (3NF Compliant)
-- ============================================================
-- 3NF Analysis:
-- - Metrics via separate events table (not stored counts)
-- - Sender info via FK to email_senders
-- - Recipients via junction table
-- ============================================================

-- Email Senders (SSOT for from addresses)
CREATE TABLE email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, from_email)
);

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  
  -- Content
  subject TEXT NOT NULL,
  preview_text TEXT,
  content_html TEXT,
  content_text TEXT,
  
  -- SSOT: Template and sender via FK
  template_id UUID REFERENCES email_templates(id),
  sender_id UUID NOT NULL REFERENCES email_senders(id),
  
  -- SSOT: Status via lookup
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='campaign'
  
  -- Schedule
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Note: recipient_count, open_count, etc. NOT stored (3NF)
  -- Computed from email_campaign_recipients and email_events
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Recipients (3NF: Junction table)
CREATE TABLE email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  
  -- Personalization snapshot (captured at send time for compliance)
  email_address TEXT NOT NULL,  -- Captured in case contact email changes
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='email_recipient'
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft')),
  bounce_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

-- Email Events (3NF: Immutable event log)
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  
  -- Event details
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  link_url TEXT,  -- For click events
  
  -- Raw provider data
  provider_event_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL SEQUENCES (3NF Compliant)
-- ============================================================

CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- SSOT: Trigger type via lookup
  trigger_type_id UUID NOT NULL REFERENCES sequence_trigger_types(id),
  
  -- Trigger configuration (structured)
  trigger_entity_type TEXT,
  trigger_field TEXT,
  trigger_value TEXT,
  
  -- SSOT: Status via lookup
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='sequence'
  
  -- Settings
  exit_on_reply BOOLEAN DEFAULT TRUE,
  exit_on_meeting_booked BOOLEAN DEFAULT TRUE,
  send_on_weekends BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  
  step_number INT NOT NULL CHECK (step_number > 0),
  name TEXT,
  
  -- Delay configuration
  delay_days INT NOT NULL DEFAULT 0 CHECK (delay_days >= 0),
  delay_hours INT NOT NULL DEFAULT 0 CHECK (delay_hours >= 0 AND delay_hours < 24),
  
  -- Content
  email_template_id UUID NOT NULL REFERENCES email_templates(id),
  subject_override TEXT,  -- NULL = use template subject
  
  -- Conditional execution (structured, not JSONB)
  skip_if_replied BOOLEAN DEFAULT TRUE,
  skip_if_opened BOOLEAN DEFAULT FALSE,
  skip_if_clicked BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_number)
);

-- Sequence Enrollments (3NF: Status via lookup)
CREATE TABLE contact_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  
  -- Progress
  current_step_number INT NOT NULL DEFAULT 1,
  next_step_scheduled_at TIMESTAMPTZ,
  
  -- SSOT: Status via lookup
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='enrollment'
  
  -- Lifecycle
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  enrolled_by_user_id UUID REFERENCES profiles(id),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  unenrolled_at TIMESTAMPTZ,
  unenroll_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contact_id, sequence_id)
);

-- Enrollment Step Executions (3NF: Immutable history)
CREATE TABLE enrollment_step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES contact_sequence_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES email_sequence_steps(id),
  
  -- Execution details
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  skip_reason TEXT,
  
  -- Result
  campaign_recipient_id UUID REFERENCES email_campaign_recipients(id),  -- Links to actual send
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.5 Accounting/GL Enhancements (3NF Compliant)

```sql
-- ============================================================
-- ACCOUNTING / GENERAL LEDGER (3NF Compliant)
-- ============================================================
-- 3NF Analysis:
-- - Account type via FK to account_types (SSOT)
-- - No stored balances on accounts (computed from journal entries)
-- - Immutable journal entries (financial compliance)
-- - Bank balance via reconciliation, not stored
-- ============================================================

CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Account identification
  account_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- SSOT: Type via lookup table (includes normal_balance)
  account_type_id UUID NOT NULL REFERENCES account_types(id),
  
  -- Hierarchy
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  depth INT NOT NULL DEFAULT 0,  -- Computed, but stored for query performance
  path TEXT,  -- Materialized path for hierarchy queries: '1000.1100.1110'
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,  -- System accounts cannot be deleted
  is_header BOOLEAN DEFAULT FALSE,  -- Header accounts cannot have transactions
  
  -- Note: current_balance NOT stored (3NF) — computed from journal_entry_lines
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, account_number)
);

-- Journal Entries (3NF: Immutable for financial compliance)
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Entry identification
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  
  -- Description
  memo TEXT,
  reference TEXT,  -- External reference (invoice #, check #, etc.)
  
  -- Source tracking
  source_type TEXT,  -- 'manual', 'invoice', 'payment', 'expense', 'payroll', 'adjustment'
  source_entity_type TEXT,
  source_entity_id UUID,
  
  -- SSOT: Status via lookup
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='journal'
  
  -- Posting
  posted_at TIMESTAMPTZ,
  posted_by_user_id UUID REFERENCES profiles(id),
  
  -- Reversal tracking (immutable - reversals create new entries)
  is_reversal BOOLEAN DEFAULT FALSE,
  reverses_entry_id UUID REFERENCES journal_entries(id),
  reversed_by_entry_id UUID REFERENCES journal_entries(id),
  
  -- Fiscal period
  fiscal_year INT NOT NULL,
  fiscal_period INT NOT NULL,  -- 1-12 for monthly, 1-4 for quarterly
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES profiles(id),
  
  -- Note: Journal entries are IMMUTABLE once posted
  -- Corrections are made via reversing entries
  
  UNIQUE(org_id, entry_number)
);

-- Journal Entry Lines (3NF: Each line is atomic)
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  
  -- Amount (only one should be non-zero per line)
  debit_amount_cents BIGINT NOT NULL DEFAULT 0 CHECK (debit_amount_cents >= 0),
  credit_amount_cents BIGINT NOT NULL DEFAULT 0 CHECK (credit_amount_cents >= 0),
  currency_id UUID NOT NULL REFERENCES currencies(id),
  
  -- Exchange rate (for multi-currency)
  exchange_rate DECIMAL(18,8) DEFAULT 1.0,
  base_currency_amount_cents BIGINT,  -- Amount in org's base currency
  
  -- Line description
  description TEXT,
  
  -- Dimensional tracking (SSOT via FKs)
  department_id UUID REFERENCES departments(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  contact_id UUID REFERENCES contacts(id),  -- Customer/vendor
  
  -- Line number for ordering
  line_number INT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Either debit or credit, not both
  CONSTRAINT debit_xor_credit CHECK (
    (debit_amount_cents > 0 AND credit_amount_cents = 0) OR
    (debit_amount_cents = 0 AND credit_amount_cents > 0) OR
    (debit_amount_cents = 0 AND credit_amount_cents = 0)
  )
);

-- Fiscal Periods (SSOT for period close)
CREATE TABLE fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  fiscal_year INT NOT NULL,
  period_number INT NOT NULL,  -- 1-12 or 1-4
  
  name TEXT NOT NULL,  -- 'January 2026', 'Q1 2026'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='fiscal_period'
  
  -- Close tracking
  closed_at TIMESTAMPTZ,
  closed_by_user_id UUID REFERENCES profiles(id),
  reopened_at TIMESTAMPTZ,
  reopened_by_user_id UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, fiscal_year, period_number),
  CONSTRAINT valid_period CHECK (end_date > start_date)
);

-- ============================================================
-- BANK ACCOUNTS & RECONCILIATION (3NF Compliant)
-- ============================================================

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Link to GL
  gl_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  
  -- Bank details
  name TEXT NOT NULL,
  bank_name TEXT,
  account_number_masked TEXT,  -- Last 4 digits only for security
  routing_number_masked TEXT,
  
  -- Currency
  currency_id UUID NOT NULL REFERENCES currencies(id),
  
  -- Note: current_balance NOT stored (3NF) — computed from transactions
  -- Use view or function: SELECT SUM(amount_cents) FROM bank_transactions WHERE bank_account_id = ?
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Integration
  plaid_account_id TEXT,  -- For bank feed integration
  last_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transactions (3NF: Immutable transaction log)
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_date DATE NOT NULL,
  posted_date DATE,
  description TEXT NOT NULL,
  
  -- Amount (positive = deposit, negative = withdrawal)
  amount_cents BIGINT NOT NULL,
  currency_id UUID NOT NULL REFERENCES currencies(id),
  
  -- SSOT: Type via lookup
  transaction_type_id UUID NOT NULL REFERENCES bank_transaction_types(id),
  
  -- Reference
  reference_number TEXT,
  check_number TEXT,
  
  -- Categorization
  payee_name TEXT,
  category_id UUID REFERENCES expense_categories(id),
  
  -- Reconciliation
  reconciliation_id UUID REFERENCES bank_reconciliations(id),
  reconciled_at TIMESTAMPTZ,
  
  -- Matching to GL
  journal_entry_id UUID REFERENCES journal_entries(id),
  match_status TEXT CHECK (match_status IN ('unmatched', 'matched', 'excluded')),
  
  -- Import tracking
  import_id TEXT,  -- External transaction ID from bank feed
  imported_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transaction Types (SSOT lookup)
CREATE TABLE bank_transaction_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,  -- 'Deposit', 'Withdrawal', 'Transfer', 'Fee', 'Interest', 'Check'
  is_inflow BOOLEAN NOT NULL,  -- true = money in, false = money out
  sort_order INT DEFAULT 0
);

-- Bank Reconciliations (3NF: Header/detail pattern)
CREATE TABLE bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  
  -- Statement details
  statement_date DATE NOT NULL,
  statement_ending_balance_cents BIGINT NOT NULL,
  
  -- Reconciliation period
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- Calculated at reconciliation time (documented exception for audit trail)
  -- JUSTIFICATION: These are point-in-time snapshots required for audit
  beginning_balance_cents BIGINT NOT NULL,
  cleared_deposits_cents BIGINT NOT NULL DEFAULT 0,
  cleared_withdrawals_cents BIGINT NOT NULL DEFAULT 0,
  -- Note: difference NOT stored — computed as:
  -- statement_ending_balance - (beginning_balance + cleared_deposits - cleared_withdrawals)
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='reconciliation'
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES profiles(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconciliation Items (3NF: Junction to transactions)
CREATE TABLE bank_reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID NOT NULL REFERENCES bank_reconciliations(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES bank_transactions(id),
  
  -- Status at time of reconciliation
  is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  cleared_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reconciliation_id, transaction_id)
);
```

---

### 6.6 HR & Workforce Management (3NF Compliant)

```sql
-- ============================================================
-- HR & WORKFORCE MANAGEMENT (3NF Compliant)
-- ============================================================
-- 3NF Analysis:
-- - Employee info via staff_members linked to contacts (SSOT)
-- - Leave balances computed from transactions, not stored
-- - Payroll immutable for compliance
-- - All types via lookup tables
-- ============================================================

-- Staff Members (3NF: Links to contacts for SSOT on person info)
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- SSOT: Contact is canonical source for name, email, phone
  contact_id UUID NOT NULL REFERENCES contacts(id),
  
  -- Employment details
  employee_number TEXT NOT NULL,
  employment_type_id UUID NOT NULL REFERENCES employment_types(id),
  position_type_id UUID NOT NULL REFERENCES position_types(id),
  department_id UUID REFERENCES departments(id),
  
  -- Reporting
  manager_id UUID REFERENCES staff_members(id),
  
  -- Dates
  hire_date DATE NOT NULL,
  termination_date DATE,
  
  -- Compensation (current - history in separate table)
  hourly_rate_cents BIGINT,
  salary_cents BIGINT,
  currency_id UUID NOT NULL REFERENCES currencies(id),
  pay_frequency TEXT CHECK (pay_frequency IN ('hourly', 'weekly', 'biweekly', 'semimonthly', 'monthly', 'annual')),
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='employee'
  
  -- Work preferences
  default_timezone_id UUID REFERENCES time_zones(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, employee_number),
  UNIQUE(org_id, contact_id)
);

-- Compensation History (3NF: Immutable history)
CREATE TABLE compensation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  
  effective_date DATE NOT NULL,
  
  -- Compensation details
  hourly_rate_cents BIGINT,
  salary_cents BIGINT,
  currency_id UUID NOT NULL REFERENCES currencies(id),
  pay_frequency TEXT CHECK (pay_frequency IN ('hourly', 'weekly', 'biweekly', 'semimonthly', 'monthly', 'annual')),
  
  -- Change tracking
  change_reason TEXT,
  approved_by_user_id UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Balances (Materialized - documented exception)
-- JUSTIFICATION: Performance-critical for real-time availability checks
-- Kept in sync via triggers on leave_transactions
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  
  -- Current balance (materialized from leave_transactions)
  -- DOCUMENTED EXCEPTION: Derived value, updated via trigger
  balance_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  
  -- Accrual tracking
  accrued_this_year_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  used_this_year_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  carried_over_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  
  -- Year tracking
  balance_year INT NOT NULL,
  
  last_accrual_at TIMESTAMPTZ,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_member_id, leave_type_id, balance_year)
);

-- Leave Transactions (3NF: Immutable event log)
CREATE TABLE leave_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  
  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('accrual', 'used', 'adjustment', 'carryover', 'forfeiture', 'payout')),
  
  -- Hours (positive = add to balance, negative = subtract)
  hours DECIMAL(8,2) NOT NULL,
  
  -- Reference
  leave_request_id UUID REFERENCES leave_requests(id),
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES profiles(id)
);

-- Leave Requests (3NF: Status via lookup)
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  
  -- Request details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_half_day BOOLEAN DEFAULT FALSE,  -- Starts at noon
  end_half_day BOOLEAN DEFAULT FALSE,    -- Ends at noon
  
  -- Note: total_hours NOT stored (3NF) — computed from dates and work schedule
  
  reason TEXT,
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='leave_request'
  
  -- Approval
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Certifications (3NF: Type via lookup)
CREATE TABLE staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  certification_type_id UUID NOT NULL REFERENCES certification_types(id),
  
  -- Certification details
  certification_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='certification'
  
  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by_user_id UUID REFERENCES profiles(id),
  
  -- Document
  document_id UUID REFERENCES documents(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_member_id, certification_type_id)
);

-- Onboarding Checklists (3NF: Template-based)
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  employment_type_id UUID REFERENCES employment_types(id),  -- NULL = all types
  department_id UUID REFERENCES departments(id),  -- NULL = all departments
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE onboarding_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Assignment
  assigned_to_role TEXT CHECK (assigned_to_role IN ('employee', 'manager', 'hr', 'it', 'finance')),
  
  -- Timing
  due_days_from_start INT NOT NULL DEFAULT 0,  -- Days after hire date
  
  -- Dependencies
  depends_on_item_id UUID REFERENCES onboarding_template_items(id),
  
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE onboarding_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES onboarding_templates(id),
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='onboarding'
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Note: progress_percent NOT stored (3NF) — computed from items
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_member_id, template_id)
);

CREATE TABLE onboarding_instance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES onboarding_instances(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES onboarding_template_items(id),
  
  -- Assignment
  assigned_to_user_id UUID REFERENCES profiles(id),
  due_date DATE,
  
  -- Status
  status_id UUID NOT NULL REFERENCES statuses(id),  -- domain='onboarding_item'
  
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES profiles(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(instance_id, template_item_id)
);
```

---

### 6.7 Cross-Cutting Consolidations (3NF Compliant)

```sql
-- ============================================================
-- CROSS-CUTTING CONSOLIDATIONS (3NF Compliant)
-- ============================================================
-- These polymorphic tables eliminate redundant per-entity tables
-- and enforce SSOT for common patterns across all domains.
-- ============================================================

-- ============================================================
-- ADDRESSES (Polymorphic)
-- ============================================================
-- Replaces embedded address fields on contacts, companies, venues, events
-- SSOT: One table for all addresses with polymorphic reference

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  addressable_type TEXT NOT NULL,  -- 'contact', 'company', 'venue', 'event', 'staff_member'
  addressable_id UUID NOT NULL,
  
  -- Address type
  address_type TEXT NOT NULL CHECK (address_type IN ('primary', 'billing', 'shipping', 'mailing', 'physical', 'registered', 'home', 'work')),
  
  -- Address components (atomic fields per 1NF)
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  address_line_3 TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT,
  country_id UUID NOT NULL REFERENCES countries(id),
  
  -- Geolocation (for mapping/proximity)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Validation
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_source TEXT,  -- 'google_maps', 'usps', 'manual'
  
  -- Flags
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(addressable_type, addressable_id, address_type)
);

CREATE INDEX idx_addresses_addressable ON addresses(addressable_type, addressable_id);
CREATE INDEX idx_addresses_country ON addresses(country_id);
CREATE INDEX idx_addresses_geo ON addresses(latitude, longitude) WHERE latitude IS NOT NULL;

-- ============================================================
-- NOTES / COMMENTS (Polymorphic)
-- ============================================================
-- Replaces per-entity notes tables
-- SSOT: One table for all notes/comments with polymorphic reference

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  notable_type TEXT NOT NULL,  -- 'contact', 'company', 'project', 'task', 'event', 'registration', etc.
  notable_id UUID NOT NULL,
  
  -- Note content
  content TEXT NOT NULL,
  content_format TEXT DEFAULT 'plain' CHECK (content_format IN ('plain', 'markdown', 'html')),
  
  -- Note type
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'internal', 'customer_facing', 'system', 'call_log', 'meeting_notes', 'follow_up')),
  
  -- Visibility
  is_private BOOLEAN DEFAULT FALSE,  -- Only visible to author
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Threading (for comment replies)
  parent_note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  thread_depth INT DEFAULT 0,
  
  -- Author
  created_by_user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,  -- NULL if never edited
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by_user_id UUID REFERENCES profiles(id)
);

CREATE INDEX idx_notes_notable ON notes(notable_type, notable_id);
CREATE INDEX idx_notes_author ON notes(created_by_user_id);
CREATE INDEX idx_notes_thread ON notes(parent_note_id) WHERE parent_note_id IS NOT NULL;

-- ============================================================
-- TAGS (Polymorphic)
-- ============================================================
-- Replaces embedded tag arrays and per-entity tag tables
-- SSOT: Centralized tag definitions with polymorphic junction

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tag identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL,  -- URL-safe version
  description TEXT,
  
  -- Categorization
  tag_group TEXT,  -- Optional grouping: 'industry', 'skill', 'priority', 'status'
  
  -- Visual
  color TEXT,
  icon TEXT,
  
  -- Hierarchy (optional)
  parent_tag_id UUID REFERENCES tags(id),
  
  -- Usage tracking (computed, but cached for performance)
  -- JUSTIFICATION: Frequently queried for tag suggestions
  usage_count INT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, slug)
);

CREATE TABLE taggables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  taggable_type TEXT NOT NULL,  -- 'contact', 'company', 'project', 'document', 'event', etc.
  taggable_id UUID NOT NULL,
  
  -- Context
  tagged_by_user_id UUID REFERENCES profiles(id),
  tagged_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tag_id, taggable_type, taggable_id)
);

CREATE INDEX idx_taggables_entity ON taggables(taggable_type, taggable_id);
CREATE INDEX idx_taggables_tag ON taggables(tag_id);

-- ============================================================
-- ATTACHMENTS (Polymorphic)
-- ============================================================
-- Unified attachment junction for documents
-- SSOT: Links documents table to any entity

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SSOT: Document is canonical source for file info
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  attachable_type TEXT NOT NULL,  -- 'task', 'project', 'event', 'registration', 'expense', etc.
  attachable_id UUID NOT NULL,
  
  -- Attachment context
  attachment_type TEXT DEFAULT 'general' CHECK (attachment_type IN ('general', 'contract', 'invoice', 'receipt', 'image', 'specification', 'deliverable', 'proof')),
  
  -- Display
  display_name TEXT,  -- Override document name for this context
  description TEXT,
  sort_order INT DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,  -- Visible to external parties
  
  -- Audit
  attached_by_user_id UUID REFERENCES profiles(id),
  attached_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(document_id, attachable_type, attachable_id)
);

CREATE INDEX idx_attachments_entity ON attachments(attachable_type, attachable_id);
CREATE INDEX idx_attachments_document ON attachments(document_id);

-- ============================================================
-- AUDIT LOG (Polymorphic)
-- ============================================================
-- Unified audit trail for all entity changes
-- SSOT: One immutable log for all auditable actions

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  entity_type TEXT NOT NULL,  -- 'contact', 'project', 'event', 'registration', etc.
  entity_id UUID NOT NULL,
  
  -- Action
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore', 'archive', 'approve', 'reject', 'submit', 'publish', 'unpublish', 'assign', 'unassign', 'status_change', 'access', 'export', 'import', 'merge', 'split')),
  
  -- Change details
  changes JSONB,  -- { "field_name": { "old": "value", "new": "value" } }
  
  -- Context
  reason TEXT,  -- Optional explanation for the change
  
  -- Actor
  performed_by_user_id UUID REFERENCES profiles(id),
  performed_by_system TEXT,  -- 'workflow', 'api', 'import', 'sync' (if not user-initiated)
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,  -- Correlation ID for request tracing
  
  -- Timestamp (immutable)
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Note: This table is APPEND-ONLY (no updates or deletes)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(performed_by_user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_time ON audit_log(performed_at DESC);

-- ============================================================
-- CUSTOM FIELDS (Polymorphic)
-- ============================================================
-- Extensible custom field system for any entity type
-- SSOT: Centralized field definitions with polymorphic values

CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Which entity type this field applies to
  entity_type TEXT NOT NULL,  -- 'contact', 'company', 'project', 'event', etc.
  
  -- Field identification
  field_key TEXT NOT NULL,  -- Machine-readable: 'custom_industry_code'
  field_label TEXT NOT NULL,  -- Display: 'Industry Code'
  description TEXT,
  placeholder TEXT,
  
  -- Field type
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'decimal', 'date', 'datetime', 'boolean', 'select', 'multiselect', 'url', 'email', 'phone', 'currency', 'percent', 'user', 'contact', 'company')),
  
  -- Options (for select/multiselect)
  options JSONB,  -- [{ "value": "opt1", "label": "Option 1" }]
  
  -- Validation
  is_required BOOLEAN DEFAULT FALSE,
  min_value DECIMAL,
  max_value DECIMAL,
  min_length INT,
  max_length INT,
  regex_pattern TEXT,
  
  -- Display
  display_order INT DEFAULT 0,
  display_section TEXT,  -- Group fields into sections
  is_visible_in_list BOOLEAN DEFAULT FALSE,
  is_visible_in_detail BOOLEAN DEFAULT TRUE,
  is_searchable BOOLEAN DEFAULT FALSE,
  is_filterable BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id, entity_type, field_key)
);

CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Value storage (use appropriate column based on field_type)
  value_text TEXT,
  value_number DECIMAL,
  value_boolean BOOLEAN,
  value_date DATE,
  value_datetime TIMESTAMPTZ,
  value_json JSONB,  -- For multiselect, complex types
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(field_definition_id, entity_type, entity_id)
);

CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_definition ON custom_field_values(field_definition_id);

-- ============================================================
-- FOLLOWERS / WATCHERS (Polymorphic)
-- ============================================================
-- Unified subscription system for entity notifications
-- SSOT: One table for all follow/watch relationships

CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who is following
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Polymorphic reference to what they're following
  followable_type TEXT NOT NULL,  -- 'project', 'task', 'event', 'contact', 'company', etc.
  followable_id UUID NOT NULL,
  
  -- Subscription preferences
  notify_on_update BOOLEAN DEFAULT TRUE,
  notify_on_comment BOOLEAN DEFAULT TRUE,
  notify_on_status_change BOOLEAN DEFAULT TRUE,
  notify_on_assignment BOOLEAN DEFAULT TRUE,
  
  -- Notification channel preferences
  notify_via_email BOOLEAN DEFAULT TRUE,
  notify_via_push BOOLEAN DEFAULT TRUE,
  notify_via_in_app BOOLEAN DEFAULT TRUE,
  
  -- How they started following
  follow_reason TEXT CHECK (follow_reason IN ('manual', 'assigned', 'mentioned', 'created', 'commented', 'team_member')),
  
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, followable_type, followable_id)
);

CREATE INDEX idx_followers_entity ON followers(followable_type, followable_id);
CREATE INDEX idx_followers_user ON followers(user_id);

-- ============================================================
-- ACTIVITY FEED (Polymorphic)
-- ============================================================
-- Unified activity stream for all entity actions
-- SSOT: One table for all activity feed items

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Polymorphic reference
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Activity type
  activity_type TEXT NOT NULL,  -- 'created', 'updated', 'commented', 'assigned', 'completed', 'status_changed', etc.
  
  -- Activity details
  title TEXT NOT NULL,  -- "John created task 'Design mockups'"
  description TEXT,
  metadata JSONB,  -- Additional context-specific data
  
  -- Actor
  actor_user_id UUID REFERENCES profiles(id),
  actor_name TEXT,  -- Cached for display (denormalized for performance)
  
  -- Related entities (for linking)
  related_entity_type TEXT,
  related_entity_id UUID,
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  visibility_scope TEXT DEFAULT 'org' CHECK (visibility_scope IN ('org', 'team', 'project', 'public')),
  
  -- Timestamp
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_entity ON activity_feed(entity_type, entity_id);
CREATE INDEX idx_activity_feed_org ON activity_feed(org_id, occurred_at DESC);
CREATE INDEX idx_activity_feed_actor ON activity_feed(actor_user_id);
```

---

### 6.8 Computed Views for 3NF Compliance

The following views provide computed values that are NOT stored in tables per 3NF principles:

```sql
-- ============================================================
-- COMPUTED VIEWS (3NF Compliance)
-- These replace stored calculated fields
-- ============================================================

-- Ticket sales count (replaces quantity_sold on ticket_types)
CREATE VIEW v_ticket_type_sales AS
SELECT 
  tt.id AS ticket_type_id,
  tt.event_id,
  tt.quantity_available,
  COALESCE(SUM(rli.quantity), 0) AS quantity_sold,
  tt.quantity_available - COALESCE(SUM(rli.quantity), 0) AS quantity_remaining
FROM ticket_types tt
LEFT JOIN registration_line_items rli ON rli.ticket_type_id = tt.id
LEFT JOIN event_registrations er ON er.id = rli.registration_id
LEFT JOIN statuses s ON s.id = er.status_id AND s.domain = 'registration'
WHERE s.code NOT IN ('cancelled', 'refunded') OR s.id IS NULL
GROUP BY tt.id, tt.event_id, tt.quantity_available;

-- Registration totals (replaces total_amount on registrations)
CREATE VIEW v_registration_totals AS
SELECT 
  er.id AS registration_id,
  SUM((rli.unit_price_cents * rli.quantity) - rli.discount_cents + rli.tax_cents) AS total_cents,
  SUM(rli.discount_cents) AS total_discount_cents,
  SUM(rli.tax_cents) AS total_tax_cents,
  er.currency_id
FROM event_registrations er
LEFT JOIN registration_line_items rli ON rli.registration_id = er.id
GROUP BY er.id, er.currency_id;

-- Session registration counts (replaces registered_count on sessions)
CREATE VIEW v_session_capacity AS
SELECT 
  es.id AS session_id,
  es.capacity_override,
  vz.capacity AS room_capacity,
  COALESCE(es.capacity_override, vz.capacity) AS effective_capacity,
  COUNT(sr.id) FILTER (WHERE s.code NOT IN ('cancelled')) AS registered_count,
  COALESCE(es.capacity_override, vz.capacity) - COUNT(sr.id) FILTER (WHERE s.code NOT IN ('cancelled')) AS spots_remaining
FROM event_sessions es
LEFT JOIN venue_zones vz ON vz.id = es.room_id
LEFT JOIN session_registrations sr ON sr.session_id = es.id
LEFT JOIN statuses s ON s.id = sr.status_id AND s.domain = 'session_registration'
GROUP BY es.id, es.capacity_override, vz.capacity;

-- Promo code usage (replaces times_used on promo_codes)
CREATE VIEW v_promo_code_usage AS
SELECT 
  pc.id AS promo_code_id,
  pc.max_uses,
  COUNT(rpc.id) AS times_used,
  pc.max_uses - COUNT(rpc.id) AS uses_remaining
FROM promo_codes pc
LEFT JOIN registration_promo_codes rpc ON rpc.promo_code_id = pc.id
GROUP BY pc.id, pc.max_uses;

-- Email campaign metrics (replaces stored counts)
CREATE VIEW v_campaign_metrics AS
SELECT 
  ec.id AS campaign_id,
  COUNT(ecr.id) AS recipient_count,
  COUNT(ecr.id) FILTER (WHERE ecr.sent_at IS NOT NULL) AS sent_count,
  COUNT(ecr.id) FILTER (WHERE ecr.delivered_at IS NOT NULL) AS delivered_count,
  COUNT(ecr.id) FILTER (WHERE ecr.bounced_at IS NOT NULL) AS bounce_count,
  COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'opened') AS open_count,
  COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'clicked') AS click_count,
  COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'unsubscribed') AS unsubscribe_count,
  CASE WHEN COUNT(ecr.id) FILTER (WHERE ecr.delivered_at IS NOT NULL) > 0 
    THEN COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'opened')::DECIMAL / 
         COUNT(ecr.id) FILTER (WHERE ecr.delivered_at IS NOT NULL) * 100
    ELSE 0 END AS open_rate_percent,
  CASE WHEN COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'opened') > 0 
    THEN COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'clicked')::DECIMAL / 
         COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'opened') * 100
    ELSE 0 END AS click_rate_percent
FROM email_campaigns ec
LEFT JOIN email_campaign_recipients ecr ON ecr.campaign_id = ec.id
LEFT JOIN email_events ee ON ee.recipient_id = ecr.id
GROUP BY ec.id;

-- Account balances (replaces stored balance on chart_of_accounts)
CREATE VIEW v_account_balances AS
SELECT 
  coa.id AS account_id,
  coa.org_id,
  coa.account_number,
  coa.name,
  at.category,
  at.normal_balance,
  COALESCE(SUM(jel.debit_amount_cents), 0) AS total_debits_cents,
  COALESCE(SUM(jel.credit_amount_cents), 0) AS total_credits_cents,
  CASE 
    WHEN at.normal_balance = 'debit' 
    THEN COALESCE(SUM(jel.debit_amount_cents), 0) - COALESCE(SUM(jel.credit_amount_cents), 0)
    ELSE COALESCE(SUM(jel.credit_amount_cents), 0) - COALESCE(SUM(jel.debit_amount_cents), 0)
  END AS balance_cents
FROM chart_of_accounts coa
JOIN account_types at ON at.id = coa.account_type_id
LEFT JOIN journal_entry_lines jel ON jel.account_id = coa.id
LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id
LEFT JOIN statuses s ON s.id = je.status_id AND s.domain = 'journal'
WHERE s.code = 'posted' OR s.id IS NULL
GROUP BY coa.id, coa.org_id, coa.account_number, coa.name, at.category, at.normal_balance;

-- Bank account balances (replaces current_balance on bank_accounts)
CREATE VIEW v_bank_account_balances AS
SELECT 
  ba.id AS bank_account_id,
  ba.name,
  COALESCE(SUM(bt.amount_cents), 0) AS current_balance_cents,
  ba.currency_id,
  MAX(bt.transaction_date) AS last_transaction_date
FROM bank_accounts ba
LEFT JOIN bank_transactions bt ON bt.bank_account_id = ba.id
GROUP BY ba.id, ba.name, ba.currency_id;

-- Exhibitor badge counts (replaces staff_badges_allocated count)
CREATE VIEW v_exhibitor_badge_counts AS
SELECT 
  e.id AS exhibitor_id,
  COUNT(eb.id) AS badges_issued,
  COUNT(eb.id) FILTER (WHERE s.code = 'printed') AS badges_printed
FROM exhibitors e
LEFT JOIN exhibitor_badges eb ON eb.exhibitor_id = e.id
LEFT JOIN statuses s ON s.id = eb.status_id AND s.domain = 'badge'
GROUP BY e.id;

-- Onboarding progress (replaces progress_percent on onboarding_instances)
CREATE VIEW v_onboarding_progress AS
SELECT 
  oi.id AS instance_id,
  oi.staff_member_id,
  COUNT(oii.id) AS total_items,
  COUNT(oii.id) FILTER (WHERE s.code = 'completed') AS completed_items,
  CASE WHEN COUNT(oii.id) > 0 
    THEN COUNT(oii.id) FILTER (WHERE s.code = 'completed')::DECIMAL / COUNT(oii.id) * 100
    ELSE 0 END AS progress_percent
FROM onboarding_instances oi
LEFT JOIN onboarding_instance_items oii ON oii.instance_id = oi.id
LEFT JOIN statuses s ON s.id = oii.status_id AND s.domain = 'onboarding_item'
GROUP BY oi.id, oi.staff_member_id;
```

---

## 7. New Workflow Templates Required

### 7.1 High Priority Workflows (Implement First)

```yaml
# 1. Lead Scoring Update
id: lead_scoring_update
name: Lead Score Update on Activity
trigger:
  type: entity_created
  entity: activity_logs
  filter: "entity_type = 'contact'"
actions:
  - type: calculate_lead_score
    contact_id: "{{entity.entity_id}}"
  - type: branch
    conditions:
      - condition:
          field: lead_score
          operator: greater_than
          value: 80
        action:
          type: send_notification
          template: hot_lead_alert
          recipients: [sales_team]

# 2. Event Registration Confirmation
id: event_registration_confirmation
name: Event Registration Confirmation
trigger:
  type: entity_created
  entity: event_registrations
  filter: "status = 'confirmed'"
actions:
  - type: send_email
    template: registration_confirmation
    recipients: [attendee_email]
    attachments: [ticket_pdf, calendar_invite]
  - type: update_field
    entity: ticket_types
    field: quantity_sold
    value: "quantity_sold + 1"
  - type: create_entity
    entity: badges
    data:
      registration_id: "{{entity.id}}"
      status: pending

# 3. Waitlist Promotion
id: waitlist_promotion
name: Waitlist Promotion on Cancellation
trigger:
  type: status_changed
  entity: event_registrations
  to: cancelled
actions:
  - type: update_field
    entity: ticket_types
    field: quantity_sold
    value: "quantity_sold - 1"
  - type: query
    entity: event_waitlist
    filter: "event_id = {{entity.event_id}} AND status = 'waiting'"
    order_by: position
    limit: 1
    as: next_waitlist
  - type: branch
    conditions:
      - condition:
          field: next_waitlist
          operator: is_not_empty
        actions:
          - type: send_email
            template: waitlist_promotion
            recipients: [next_waitlist.contact.email]
          - type: update_field
            entity: event_waitlist
            filter: "id = {{next_waitlist.id}}"
            field: status
            value: notified
          - type: update_field
            entity: event_waitlist
            filter: "id = {{next_waitlist.id}}"
            field: expires_at
            value: "now + 48h"

# 4. Speaker Confirmation Request
id: speaker_confirmation_request
name: Speaker Confirmation Request
trigger:
  type: entity_created
  entity: session_speakers
actions:
  - type: send_email
    template: speaker_confirmation_request
    recipients: [speaker.contact.email]
    actions:
      - label: Confirm
        action: confirm_speaker
      - label: Decline
        action: decline_speaker
  - type: create_task
    title: "Follow up with {{speaker.name}} for session confirmation"
    assignee: event_coordinator
    due_date: "now + 7d"

# 5. Sponsor Deliverable Reminder
id: sponsor_deliverable_reminder
name: Sponsor Deliverable Due Reminder
trigger:
  type: schedule
  cron: "0 9 * * *"
conditions:
  - field: due_date
    operator: between
    value: [now, now+7d]
  - field: status
    operator: not_in
    value: [completed, cancelled]
actions:
  - type: send_email
    template: sponsor_deliverable_reminder
    recipients: [sponsor.company.contact_email]
  - type: send_notification
    template: deliverable_due_internal
    recipients: [sponsorship_manager]

# 6. Employee Onboarding
id: employee_onboarding
name: New Employee Onboarding Sequence
trigger:
  type: entity_created
  entity: staff_members
actions:
  - type: create_task
    title: "Complete onboarding for {{entity.first_name}} {{entity.last_name}}"
    assignee: hr_manager
    checklist:
      - Send welcome email
      - Create system accounts
      - Schedule orientation
      - Assign equipment
      - Complete I-9 verification
      - Enroll in benefits
  - type: send_email
    template: welcome_new_employee
    recipients: [entity.email]
  - type: create_entity
    entity: onboarding_progress
    data:
      staff_member_id: "{{entity.id}}"
      status: in_progress
  - type: delay
    duration: 1d
  - type: send_email
    template: day_one_checklist
    recipients: [entity.email]

# 7. Leave Request Approval
id: leave_request_approval
name: Leave Request Approval Workflow
trigger:
  type: entity_created
  entity: leave_requests
actions:
  - type: create_approval_request
    approvers: [entity.staff_member.manager_id]
    type: single_approver
    on_approve:
      - type: update_field
        field: status
        value: approved
      - type: send_notification
        template: leave_approved
        recipients: [entity.staff_member.user_id]
      - type: update_field
        entity: leave_balances
        filter: "staff_member_id = {{entity.staff_member_id}} AND leave_type_id = {{entity.leave_type_id}}"
        field: balance_days
        value: "balance_days - {{entity.days_requested}}"
    on_reject:
      - type: update_field
        field: status
        value: rejected
      - type: send_notification
        template: leave_rejected
        recipients: [entity.staff_member.user_id]

# 8. Bank Reconciliation Alert
id: bank_reconciliation_alert
name: Bank Reconciliation Due Alert
trigger:
  type: schedule
  cron: "0 9 1 * *"  # First of each month
actions:
  - type: query
    entity: bank_accounts
    filter: "is_active = true"
    as: accounts
  - type: for_each
    items: accounts
    actions:
      - type: create_task
        title: "Reconcile {{item.name}} for previous month"
        assignee: finance_manager
        due_date: "now + 5d"
      - type: send_notification
        template: reconciliation_due
        recipients: [finance_team]
```

---

## 8. Recommended Implementation Priority

### Tier 1: Critical (Weeks 1-8)
1. Event Registration & Ticketing System
2. Stripe Payment Integration
3. Lead Scoring Engine
4. Email Campaign Engine
5. Full GL/Chart of Accounts
6. Bank Reconciliation

### Tier 2: High (Weeks 9-16)
1. Attendee Mobile App
2. Badge Generation & Check-in
3. Session & Speaker Management
4. Sponsor Portal
5. Sales Sequences
6. Leave Management

### Tier 3: Medium (Weeks 17-24)
1. Virtual Event Platform
2. Marketing Automation (Drip Campaigns)
3. Payroll Integration
4. Advanced Reporting
5. Gantt/Workload Views

### Tier 4: Enhancement (Weeks 25-32)
1. E-commerce Module
2. POS System
3. Manufacturing/BOM
4. Advanced Analytics
5. AI-powered Features

---

## 9. Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Workflow Coverage | 16% | 80% | 24 weeks |
| Feature Coverage | 21% | 85% | 32 weeks |
| Integration Count | 2 | 20 | 24 weeks |
| Event Registration Capability | 0% | 100% | 8 weeks |
| Marketing Automation | 0% | 100% | 16 weeks |
| Full Accounting | 25% | 100% | 12 weeks |

---

## 10. Conclusion

The GHXSTSHIP platform has a strong foundation with unique strengths in **production lifecycle management** and **event operations** that competitors like Bizzabo and Cvent lack. However, significant gaps exist in:

1. **Event Registration & Ticketing** — Critical for monetization
2. **Marketing Automation** — Essential for lead nurturing
3. **Full Accounting/GL** — Required for enterprise adoption
4. **CRM Workflows** — Necessary for sales efficiency
5. **HR/Payroll** — Important for workforce management

Implementing the 126 missing workflows and 54 missing features outlined in this document will position GHXSTSHIP as a comprehensive enterprise platform combining the best of Odoo (ERP), ClickUp (project management), HubSpot (marketing/CRM), and Bizzabo/Cvent (event management) — specifically optimized for the live events and production industry.
