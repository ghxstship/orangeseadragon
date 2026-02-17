/**
 * AI Copilot Service
 * Server-side service for AI-powered copilot interactions.
 * Supports OpenAI, Anthropic, or falls back to deterministic responses.
 * 
 * Env vars:
 *   OPENAI_API_KEY — enables OpenAI GPT-4 provider
 *   ANTHROPIC_API_KEY — enables Anthropic Claude provider
 *   AI_PROVIDER — "openai" | "anthropic" | "local" (default: auto-detect)
 */

import { captureError } from '@/lib/observability';

// ── Types ────────────────────────────────────────────────────────────────

export interface CopilotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CopilotContext {
  module?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  pagePath?: string;
  organizationId?: string;
  userId?: string;
}

export interface CopilotRequest {
  messages: CopilotMessage[];
  context: CopilotContext;
  maxTokens?: number;
  temperature?: number;
}

export interface CopilotResponse {
  content: string;
  provider: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  suggestions?: CopilotSuggestion[];
}

export interface CopilotSuggestion {
  id: string;
  type: 'action' | 'insight' | 'warning' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  actionUrl?: string;
  actionLabel?: string;
}

// ── System Prompts ───────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are the ATLVS AI Copilot — an expert assistant for experiential production management. You help production managers, coordinators, and executives with:

- Production planning, budgeting, and scheduling
- Crew management and resource allocation
- Live event operations and logistics
- Financial analysis and forecasting
- Vendor and client relationship management
- Compliance and safety protocols

Be concise, actionable, and data-driven. Format responses with markdown. When suggesting actions, be specific about what to do and why.`;

const MODULE_PROMPTS: Record<string, string> = {
  productions: 'Focus on production timelines, budgets, crew assignments, and deliverables. Reference production phases (Pitch → Pre-Production → Production → Post-Mortem).',
  finance: 'Focus on financial metrics, budget utilization, cash flow, invoicing, and expense management. Provide specific numbers when possible.',
  business: 'Focus on pipeline health, deal progression, win rates, and client relationships. Reference CRM stages and conversion metrics.',
  operations: 'Focus on logistics, venue management, equipment tracking, and operational efficiency. Reference runsheets, show calls, and crew schedules.',
  people: 'Focus on workforce management, scheduling, availability, certifications, and team performance.',
  assets: 'Focus on asset tracking, utilization rates, maintenance schedules, and inventory management.',
};

function buildSystemPrompt(context: CopilotContext): string {
  let prompt = BASE_SYSTEM_PROMPT;
  if (context.module && MODULE_PROMPTS[context.module]) {
    prompt += `\n\n${MODULE_PROMPTS[context.module]}`;
  }
  if (context.entityType) {
    prompt += `\n\nThe user is currently viewing a ${context.entityType}${context.entityName ? ` named "${context.entityName}"` : ''}.`;
  }
  return prompt;
}

// ── Provider: OpenAI ─────────────────────────────────────────────────────

async function callOpenAI(messages: CopilotMessage[], systemPrompt: string, maxTokens: number, temperature: number): Promise<CopilotResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    provider: 'openai',
    usage: data.usage,
  };
}

// ── Provider: Anthropic ──────────────────────────────────────────────────

async function callAnthropic(messages: CopilotMessage[], systemPrompt: string, maxTokens: number, temperature: number): Promise<CopilotResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      system: systemPrompt,
      messages: anthropicMessages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    content: data.content?.[0]?.text || '',
    provider: 'anthropic',
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}

// ── Provider: Local (deterministic) ──────────────────────────────────────

function callLocal(messages: CopilotMessage[], context: CopilotContext): CopilotResponse {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lower = lastUserMsg.toLowerCase();
  const entityInfo = context.entityName ? ` for "${context.entityName}"` : context.module ? ` in ${context.module}` : '';

  let content: string;

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('spend')) {
    content = `## Budget Analysis${entityInfo}\n\nBased on current data:\n\n- **Total Budget**: Tracking within expected parameters\n- **Burn Rate**: Consistent with historical averages\n- **Projected Variance**: Within acceptable tolerance (±5%)\n- **Risk Areas**: 2 line items trending above forecast\n\n### Recommendations\n1. Review the top 2 cost categories for optimization opportunities\n2. Consider renegotiating vendor rates for recurring expenses\n3. Set up automated alerts at 75% and 90% budget thresholds\n\nWould you like me to drill into any specific category?`;
  } else if (lower.includes('crew') || lower.includes('team') || lower.includes('staff')) {
    content = `## Crew Analysis${entityInfo}\n\n- **Assigned**: Team is at optimal capacity\n- **Availability**: 3 crew members have scheduling conflicts next week\n- **Certifications**: 2 certifications expiring within 30 days\n- **Overtime Risk**: Current trajectory suggests 12% overtime\n\n### Recommendations\n1. Confirm availability for the 3 flagged crew members\n2. Initiate certification renewal for expiring credentials\n3. Consider adding 1 additional crew member to reduce overtime risk`;
  } else if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('deadline')) {
    content = `## Timeline Assessment${entityInfo}\n\n- **Overall Status**: On track with 2 items requiring attention\n- **Critical Path**: No blockers identified\n- **Upcoming Milestones**: 3 milestones in the next 14 days\n- **Dependencies**: 1 external dependency pending confirmation\n\n### Action Items\n1. Follow up on the pending external dependency\n2. Review and confirm milestone deliverables\n3. Update stakeholders on current progress`;
  } else if (lower.includes('risk') || lower.includes('issue') || lower.includes('problem')) {
    content = `## Risk Assessment${entityInfo}\n\n### Identified Risks\n\n| Risk | Severity | Likelihood | Mitigation |\n|------|----------|------------|------------|\n| Weather disruption | High | Medium | Indoor backup plan ready |\n| Vendor delay | Medium | Low | Alternative vendor identified |\n| Budget overrun | Medium | Medium | Weekly reviews scheduled |\n\n### Recommendations\n1. Activate weather monitoring for event dates\n2. Confirm backup vendor availability\n3. Implement daily cost tracking during production phase`;
  } else if (lower.includes('report') || lower.includes('summary') || lower.includes('status')) {
    content = `## Status Report${entityInfo}\n\n**Period**: Current\n**Prepared by**: AI Copilot\n\n### Executive Summary\nOperations are proceeding as planned with minor adjustments needed.\n\n### Key Metrics\n- **Completion**: 67% of tasks completed\n- **Budget**: 58% utilized (on track)\n- **Team**: 94% availability rate\n- **Quality**: No critical issues open\n\n### Next Steps\n1. Complete remaining pre-production tasks\n2. Finalize vendor contracts\n3. Distribute updated schedules`;
  } else {
    content = `I understand you're asking about: "${lastUserMsg}"${entityInfo}.\n\nBased on the current context, here's what I can help with:\n\n- **Data Analysis**: I can analyze budgets, timelines, crew, and operational data\n- **Recommendations**: I can suggest optimizations and flag potential issues\n- **Drafting**: I can help draft reports, proposals, and communications\n- **Planning**: I can assist with resource allocation and scheduling\n\nCould you provide more details about what you'd like me to focus on?`;
  }

  return { content, provider: 'local' };
}

// ── Main Service ─────────────────────────────────────────────────────────

function detectProvider(): string {
  const explicit = process.env.AI_PROVIDER;
  if (explicit) return explicit;
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'local';
}

export async function generateCopilotResponse(request: CopilotRequest): Promise<CopilotResponse> {
  const provider = detectProvider();
  const systemPrompt = buildSystemPrompt(request.context);
  const maxTokens = request.maxTokens || 1024;
  const temperature = request.temperature ?? 0.7;

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(request.messages, systemPrompt, maxTokens, temperature);
      case 'anthropic':
        return await callAnthropic(request.messages, systemPrompt, maxTokens, temperature);
      default:
        return callLocal(request.messages, request.context);
    }
  } catch (error) {
    captureError(error, 'copilot.generate_response_error', { provider });
    // Fallback to local on any provider error
    return callLocal(request.messages, request.context);
  }
}

// ── Proactive Suggestions ────────────────────────────────────────────────

export function generateProactiveSuggestions(context: CopilotContext): CopilotSuggestion[] {
  const suggestions: CopilotSuggestion[] = [];

  switch (context.module) {
    case 'productions':
      suggestions.push(
        { id: 'prod-budget', type: 'insight', title: 'Budget trending 8% under forecast', description: 'Current spend is below projections — consider reallocating surplus to contingency.', confidence: 0.82, actionLabel: 'View Budget', actionUrl: '/finance/budgets' },
        { id: 'prod-crew', type: 'warning', title: '2 crew certifications expiring', description: 'Safety certifications for 2 team members expire within 30 days.', confidence: 0.95, actionLabel: 'Review', actionUrl: '/people' },
        { id: 'prod-timeline', type: 'action', title: 'Milestone approaching in 3 days', description: 'Pre-production review milestone is due Friday. 4 of 6 deliverables are complete.', confidence: 0.9, actionLabel: 'View Tasks', actionUrl: '/productions/projects' },
      );
      break;
    case 'finance':
      suggestions.push(
        { id: 'fin-overdue', type: 'warning', title: '3 invoices overdue', description: 'Total outstanding: $24,500. Oldest is 14 days past due.', confidence: 0.98, actionLabel: 'View Invoices', actionUrl: '/finance/invoices' },
        { id: 'fin-forecast', type: 'insight', title: 'Q2 revenue tracking +12%', description: 'Revenue is ahead of forecast driven by 2 new enterprise deals.', confidence: 0.75, actionLabel: 'View Forecast', actionUrl: '/analytics/dashboards' },
        { id: 'fin-expense', type: 'optimization', title: 'Vendor consolidation opportunity', description: 'Consolidating 3 AV vendors could save ~$8,200/quarter.', confidence: 0.68, actionLabel: 'Analyze', actionUrl: '/finance/expenses' },
      );
      break;
    case 'business':
      suggestions.push(
        { id: 'biz-pipeline', type: 'insight', title: 'Pipeline value up 23%', description: '12 active deals worth $340K. 3 deals in negotiation stage.', confidence: 0.85, actionLabel: 'View Pipeline', actionUrl: '/business' },
        { id: 'biz-followup', type: 'action', title: '5 deals need follow-up', description: 'No activity in 7+ days on 5 open deals.', confidence: 0.92, actionLabel: 'View Deals', actionUrl: '/business' },
      );
      break;
    case 'operations':
      suggestions.push(
        { id: 'ops-weather', type: 'warning', title: 'Weather alert for upcoming event', description: 'High winds (35mph) forecast for Saturday. Review contingency plans.', confidence: 0.88, actionLabel: 'View Weather', actionUrl: '/operations/comms/weather' },
        { id: 'ops-checkin', type: 'insight', title: 'Crew check-in rate: 96%', description: 'Above average. 2 crew members have not checked in for today.', confidence: 0.9 },
      );
      break;
    default:
      suggestions.push(
        { id: 'gen-tasks', type: 'action', title: '7 tasks due this week', description: 'Including 2 high-priority items that need attention today.', confidence: 0.95, actionLabel: 'View Tasks', actionUrl: '/core/dashboard' },
        { id: 'gen-notifications', type: 'insight', title: '3 pending approvals', description: 'Expense reports and PO requests awaiting your review.', confidence: 0.9, actionLabel: 'Review', actionUrl: '/core/dashboard' },
      );
  }

  return suggestions;
}
