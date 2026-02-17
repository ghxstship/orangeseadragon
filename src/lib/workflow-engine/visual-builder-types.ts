/**
 * Visual Workflow Builder Types
 * Canvas-based node/edge graph types for the drag-and-drop workflow designer.
 */

import type { StepType, WorkflowTrigger, StepConfig, RetryPolicy } from './types';

// ── Canvas Geometry ──────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

// ── Node Types ───────────────────────────────────────────────────────────

export type CanvasNodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'notification' | 'approval' | 'loop' | 'parallel' | 'http' | 'transform' | 'script' | 'end';

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  label: string;
  description?: string;
  position: Position;
  config: StepConfig;
  retryPolicy?: RetryPolicy;
  timeout?: number;
  isSelected?: boolean;
  isValid?: boolean;
  validationErrors?: string[];
}

export interface TriggerNode extends CanvasNode {
  type: 'trigger';
  triggerConfig: WorkflowTrigger;
}

export interface ConditionNode extends CanvasNode {
  type: 'condition';
  config: {
    expression: string;
    trueBranch?: string;
    falseBranch?: string;
  };
}

// ── Edge Types ───────────────────────────────────────────────────────────

export type EdgeType = 'default' | 'success' | 'failure' | 'true' | 'false';

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: EdgeType;
  label?: string;
  isAnimated?: boolean;
}

// ── Node Palette ─────────────────────────────────────────────────────────

export interface PaletteCategory {
  id: string;
  label: string;
  description: string;
  nodes: PaletteItem[];
}

export interface PaletteItem {
  type: CanvasNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: StepConfig;
}

// ── Builder State ────────────────────────────────────────────────────────

export interface VisualWorkflowState {
  id?: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  trigger: WorkflowTrigger;
  isActive: boolean;
  isDirty: boolean;
  zoom: number;
  pan: Position;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ── Serialization ────────────────────────────────────────────────────────

export interface SerializedVisualWorkflow {
  id?: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  is_active: boolean;
  organization_id?: string;
  created_by?: string;
  version?: number;
}

// ── Node Registry ────────────────────────────────────────────────────────

export const NODE_REGISTRY: Record<CanvasNodeType, { label: string; icon: string; color: string; category: string }> = {
  trigger: { label: 'Trigger', icon: 'Zap', color: 'bg-amber-500', category: 'flow' },
  action: { label: 'Action', icon: 'Play', color: 'bg-blue-500', category: 'actions' },
  condition: { label: 'Condition', icon: 'GitBranch', color: 'bg-purple-500', category: 'flow' },
  delay: { label: 'Delay', icon: 'Clock', color: 'bg-orange-500', category: 'flow' },
  notification: { label: 'Notification', icon: 'Bell', color: 'bg-green-500', category: 'actions' },
  approval: { label: 'Approval', icon: 'CheckCircle', color: 'bg-teal-500', category: 'actions' },
  loop: { label: 'Loop', icon: 'Repeat', color: 'bg-indigo-500', category: 'flow' },
  parallel: { label: 'Parallel', icon: 'GitMerge', color: 'bg-cyan-500', category: 'flow' },
  http: { label: 'HTTP Request', icon: 'Globe', color: 'bg-red-500', category: 'integrations' },
  transform: { label: 'Transform', icon: 'Shuffle', color: 'bg-pink-500', category: 'data' },
  script: { label: 'Script', icon: 'Code', color: 'bg-gray-500', category: 'advanced' },
  end: { label: 'End', icon: 'Square', color: 'bg-gray-400', category: 'flow' },
};

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    description: 'Start your workflow',
    nodes: [
      { type: 'trigger', label: 'Manual Trigger', description: 'Start manually', icon: 'Zap', color: 'bg-amber-500', defaultConfig: {} },
      { type: 'trigger', label: 'Schedule', description: 'Run on a schedule', icon: 'Calendar', color: 'bg-amber-500', defaultConfig: { cron: '0 9 * * *' } },
      { type: 'trigger', label: 'Event', description: 'Triggered by events', icon: 'Radio', color: 'bg-amber-500', defaultConfig: { eventType: '' } },
      { type: 'trigger', label: 'Webhook', description: 'External webhook', icon: 'Webhook', color: 'bg-amber-500', defaultConfig: { path: '', method: 'POST' } },
    ],
  },
  {
    id: 'flow',
    label: 'Flow Control',
    description: 'Control execution flow',
    nodes: [
      { type: 'condition', label: 'If/Else', description: 'Branch on condition', icon: 'GitBranch', color: 'bg-purple-500', defaultConfig: { expression: '' } },
      { type: 'delay', label: 'Wait', description: 'Pause execution', icon: 'Clock', color: 'bg-orange-500', defaultConfig: { duration: 1, unit: 'hours' } },
      { type: 'loop', label: 'Loop', description: 'Iterate over items', icon: 'Repeat', color: 'bg-indigo-500', defaultConfig: { collection: '', itemVariable: 'item' } },
      { type: 'parallel', label: 'Parallel', description: 'Run branches in parallel', icon: 'GitMerge', color: 'bg-cyan-500', defaultConfig: { waitForAll: true } },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    description: 'Perform operations',
    nodes: [
      { type: 'action', label: 'Create Record', description: 'Create a new entity', icon: 'Plus', color: 'bg-blue-500', defaultConfig: { actionType: 'createEntity', parameters: {} } },
      { type: 'action', label: 'Update Record', description: 'Update an entity', icon: 'Edit', color: 'bg-blue-500', defaultConfig: { actionType: 'updateEntity', parameters: {} } },
      { type: 'action', label: 'Query Data', description: 'Query database', icon: 'Search', color: 'bg-blue-500', defaultConfig: { actionType: 'query', parameters: {} } },
      { type: 'notification', label: 'Send Email', description: 'Send email notification', icon: 'Mail', color: 'bg-green-500', defaultConfig: { channel: 'email', recipients: [], template: '' } },
      { type: 'notification', label: 'Send Push', description: 'Push notification', icon: 'Bell', color: 'bg-green-500', defaultConfig: { channel: 'push', recipients: [], template: '' } },
      { type: 'notification', label: 'Send SMS', description: 'SMS notification', icon: 'MessageSquare', color: 'bg-green-500', defaultConfig: { channel: 'sms', recipients: [], template: '' } },
      { type: 'approval', label: 'Request Approval', description: 'Require approval', icon: 'CheckCircle', color: 'bg-teal-500', defaultConfig: { approvers: [], requiredApprovals: 1 } },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Connect external services',
    nodes: [
      { type: 'http', label: 'HTTP Request', description: 'Call external API', icon: 'Globe', color: 'bg-red-500', defaultConfig: { url: '', method: 'POST' } },
      { type: 'action', label: 'Call Webhook', description: 'Trigger a webhook', icon: 'Webhook', color: 'bg-red-400', defaultConfig: { actionType: 'webhook', parameters: { url: '' } } },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Advanced operations',
    nodes: [
      { type: 'transform', label: 'Transform Data', description: 'Map/filter data', icon: 'Shuffle', color: 'bg-pink-500', defaultConfig: { input: '', output: '', transformation: '' } },
      { type: 'script', label: 'Run Script', description: 'Execute custom code', icon: 'Code', color: 'bg-gray-500', defaultConfig: { language: 'javascript', code: '' } },
    ],
  },
];

// ── Conversion helpers ───────────────────────────────────────────────────

export function canvasNodeToStep(node: CanvasNode): { id: string; name: string; type: StepType; config: StepConfig; retryPolicy?: RetryPolicy; timeout?: number } {
  const stepType: StepType = node.type === 'trigger' || node.type === 'end' ? 'action' : node.type as StepType;
  return {
    id: node.id,
    name: node.label,
    type: stepType,
    config: node.config,
    retryPolicy: node.retryPolicy,
    timeout: node.timeout,
  };
}

export function edgesToStepConnections(edges: CanvasEdge[]): Map<string, { onSuccess: string[]; onFailure: string[] }> {
  const connections = new Map<string, { onSuccess: string[]; onFailure: string[] }>();

  for (const edge of edges) {
    const existing = connections.get(edge.source) || { onSuccess: [], onFailure: [] };
    if (edge.type === 'failure' || edge.type === 'false') {
      existing.onFailure.push(edge.target);
    } else {
      existing.onSuccess.push(edge.target);
    }
    connections.set(edge.source, existing);
  }

  return connections;
}
