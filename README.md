# ATLVS - Unified Operations Platform

A comprehensive enterprise operations management platform for live events, production companies, and creative agencies. Built with Next.js 15, Supabase, and modern UI components.

## Features

### 9 Management Domains
- **Project Management** - Tasks, milestones, dependencies, and team collaboration
- **Events & Live Production** - Runsheets, cue sheets, show calls, and production notes
- **Asset Management** - Equipment tracking, maintenance, reservations, and inventory
- **Workforce Management** - Crew calls, scheduling, timesheets, and certifications
- **Finance Management** - Budgets, invoices, expenses, and contracts
- **CRM & Business** - Companies, contacts, deals, and proposals
- **Venue Management** - Venue database, availability, and site surveys
- **Content & Marketing** - Media library, campaigns, and social posts
- **Talent Management** - Artist profiles, bookings, riders, and payments

### Enterprise Features

#### 12 View Components
| View | Description |
|------|-------------|
| DataTable | Full-featured data table with sorting, filtering, pagination |
| KanbanBoard | Drag-drop board with WIP limits and swimlanes |
| CalendarView | Multi-view calendar (day/week/month/agenda) |
| TimelineView | Horizontal timeline with zoom levels |
| GanttView | Project Gantt chart with dependencies and critical path |
| ListView | Grouped list with inline editing |
| WorkloadView | Resource capacity visualization |
| MapView | Interactive map with markers and clustering |
| ActivityFeed | Chronological activity stream |
| DashboardWidgets | Metric, progress, list, donut, sparkline widgets |
| FormBuilder | Dynamic form builder with 16 field types |
| Toolbar | Global actions (search, filter, sort, export, etc.) |

#### Workflow Engine
- 22+ pre-built workflow templates across 7 categories
- Visual workflow builder with conditional logic
- Automated triggers (time-based, event-based, webhook)
- Step types: approval, notification, data update, integration, delay

#### Integration Connectors (90+)
- **ERP**: NetSuite, SAP, Dynamics 365, Sage Intacct, Oracle Fusion
- **CRM**: Salesforce, HubSpot, Pipedrive, Zoho CRM
- **HRIS**: Workday, BambooHR, ADP, Gusto, Rippling
- **FinOps**: Stripe, Ramp, Brex, Bill.com, Expensify
- **Communication**: Slack, Teams, Zoom, Twilio, SendGrid
- **Calendar**: Google Calendar, Outlook, Calendly
- **Storage**: Google Drive, Dropbox, OneDrive, Box, S3
- **Ticketing**: Eventbrite, Ticketmaster, Universe
- **Identity**: Okta, Auth0, Azure AD, OneLogin

#### White-Label Theming
- Customizable brand colors, typography, and logos
- Light/dark mode support
- Component style customization (border radius, button styles)
- CSS variable-based theming
- Theme presets and live preview

#### Notification Service
- Multi-channel: Email, Push, SMS, In-App, Slack, Webhook
- 15+ notification templates
- User preferences and quiet hours
- Digest notifications
- Rate limiting and retry logic

#### Audit Logging
- Comprehensive audit trail for compliance
- 40+ action types tracked
- Sensitive field redaction
- 7-year retention for compliance (GDPR, HIPAA, SOC2)
- Real-time alerts for high-severity events
- Export to JSON/CSV

## Tech Stack

- **Frontend**: Next.js 15.5.x, React 19.2.x, TypeScript 5.9.x
- **Styling**: Tailwind CSS 3.4.x, shadcn/ui, Radix UI primitives
- **State Management**: Zustand, React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account (for backend services)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes (42+ pages)
│   │   ├── dashboard/     # Dashboard page
│   │   ├── tasks/         # Task management
│   │   ├── projects/      # Project management
│   │   ├── calendar/      # Calendar view
│   │   ├── assets/        # Asset management
│   │   ├── people/        # Team management
│   │   ├── events/        # Event management
│   │   ├── venues/        # Venue management
│   │   ├── talent/        # Talent management
│   │   ├── documents/     # Document management
│   │   ├── workflows/     # Workflow automation
│   │   ├── finance/       # Finance management
│   │   ├── crm/           # CRM module
│   │   ├── reports/       # Reports & analytics
│   │   ├── settings/      # Settings & branding
│   │   └── account/       # Account management
│   ├── (auth)/            # Authentication routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   ├── ui/                # UI components (shadcn/ui)
│   └── views/             # Reusable view components
│       ├── data-table.tsx
│       ├── kanban-board.tsx
│       ├── calendar-view.tsx
│       ├── timeline-view.tsx
│       ├── gantt-view.tsx
│       ├── list-view.tsx
│       ├── workload-view.tsx
│       ├── map-view.tsx
│       ├── activity-feed.tsx
│       ├── dashboard-widgets.tsx
│       ├── form-builder.tsx
│       └── toolbar.tsx
├── lib/
│   ├── api/               # API utilities
│   ├── audit/             # Audit logging service
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   ├── integrations/      # Integration connectors
│   │   ├── types.ts
│   │   ├── connectors.ts  # 90+ connectors
│   │   ├── service.ts
│   │   └── index.ts
│   ├── notifications/     # Notification service
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── templates.ts
│   │   └── index.ts
│   ├── seed/              # Demo data generation
│   ├── supabase/          # Supabase client setup
│   ├── theming/           # White-label theming
│   │   ├── theme-config.ts
│   │   ├── theme-provider.tsx
│   │   ├── white-label.ts
│   │   └── index.ts
│   ├── workflow-engine/   # Workflow automation
│   │   ├── types.ts
│   │   ├── engine.ts
│   │   ├── templates.ts   # 22+ templates
│   │   ├── service.ts
│   │   └── index.ts
│   ├── config.ts          # App configuration
│   ├── enums.ts           # Type enums
│   ├── formatters.ts      # Data formatters
│   ├── helpers.ts         # Helper functions
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Validation schemas
supabase/
├── config.toml            # Supabase configuration
└── migrations/            # Database migrations (11 files)
```

## Database Schema

The platform includes 100+ database tables organized across domains:
- Core tables (organizations, users, roles, departments)
- Project & task management
- Events & live production
- Asset & inventory management
- Workforce & scheduling
- Finance & accounting
- CRM & sales
- Venues & site management
- Content & marketing
- Talent & booking
- Ticketing & guest management
- Workflows & automation
- Documents & collaboration

## Development

### Running Migrations
```bash
npx supabase db push
```

### Generating Types
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

### Building for Production
```bash
npm run build
```

## License

Proprietary - All rights reserved.
