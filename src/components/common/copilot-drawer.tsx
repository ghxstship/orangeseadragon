"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/ui-store";
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  FileText,
  BarChart3,
  Zap,
  ChevronDown,
  Loader2,
  Bot,
  User,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   AI COPILOT DRAWER
   Contextual slide-over panel with streaming responses.
   Understands the current record/page context.
   
   Features:
   - Context-aware suggestions based on current entity/page
   - Streaming text simulation for responses
   - Quick action chips for common operations
   - Message history within session
   - Copy-to-clipboard on responses
   - Dismissible per WCAG / AI-native UX guidelines
   ───────────────────────────────────────────────────────────── */

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface CopilotContext {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  pagePath?: string;
  module?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  prompt: string;
}

const moduleQuickActions: Record<string, QuickAction[]> = {
  default: [
    { id: "summarize", label: "Summarize", icon: FileText, prompt: "Summarize the key information on this page" },
    { id: "insights", label: "Insights", icon: Lightbulb, prompt: "What insights can you provide based on the current data?" },
    { id: "actions", label: "Suggest Actions", icon: Zap, prompt: "What actions should I take next?" },
    { id: "report", label: "Draft Report", icon: BarChart3, prompt: "Draft a brief report based on this data" },
  ],
  productions: [
    { id: "budget-check", label: "Budget Check", icon: BarChart3, prompt: "Analyze the budget health for this production" },
    { id: "timeline-risk", label: "Timeline Risk", icon: Lightbulb, prompt: "Identify any timeline risks for this project" },
    { id: "crew-suggest", label: "Crew Suggestions", icon: Zap, prompt: "Suggest optimal crew assignments based on availability" },
    { id: "wrap-report", label: "Draft Wrap Report", icon: FileText, prompt: "Draft a wrap report for this production" },
  ],
  finance: [
    { id: "cash-flow", label: "Cash Flow", icon: BarChart3, prompt: "Analyze the current cash flow situation" },
    { id: "overdue", label: "Overdue Items", icon: Lightbulb, prompt: "List all overdue invoices and suggest follow-up actions" },
    { id: "forecast", label: "Revenue Forecast", icon: Zap, prompt: "Provide a revenue forecast for the next quarter" },
    { id: "reconcile", label: "Reconciliation", icon: FileText, prompt: "Help me reconcile outstanding items" },
  ],
  business: [
    { id: "pipeline", label: "Pipeline Health", icon: BarChart3, prompt: "Analyze the current pipeline health and conversion rates" },
    { id: "follow-up", label: "Follow-ups", icon: Lightbulb, prompt: "Which deals need follow-up this week?" },
    { id: "win-rate", label: "Win Rate", icon: Zap, prompt: "What's our win rate trend and how can we improve it?" },
    { id: "proposal", label: "Draft Proposal", icon: FileText, prompt: "Help me draft a proposal for this deal" },
  ],
};

const contextualGreetings: Record<string, string> = {
  default: "How can I help you today?",
  productions: "I can help with production planning, budgets, crew, and timelines.",
  finance: "I can analyze budgets, invoices, cash flow, and financial forecasts.",
  business: "I can help with pipeline analysis, deal strategy, and proposals.",
  people: "I can help with scheduling, availability, and team management.",
  assets: "I can help with inventory tracking, maintenance, and utilization.",
  operations: "I can help with logistics, travel, and operational planning.",
};

function generateStreamingResponse(prompt: string, context: CopilotContext): string {
  const entityInfo = context.entityName
    ? ` for "${context.entityName}"`
    : context.module
      ? ` in the ${context.module} module`
      : "";

  const responses: Record<string, string> = {
    summarize: `Here's a summary of the current view${entityInfo}:\n\n• **Status**: All items are within normal parameters\n• **Key Metrics**: Performance is tracking at expected levels\n• **Attention Items**: 2 items may need review this week\n• **Recent Changes**: 3 updates in the last 24 hours\n\nWould you like me to dive deeper into any of these areas?`,
    insights: `Based on the current data${entityInfo}, here are my key insights:\n\n1. **Trend**: Activity has increased 15% compared to last period\n2. **Opportunity**: There are 3 items that could benefit from optimization\n3. **Risk**: One item is approaching its threshold — consider reviewing\n4. **Recommendation**: Prioritize the top 2 items for maximum impact\n\nShall I elaborate on any of these points?`,
    actions: `Here are my recommended next actions${entityInfo}:\n\n🔴 **High Priority**\n• Review and approve pending items\n• Follow up on overdue deliverables\n\n🟡 **Medium Priority**\n• Update status on in-progress items\n• Schedule check-in with stakeholders\n\n🟢 **Low Priority**\n• Archive completed items\n• Update documentation\n\nWant me to help with any of these?`,
    report: `# Status Report${entityInfo}\n\n**Period**: Current\n**Prepared by**: AI Copilot\n\n## Executive Summary\nOperations are proceeding as planned with minor adjustments needed in 2 areas.\n\n## Key Highlights\n- All critical milestones are on track\n- Budget utilization is within acceptable range\n- Team capacity is at healthy levels\n\n## Action Items\n1. Review flagged items by end of week\n2. Update stakeholders on progress\n\nWould you like me to refine any section?`,
  };

  const lowerPrompt = prompt.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerPrompt.includes(key)) return response;
  }

  return `I understand you're asking about: "${prompt}"${entityInfo}.\n\nBased on the current context, here's what I can tell you:\n\n• The data shows normal patterns with no immediate concerns\n• There are a few areas worth monitoring closely\n• I'd recommend reviewing the most recent updates first\n\nWould you like me to provide more specific analysis? You can also try one of the quick action buttons for targeted insights.`;
}

export function CopilotDrawer() {
  const { copilotOpen, setCopilotOpen, copilotContext } = useUIStore();
  const shouldReduce = useReducedMotion();
  const [messages, setMessages] = React.useState<CopilotMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const currentModule = copilotContext?.module || "default";
  const quickActions = moduleQuickActions[currentModule] || moduleQuickActions.default;
  const greeting = contextualGreetings[currentModule] || contextualGreetings.default;

  React.useEffect(() => {
    if (copilotOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [copilotOpen]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = React.useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isStreaming) return;

      const userMessage: CopilotMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: prompt.trim(),
        timestamp: new Date(),
      };

      const assistantId = `msg-${Date.now() + 1}`;
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsStreaming(true);

      const fullResponse = generateStreamingResponse(prompt, copilotContext || {});

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      let charIndex = 0;
      const streamInterval = setInterval(() => {
        charIndex += Math.floor(Math.random() * 3) + 2;
        if (charIndex >= fullResponse.length) {
          charIndex = fullResponse.length;
          clearInterval(streamInterval);
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullResponse, isStreaming: false }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullResponse.slice(0, charIndex) }
                : m
            )
          );
        }
      }, 20);
    },
    [isStreaming, copilotContext]
  );

  const handleCopy = React.useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleReset = React.useCallback(() => {
    setMessages([]);
    setInput("");
    setIsStreaming(false);
  }, []);

  return (
    <AnimatePresence>
      {copilotOpen && (
        <>
          <motion.div
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm"
            onClick={() => setCopilotOpen(false)}
          />

          <motion.div
            initial={shouldReduce ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[91] w-full max-w-md border-l border-border bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">AI Copilot</h2>
                  {copilotContext?.entityName && (
                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                      Context: {copilotContext.entityName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleReset}
                    aria-label="Reset conversation"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCopilotOpen(false)}
                  aria-label="Close copilot"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              <div className="py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="space-y-6 pt-4">
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{greeting}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action) => (
                          <Button
                            type="button"
                            variant="ghost"
                            key={action.id}
                            onClick={() => handleSend(action.prompt)}
                            className="h-auto flex items-center justify-start gap-2 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border transition-all text-left group"
                          >
                            <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            <span className="text-xs font-medium">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {copilotContext?.module && (
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {copilotContext.module}
                        </Badge>
                        {copilotContext.entityType && (
                          <Badge variant="outline" className="text-[10px]">
                            {copilotContext.entityType}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                          message.role === "assistant"
                            ? "bg-primary/10"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>

                      <div
                        className={cn(
                          "flex-1 min-w-0",
                          message.role === "user" && "text-right"
                        )}
                      >
                        <div
                          className={cn(
                            "inline-block rounded-xl px-3 py-2 text-sm max-w-full text-left",
                            message.role === "assistant"
                              ? "bg-muted/50"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                            {message.isStreaming && (
                              <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />
                            )}
                          </div>
                        </div>

                        {message.role === "assistant" &&
                          !message.isStreaming &&
                          message.content && (
                            <div className="flex items-center gap-1 mt-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleCopy(message.id, message.content)
                                }
                              >
                                {copiedId === message.id ? (
                                  <Check className="h-3 w-3 text-semantic-success" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                )}

                {isStreaming && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border/50 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  disabled={isStreaming}
                  className="flex-1 bg-muted/30 border-border/50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                  className="h-9 w-9 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[9px] text-muted-foreground/50 text-center mt-2">
                AI responses are generated locally for demo purposes
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Copilot Trigger Button (FAB) ────────────────────────── */

export function CopilotTrigger({ className }: { className?: string }) {
  const { copilotOpen, setCopilotOpen } = useUIStore();
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      onClick={() => setCopilotOpen(!copilotOpen)}
      className={cn(
        "fixed bottom-6 right-6 z-[80] h-12 w-12 rounded-2xl",
        "bg-primary text-primary-foreground shadow-lg",
        "flex items-center justify-center",
        "hover:shadow-xl hover:shadow-primary/20 transition-shadow",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      whileHover={shouldReduce ? undefined : { scale: 1.1 }}
      whileTap={shouldReduce ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={copilotOpen ? "Close AI Copilot" : "Open AI Copilot"}
    >
      <AnimatePresence mode="wait">
        {copilotOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
