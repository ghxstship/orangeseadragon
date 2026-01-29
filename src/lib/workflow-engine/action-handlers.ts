/**
 * Workflow Action Handlers
 * Comprehensive action handlers for all workflow operations
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import type { ExecutionContext } from "./types";

// Helper to access tables dynamically (bypasses strict typing for workflow-created tables)
function getTable(tableName: string) {
  const supabase = createClient();
  return (supabase.from as any)(tableName);
}

export type ActionHandler = (
  parameters: Record<string, unknown>,
  context: ExecutionContext
) => Promise<Record<string, unknown>>;

export interface ActionRegistry {
  [actionType: string]: ActionHandler;
}

// ==================== Core Database Actions ====================

const queryAction: ActionHandler = async (params, _context) => {
  const supabase = createClient();
  const { entity, filters, include, orderBy, limit, offset } = params as {
    entity: string;
    filters?: Record<string, unknown>;
    include?: string[];
    orderBy?: { field: string; direction: "asc" | "desc" };
    limit?: number;
    offset?: number;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from as any)(entity).select(include?.join(",") || "*");

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === "object" && value !== null) {
        const filterObj = value as Record<string, unknown>;
        if ("$eq" in filterObj) query = query.eq(key, filterObj.$eq);
        if ("$ne" in filterObj) query = query.neq(key, filterObj.$ne);
        if ("$gt" in filterObj) query = query.gt(key, filterObj.$gt);
        if ("$gte" in filterObj) query = query.gte(key, filterObj.$gte);
        if ("$lt" in filterObj) query = query.lt(key, filterObj.$lt);
        if ("$lte" in filterObj) query = query.lte(key, filterObj.$lte);
        if ("$in" in filterObj) query = query.in(key, filterObj.$in as unknown[]);
        if ("$nin" in filterObj) query = query.not(key, "in", `(${(filterObj.$nin as unknown[]).join(",")})`);
        if ("$contains" in filterObj) query = query.ilike(key, `%${filterObj.$contains}%`);
      } else {
        query = query.eq(key, value);
      }
    }
  }

  if (orderBy) {
    query = query.order(orderBy.field, { ascending: orderBy.direction === "asc" });
  }

  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 10) - 1);

  const { data, error } = await query;

  if (error) throw new Error(`Query failed: ${error.message}`);
  return { data, count: data?.length || 0 };
};

const createEntityAction: ActionHandler = async (params, _context) => {
  const supabase = createClient();
  const { entity, data } = params as { entity: string; data: Record<string, unknown> };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: created, error } = await (supabase.from as any)(entity).insert(data).select().single();

  if (error) throw new Error(`Create failed: ${error.message}`);
  return { created, id: created?.id };
};

const updateEntityAction: ActionHandler = async (params, _context) => {
  const supabase = createClient();
  const { entity, id, data, filters } = params as {
    entity: string;
    id?: string;
    data: Record<string, unknown>;
    filters?: Record<string, unknown>;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from as any)(entity).update(data);

  if (id) {
    query = query.eq("id", id);
  } else if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
  }

  const { data: updated, error } = await query.select();

  if (error) throw new Error(`Update failed: ${error.message}`);
  return { updated, count: updated?.length || 0 };
};

const deleteEntityAction: ActionHandler = async (params, _context) => {
  const supabase = createClient();
  const { entity, id, filters } = params as {
    entity: string;
    id?: string;
    filters?: Record<string, unknown>;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from as any)(entity).delete();

  if (id) {
    query = query.eq("id", id);
  } else if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
  }

  const { error, count } = await query;

  if (error) throw new Error(`Delete failed: ${error.message}`);
  return { deleted: true, count };
};

const bulkUpdateAction: ActionHandler = async (params, _context) => {
  const supabase = createClient();
  const { entity, updates } = params as {
    entity: string;
    updates: Array<{ id: string; data: Record<string, unknown> }>;
  };

  const results = await Promise.all(
    updates.map(async ({ id, data }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from as any)(entity).update(data).eq("id", id);
      return { id, success: !error, error: error?.message };
    })
  );

  const successful = results.filter((r) => r.success).length;
  return { results, successful, failed: results.length - successful };
};

const bulkCreateAction: ActionHandler = async (params, _context) => {
  const supabase = createClient();
  const { entity, records } = params as {
    entity: string;
    records: Record<string, unknown>[];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from as any)(entity).insert(records).select();

  if (error) throw new Error(`Bulk create failed: ${error.message}`);
  return { created: data, count: data?.length || 0 };
};

// ==================== Lead/CRM Actions ====================

const calculateLeadScoreAction: ActionHandler = async (params, _context) => {
  const { leadId, factors } = params as {
    leadId: string;
    factors?: Record<string, number>;
  };

  const supabase = createClient();
  const { data: lead } = await getTable("leads").select("*").eq("id", leadId).single();

  if (!lead) throw new Error("Lead not found");

  // Cast lead to allow dynamic property access
  const leadData = lead as Record<string, unknown>;

  // Scoring algorithm
  let score = 0;
  const breakdown: Record<string, number> = {};

  // Company size scoring (use metadata or company_id based scoring)
  const companySizeScores: Record<string, number> = {
    enterprise: 30,
    mid_market: 25,
    small_business: 15,
    startup: 10,
  };
  const companySize = (leadData.company_size || leadData.size || "small_business") as string;
  const companyScore = companySizeScores[companySize] || 10;
  score += companyScore;
  breakdown.companySize = companyScore;

  // Engagement scoring
  const emailOpens = (leadData.email_opens || leadData.opens || 0) as number;
  const pageViews = (leadData.page_views || leadData.views || 0) as number;
  const engagementScore = Math.min(emailOpens * 2 + pageViews, 30);
  score += engagementScore;
  breakdown.engagement = engagementScore;

  // Source scoring
  const sourceScores: Record<string, number> = {
    referral: 25,
    organic: 20,
    paid: 15,
    social: 10,
    cold: 5,
  };
  const sourceScore = sourceScores[leadData.source as string] || 10;
  score += sourceScore;
  breakdown.source = sourceScore;

  // Apply custom factors
  if (factors) {
    for (const [factor, weight] of Object.entries(factors)) {
      if (leadData[factor]) {
        score += weight;
        breakdown[factor] = weight;
      }
    }
  }

  // Determine grade
  let grade: string;
  if (score >= 80) grade = "A";
  else if (score >= 60) grade = "B";
  else if (score >= 40) grade = "C";
  else if (score >= 20) grade = "D";
  else grade = "F";

  // Update lead with score
  await getTable("leads").update({ score, score_grade: grade }).eq("id", leadId);

  return { score, grade, breakdown, leadId };
};

const enrichCompanyDataAction: ActionHandler = async (params, _context) => {
  const { companyId, domain } = params as { companyId?: string; domain?: string };

  // In production, integrate with Clearbit, ZoomInfo, etc.
  // For now, return mock enrichment data
  const enrichedData = {
    companyId,
    domain,
    enrichedAt: new Date().toISOString(),
    data: {
      employeeCount: Math.floor(Math.random() * 1000) + 10,
      industry: "Technology",
      revenue: "$10M-$50M",
      founded: 2015,
      technologies: ["React", "Node.js", "AWS"],
      socialProfiles: {
        linkedin: `https://linkedin.com/company/${domain?.split(".")[0]}`,
        twitter: `https://twitter.com/${domain?.split(".")[0]}`,
      },
    },
  };

  if (companyId) {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("companies").update({ enrichment_data: enrichedData.data }).eq("id", companyId);
  }

  return enrichedData;
};

const assignLeadAction: ActionHandler = async (params, _context) => {
  const { leadId, assigneeId, assignmentMethod } = params as {
    leadId: string;
    assigneeId?: string;
    assignmentMethod?: "round_robin" | "load_balanced" | "territory" | "manual";
  };

  const supabase = createClient();

  let finalAssigneeId = assigneeId;

  if (!finalAssigneeId && assignmentMethod) {
    // Get available sales reps
    const { data: reps } = await getTable("users")
      .select("id")
      .eq("role", "sales_rep")
      .eq("is_active", true);

    if (reps && reps.length > 0) {
      // Simple random assignment (load balancing would require additional tracking)
      finalAssigneeId = reps[Math.floor(Math.random() * reps.length)].id;
    }
  }

  if (!finalAssigneeId) throw new Error("No assignee available");

  await getTable("leads")
    .update({ assignee_id: finalAssigneeId, assigned_at: new Date().toISOString() })
    .eq("id", leadId);

  return { leadId, assigneeId: finalAssigneeId, assignedAt: new Date().toISOString() };
};

const createDealFromLeadAction: ActionHandler = async (params, _context) => {
  const { leadId, pipelineId, stageId } = params as {
    leadId: string;
    pipelineId?: string;
    stageId?: string;
  };

  const supabase = createClient();
  const { data: lead } = await getTable("leads").select("*").eq("id", leadId).single();

  if (!lead) throw new Error("Lead not found");

  const { data: deal, error } = await getTable("deals")
    .insert({
      name: `${lead.company_name} - New Opportunity`,
      company_id: lead.company_id,
      contact_id: lead.contact_id,
      value: lead.estimated_value || 0,
      owner_id: lead.assignee_id,
      status: "open",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create deal: ${error.message}`);

  // Update lead status
  await getTable("leads").update({ status: "converted", converted_deal_id: deal.id }).eq("id", leadId);

  return { deal, leadId };
};

// ==================== Email/Campaign Actions ====================

const sendEmailAction: ActionHandler = async (params, _context) => {
  const { to, subject, template, data, from } = params as {
    to: string | string[];
    subject: string;
    template: string;
    data?: Record<string, unknown>;
    from?: string;
  };

  // In production, integrate with SendGrid, Resend, etc.
  const recipients = Array.isArray(to) ? to : [to];

  const emailRecord = {
    recipients,
    subject,
    template,
    data,
    from: from || "noreply@company.com",
    sentAt: new Date().toISOString(),
    status: "sent",
  };

  // Log email send
  const supabase = createClient();
  await getTable("email_logs").insert(emailRecord);

  return { sent: true, recipients: recipients.length, messageId: `msg_${Date.now()}` };
};

const createEmailCampaignAction: ActionHandler = async (params, _context) => {
  const { name, subject, template, segmentId, scheduledFor } = params as {
    name: string;
    subject: string;
    template: string;
    segmentId?: string;
    scheduledFor?: string;
  };

  const { data: campaign, error } = await getTable("email_campaigns")
    .insert({
      name,
      subject,
      template,
      segment_id: segmentId,
      scheduled_for: scheduledFor,
      status: scheduledFor ? "scheduled" : "draft",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create campaign: ${error.message}`);

  return { campaign };
};

const trackEmailEventAction: ActionHandler = async (params, _context) => {
  const { emailId, event, metadata } = params as {
    emailId: string;
    event: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "unsubscribed";
    metadata?: Record<string, unknown>;
  };

  const supabase = createClient();

  await getTable("email_events").insert({
    email_id: emailId,
    event_type: event,
    metadata,
    occurred_at: new Date().toISOString(),
  });

  // Update email stats - RPC function may not exist yet, skip for now
  // const updateField = `${event}_count`;
  // await supabase.rpc("increment_email_stat", { email_id: emailId, stat_field: updateField });

  return { tracked: true, event, emailId };
};

// ==================== Ticket/Support Actions ====================

const categorizeTicketAction: ActionHandler = async (params, _context) => {
  const { ticketId, subject, description } = params as {
    ticketId: string;
    subject: string;
    description: string;
  };

  // Simple keyword-based categorization (in production, use ML)
  const text = `${subject} ${description}`.toLowerCase();

  const categories: Record<string, string[]> = {
    billing: ["invoice", "payment", "charge", "refund", "subscription", "billing"],
    technical: ["bug", "error", "crash", "not working", "broken", "issue"],
    feature: ["feature", "request", "suggestion", "would like", "can you add"],
    account: ["password", "login", "access", "account", "profile"],
    general: [],
  };

  let category = "general";
  let requiredSkills: string[] = ["general_support"];

  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => text.includes(kw))) {
      category = cat;
      break;
    }
  }

  // Map category to required skills
  const skillMap: Record<string, string[]> = {
    billing: ["billing_support", "finance"],
    technical: ["technical_support", "engineering"],
    feature: ["product_support"],
    account: ["account_support", "security"],
    general: ["general_support"],
  };

  requiredSkills = skillMap[category] || ["general_support"];

  return { category, requiredSkills, ticketId };
};

const determineTicketPriorityAction: ActionHandler = async (params, _context) => {
  const { ticketId, customerId, category } = params as {
    ticketId: string;
    customerId: string;
    category: string;
  };

  const supabase = createClient();

  // Check customer tier
  const { data: customer } = await getTable("customers")
    .select("tier, mrr, is_enterprise")
    .eq("id", customerId)
    .single();

  let priority = "medium";
  let slaHours = 24;

  // Priority based on customer tier
  if (customer?.is_enterprise || customer?.tier === "enterprise") {
    priority = "urgent";
    slaHours = 4;
  } else if (customer?.tier === "pro" || (customer?.mrr && customer.mrr > 500)) {
    priority = "high";
    slaHours = 8;
  } else if (category === "billing") {
    priority = "high";
    slaHours = 12;
  }

  return { priority, slaHours, ticketId, customerTier: customer?.tier };
};

const findAvailableAgentAction: ActionHandler = async (params, _context) => {
  const { skills } = params as {
    skills?: string[];
  };

  const supabase = createClient();

  // Find agents with matching skills and lowest current load
  const { data: agents } = await getTable("support_agents")
    .select("id, name, current_ticket_count, skills")
    .eq("is_available", true)
    .eq("is_online", true);

  if (!agents || agents.length === 0) {
    throw new Error("No available agents");
  }

  // Filter by skills if provided
  let eligibleAgents = agents;
  if (skills && skills.length > 0) {
    eligibleAgents = agents.filter((agent: { id: string; name: string; skills?: string[] }) => {
      const agentSkills = agent.skills || [];
      return skills.some((skill) => agentSkills.includes(skill));
    });
  }

  if (eligibleAgents.length === 0) {
    eligibleAgents = agents; // Fallback to any available agent
  }

  // Sort by current load
  type Agent = { id: string; name: string; current_ticket_count?: number; skills?: string[] };
  eligibleAgents.sort((a: Agent, b: Agent) => (a.current_ticket_count || 0) - (b.current_ticket_count || 0));

  return { agentId: eligibleAgents[0].id, agentName: eligibleAgents[0].name };
};

const findTicketsAtSLARiskAction: ActionHandler = async (params, _context) => {
  const { warningThresholdPercent, statuses } = params as {
    warningThresholdPercent: number;
    statuses: string[];
  };

  const supabase = createClient();

  const { data: tickets } = await getTable("support_tickets")
    .select("*, sla_deadline")
    .in("status", statuses)
    .not("sla_deadline", "is", null);

  const now = new Date();
  const warning: typeof tickets = [];
  const breached: typeof tickets = [];

  for (const ticket of tickets || []) {
    const deadline = new Date(ticket.sla_deadline);
    const created = new Date(ticket.created_at);
    const totalTime = deadline.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const percentUsed = (elapsed / totalTime) * 100;

    const ticketWithTime = {
      ...ticket,
      slaTimeRemaining: Math.max(0, deadline.getTime() - now.getTime()),
      slaPercentUsed: percentUsed,
    };

    if (now > deadline) {
      breached.push(ticketWithTime);
    } else if (percentUsed >= warningThresholdPercent) {
      warning.push(ticketWithTime);
    }
  }

  return { warning, breached };
};

// ==================== Document Generation Actions ====================

const generateDocumentAction: ActionHandler = async (params, _context) => {
  const { template, data, format } = params as {
    template: string;
    data: Record<string, unknown>;
    format?: "pdf" | "docx" | "html";
  };

  // In production, integrate with document generation service
  const documentId = `doc_${Date.now()}`;
  const documentUrl = `/documents/${documentId}.${format || "pdf"}`;

  const supabase = createClient();
  await getTable("generated_documents").insert({
    id: documentId,
    template,
    data,
    format: format || "pdf",
    url: documentUrl,
    generated_at: new Date().toISOString(),
  });

  return { documentId, url: documentUrl, format: format || "pdf" };
};

const generateTicketsAction: ActionHandler = async (params, _context) => {
  const { orderId, format } = params as { orderId: string; format?: string };

  const supabase = createClient();
  const { data: order } = await getTable("ticket_orders")
    .select("*, tickets(*)")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");

  const ticketUrls = (order.tickets || []).map((ticket: { id: string }) => ({
    ticketId: ticket.id,
    url: `/tickets/${ticket.id}.${format || "pdf"}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=${ticket.id}`,
  }));

  return { tickets: ticketUrls, orderId };
};

// ==================== Scheduling Actions ====================

const scheduleWorkflowAction: ActionHandler = async (params, _context) => {
  const { workflowId, triggerAt, context: workflowContext } = params as {
    workflowId: string;
    triggerAt: string;
    context?: Record<string, unknown>;
  };

  const supabase = createClient();

  const { data: scheduled, error } = await getTable("scheduled_workflows")
    .insert({
      workflow_id: workflowId,
      trigger_at: triggerAt,
      context: workflowContext,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to schedule workflow: ${error.message}`);

  return { scheduled, scheduledId: scheduled.id };
};

const sendCalendarInviteAction: ActionHandler = async (params, _context) => {
  const { email, event, attendees } = params as {
    email: string;
    event: Record<string, unknown>;
    attendees?: string[];
  };

  // In production, integrate with Google Calendar, Outlook, etc.
  const inviteId = `invite_${Date.now()}`;

  return {
    sent: true,
    inviteId,
    recipients: [email, ...(attendees || [])],
    event,
  };
};

// ==================== Analytics Actions ====================

const calculateBudgetUtilizationAction: ActionHandler = async (params, _context) => {
  const { budgetId } = params as { budgetId: string };

  const supabase = createClient();

  const { data: budget } = await getTable("budgets").select("*").eq("id", budgetId).single();

  if (!budget) throw new Error("Budget not found");

  const { data: expenses } = await getTable("expenses")
    .select("amount")
    .eq("budget_id", budgetId)
    .eq("status", "approved");

  const spent = (expenses || []).reduce((sum: number, e: { amount?: number }) => sum + (e.amount || 0), 0);
  const percentage = (spent / budget.amount) * 100;
  const remaining = budget.amount - spent;

  return {
    budgetId,
    budgetAmount: budget.amount,
    spent,
    remaining,
    percentage: Math.round(percentage * 100) / 100,
  };
};

const analyzeTicketPatternsAction: ActionHandler = async (params, _context) => {
  const { lookbackDays, minOccurrences, groupBy } = params as {
    lookbackDays: number;
    minOccurrences: number;
    groupBy: string[];
  };

  const supabase = createClient();
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: tickets } = await getTable("support_tickets")
    .select("*")
    .gte("created_at", since);

  // Group and analyze patterns
  const patterns: Record<string, { count: number; tickets: string[] }> = {};

  for (const ticket of tickets || []) {
    for (const field of groupBy) {
      const value = ticket[field];
      if (value) {
        const key = `${field}:${value}`;
        if (!patterns[key]) {
          patterns[key] = { count: 0, tickets: [] };
        }
        patterns[key].count++;
        patterns[key].tickets.push(ticket.id);
      }
    }
  }

  // Filter by minimum occurrences
  const significantPatterns = Object.entries(patterns)
    .filter(([, data]) => data.count >= minOccurrences)
    .map(([key, data]) => ({
      pattern: key,
      count: data.count,
      ticketIds: data.tickets,
    }));

  return { patterns: significantPatterns, totalTickets: tickets?.length || 0 };
};

// ==================== Approval Actions ====================

const createApprovalRequestAction: ActionHandler = async (params, _context) => {
  const { entityType, entityId, approvers, requiredApprovals, metadata } = params as {
    entityType: string;
    entityId: string;
    approvers: string[];
    requiredApprovals: number;
    metadata?: Record<string, unknown>;
  };

  const supabase = createClient();

  const { data: request, error } = await getTable("approval_requests")
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      approvers,
      required_approvals: requiredApprovals,
      current_approvals: 0,
      status: "pending",
      metadata,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create approval request: ${error.message}`);

  return { request, requestId: request.id };
};

const processApprovalAction: ActionHandler = async (params, _context) => {
  const { requestId, approverId, decision, comments } = params as {
    requestId: string;
    approverId: string;
    decision: "approved" | "rejected";
    comments?: string;
  };

  const supabase = createClient();

  // Record the approval decision
  await getTable("approval_decisions").insert({
    request_id: requestId,
    approver_id: approverId,
    decision,
    comments,
    decided_at: new Date().toISOString(),
  });

  // Get current request state
  const { data: request } = await getTable("approval_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) throw new Error("Approval request not found");

  let newStatus = request.status;
  let currentApprovals = request.current_approvals || 0;

  if (decision === "approved") {
    currentApprovals++;
    if (currentApprovals >= request.required_approvals) {
      newStatus = "approved";
    }
  } else {
    newStatus = "rejected";
  }

  await getTable("approval_requests")
    .update({ status: newStatus, current_approvals: currentApprovals })
    .eq("id", requestId);

  return { requestId, newStatus, currentApprovals, decision };
};

// ==================== Search Actions ====================

const searchKnowledgeBaseAction: ActionHandler = async (params, _context) => {
  const { query, limit, minScore } = params as {
    query: string;
    limit?: number;
    minScore?: number;
  };

  const supabase = createClient();

  // In production, use vector search or full-text search
  const searchTerms = query.toLowerCase().split(" ");

  const { data: articles } = await getTable("knowledge_base_articles")
    .select("id, title, content, category, views")
    .eq("status", "published");

  type Article = { id: string; title: string; content: string; category?: string; views?: number };
  type ScoredArticle = Article & { score: number };
  const scored: ScoredArticle[] = (articles || [])
    .map((article: Article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();
      const matches = searchTerms.filter((term) => text.includes(term)).length;
      const score = matches / searchTerms.length;
      return { ...article, score };
    })
    .filter((a: ScoredArticle) => a.score >= (minScore || 0))
    .sort((a: ScoredArticle, b: ScoredArticle) => b.score - a.score)
    .slice(0, limit || 5);

  return { articles: scored, count: scored.length };
};

const findDuplicateTicketsAction: ActionHandler = async (params, _context) => {
  const { ticketId, customerId, subject, lookbackDays, similarityThreshold } = params as {
    ticketId: string;
    customerId: string;
    subject: string;
    lookbackDays: number;
    similarityThreshold: number;
  };

  const supabase = createClient();
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: tickets } = await getTable("support_tickets")
    .select("id, subject, status, created_at")
    .eq("customer_id", customerId)
    .neq("id", ticketId)
    .gte("created_at", since)
    .in("status", ["open", "in_progress"]);

  // Simple similarity check (in production, use proper NLP)
  const subjectWords = new Set(subject.toLowerCase().split(" "));

  type Ticket = { id: string; subject: string; customer_id?: string };
  type ScoredTicket = Ticket & { similarity: number };
  const similar: ScoredTicket[] = (tickets || [])
    .map((ticket: Ticket) => {
      const ticketWords = new Set(ticket.subject.toLowerCase().split(" "));
      const intersection = Array.from(subjectWords).filter((w: string) => ticketWords.has(w));
      const similarity = intersection.length / Math.max(subjectWords.size, ticketWords.size);
      return { ...ticket, similarity };
    })
    .filter((t: ScoredTicket) => t.similarity >= similarityThreshold);

  return { duplicates: similar, count: similar.length };
};

// ==================== Notification Actions ====================

const sendPushNotificationAction: ActionHandler = async (params, _context) => {
  const { recipients, title, body, data } = params as {
    recipients: string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };

  // In production, integrate with Firebase, OneSignal, etc.
  const supabase = createClient();

  await getTable("push_notifications").insert({
    recipients,
    title,
    body,
    data,
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return { sent: true, recipients: recipients.length };
};

const sendSMSAction: ActionHandler = async (params, _context) => {
  const { to, message } = params as { to: string | string[]; message: string };

  // In production, integrate with Twilio, etc.
  const recipients = Array.isArray(to) ? to : [to];

  const supabase = createClient();
  await getTable("sms_logs").insert({
    recipients,
    message,
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return { sent: true, recipients: recipients.length };
};

// ==================== Export Action Registry ====================

export const actionHandlers: ActionRegistry = {
  // Core database actions
  query: queryAction,
  createEntity: createEntityAction,
  updateEntity: updateEntityAction,
  deleteEntity: deleteEntityAction,
  bulkUpdate: bulkUpdateAction,
  bulkCreate: bulkCreateAction,

  // Lead/CRM actions
  calculateLeadScore: calculateLeadScoreAction,
  enrichCompanyData: enrichCompanyDataAction,
  assignLead: assignLeadAction,
  createDealFromLead: createDealFromLeadAction,

  // Email/Campaign actions
  sendEmail: sendEmailAction,
  createEmailCampaign: createEmailCampaignAction,
  trackEmailEvent: trackEmailEventAction,

  // Ticket/Support actions
  categorizeTicket: categorizeTicketAction,
  determineTicketPriority: determineTicketPriorityAction,
  findAvailableAgent: findAvailableAgentAction,
  findTicketsAtSLARisk: findTicketsAtSLARiskAction,

  // Document actions
  generateDocument: generateDocumentAction,
  generateTickets: generateTicketsAction,

  // Scheduling actions
  scheduleWorkflow: scheduleWorkflowAction,
  sendCalendarInvite: sendCalendarInviteAction,

  // Analytics actions
  calculateBudgetUtilization: calculateBudgetUtilizationAction,
  analyzeTicketPatterns: analyzeTicketPatternsAction,

  // Approval actions
  createApprovalRequest: createApprovalRequestAction,
  processApproval: processApprovalAction,

  // Search actions
  searchKnowledgeBase: searchKnowledgeBaseAction,
  findDuplicateTickets: findDuplicateTicketsAction,

  // Notification actions
  sendPushNotification: sendPushNotificationAction,
  sendSMS: sendSMSAction,
};

export function getActionHandler(actionType: string): ActionHandler | undefined {
  return actionHandlers[actionType];
}

export function registerActionHandler(actionType: string, handler: ActionHandler): void {
  actionHandlers[actionType] = handler;
}
