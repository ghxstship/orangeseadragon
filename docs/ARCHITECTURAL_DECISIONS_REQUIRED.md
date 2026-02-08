# ATLVS — Items Requiring Architectural Decisions Beyond Audit Scope

> Generated: 2026-02-07 | Step 7 of Execution Order

Items flagged during the three-pass verification, remediation, and UI surfacing audit that require decisions from the product/engineering team before implementation.

---

## 1. Supabase Type Regeneration (BLOCKING)

**Impact**: 158 TypeScript errors, ~130 caused by stale generated types  
**Root Cause**: Migrations 00075–00088 added 28+ tables, 25+ RPC functions, and numerous columns that are not reflected in `src/types/supabase.ts`  
**Required Action**: Run `supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts`  
**Prerequisite**: Install Supabase CLI (`brew install supabase/tap/supabase`) and authenticate  
**Decision Needed**: Whether to run against local dev DB or production schema

---

## 2. External API Key Provisioning

The following features have backend infrastructure and UI components ready but require external API keys to activate:

| Feature | API Required | Component Ready | Backend Ready |
|---------|-------------|-----------------|---------------|
| Weather contingency branching | Weather API (OpenWeatherMap / WeatherAPI) | WeatherWidget ✅ | DB tables ✅ |
| GPS/mapping integration | Google Maps / Mapbox API | MapView ✅ | DB tables ✅ |
| Ticketing platform sync | Eventbrite / DICE API | Webhook infra ✅ | Webhook routes ✅ |
| Social media analytics | Platform APIs (Meta, X, etc.) | Report engine ✅ | Extensible ✅ |
| Email delivery (invoices) | Resend API | Send route ✅ | `TS2307: Cannot find module 'resend'` |

**Decision Needed**: Which API providers to use, budget for API keys, and priority order for activation

---

## 3. Resend Email SDK Installation

**Impact**: `payments/send-payment-link/route.ts` and `invoices/[id]/send/route.ts` import `resend` which is not in `package.json`  
**Required Action**: `npm install resend` + configure `RESEND_API_KEY` env var  
**Decision Needed**: Confirm Resend as the email provider (vs SendGrid, Postmark, etc.)

---

## 4. Mobile/Hardware-Dependent Features

These features require native mobile capabilities or specialized hardware:

| Feature | Dependency | Status |
|---------|-----------|--------|
| Camera integration (photo docs) | Mobile camera API | File upload API ready |
| QR code scanning | Mobile camera + decoder | ScannerModal component ready |
| GPS crew check-in | Geolocation API | Check-in route ready |
| Push-to-talk | WebRTC audio | Realtime subscription layer ready |
| Offline mode + sync | Service Worker + IndexedDB | Architecture decision needed |

**Decision Needed**: PWA vs React Native vs hybrid approach for mobile features

---

## 5. Real-Time Collaboration Architecture

**Current State**: Supabase Realtime subscriptions are configured for notifications and activity feeds  
**Gap**: Full collaborative editing (Google Docs-style) for documents, run sheets, and call sheets requires either:
- Supabase Realtime with CRDT (Yjs/Automerge)
- Liveblocks or PartyKit integration
- Custom WebSocket server

**Decision Needed**: Which real-time collaboration framework to adopt

---

## 6. Stripe Integration Depth

**Current State**: `payments/webhook/route.ts` handles basic Stripe events; `payments/create-payment-link/route.ts` creates payment links  
**Gap**: The webhook references tables (`payment_attempts`, `recurring_invoices`) and RPC functions (`increment_recurring_invoice_count`) that exist in migrations but not in generated types  
**Required Action**: Type regeneration (item #1) resolves this  
**Decision Needed**: Whether to expand Stripe integration to include:
- Subscription billing for retainer clients
- Stripe Connect for vendor payouts
- Stripe Tax for multi-jurisdiction tax calculation

---

## 7. CAD/Technical Drawing Viewer

**Current State**: No component exists for viewing technical drawings (stage plots, rigging diagrams, lighting plots)  
**Options**:
- Embed AutoCAD Web viewer
- Integrate open-source viewer (e.g., xeokit, IFC.js)
- PDF-only approach (convert CAD to PDF for viewing)

**Decision Needed**: Viewer technology and supported file formats (.dwg, .dxf, .pdf, .svg)

---

## 8. Curfew Countdown Timers — ✅ RESOLVED

**Implementation**: `CurfewCountdownWidget` created as standalone design system component  
**Location**: `src/components/productions/widgets/CurfewCountdownWidget.tsx`  
**Registry**: Registered as `curfew_countdown` in ComponentRegistry  
**Features**: Phase-aware (safe → warning → critical → expired), configurable thresholds, animated alerts  
**Integration**: Available as dashboard widget and embeddable in RunOfShow/ShowCallingView via registry

---

## Priority Recommendation

| Priority | Item | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| **P0** | Supabase type regeneration | 5 min | Resolves stale types | ✅ TSC passes clean; regen after migration 00094 apply |
| **P0** | Resend SDK install | 5 min | Unblocks invoice/payment emails | ✅ Already installed (resend@^6.9.1) |
| **P1** | External API keys (Weather, Maps) | 1 hr config | Activates 2 major features | ⏳ Needs API key procurement |
| **P1** | Stripe type alignment | 0 (resolved by P0) | Unblocks payment webhook | ✅ Resolved |
| **P2** | Real-time collaboration decision | Architecture review | Enables collaborative editing | ⏳ Decision needed |
| **P2** | Mobile strategy decision | Architecture review | Enables field operations | ⏳ Decision needed |
| **P3** | CAD viewer selection | Vendor evaluation | Enables technical drawings | ⏳ Decision needed |
| **P3** | Curfew countdown | 2 hr build | Show-day UX enhancement | ✅ Built — `CurfewCountdownWidget` |
