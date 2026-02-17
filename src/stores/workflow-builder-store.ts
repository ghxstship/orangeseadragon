/**
 * Visual Workflow Builder Store
 * Zustand store managing canvas state, node/edge CRUD, selection, and serialization.
 */

import { create } from 'zustand';
import type {
  CanvasNode,
  CanvasEdge,
  Position,
  CanvasNodeType,
  ValidationError,
  SerializedVisualWorkflow,
} from '@/lib/workflow-engine/visual-builder-types';
import { canvasNodeToStep, edgesToStepConnections } from '@/lib/workflow-engine/visual-builder-types';
import type { WorkflowTrigger, WorkflowStep } from '@/lib/workflow-engine/types';

interface WorkflowBuilderState {
  // Workflow metadata
  workflowId: string | null;
  name: string;
  description: string;
  isActive: boolean;
  isDirty: boolean;

  // Canvas state
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  trigger: WorkflowTrigger;
  zoom: number;
  pan: Position;

  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Validation
  validationErrors: ValidationError[];

  // Saving
  isSaving: boolean;

  // ── Actions ──────────────────────────────────────────────────

  // Metadata
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setIsActive: (active: boolean) => void;
  setTrigger: (trigger: WorkflowTrigger) => void;

  // Node CRUD
  addNode: (type: CanvasNodeType, position: Position, config?: Record<string, unknown>) => string;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, position: Position) => void;

  // Edge CRUD
  addEdge: (edge: Omit<CanvasEdge, 'id'>) => string;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, updates: Partial<CanvasEdge>) => void;

  // Selection
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  clearSelection: () => void;

  // Canvas
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;

  // Validation
  validate: () => ValidationError[];

  // Serialization
  toWorkflowSteps: () => WorkflowStep[];
  toSerializedWorkflow: () => SerializedVisualWorkflow;
  loadFromSerialized: (data: SerializedVisualWorkflow) => void;
  reset: () => void;

  // Saving
  setIsSaving: (saving: boolean) => void;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

const NODE_LABELS: Record<CanvasNodeType, string> = {
  trigger: 'Trigger',
  action: 'Action',
  condition: 'Condition',
  delay: 'Wait',
  notification: 'Notification',
  approval: 'Approval',
  loop: 'Loop',
  parallel: 'Parallel',
  http: 'HTTP Request',
  transform: 'Transform',
  script: 'Script',
  end: 'End',
};

export const useWorkflowBuilderStore = create<WorkflowBuilderState>((set, get) => ({
  // Initial state
  workflowId: null,
  name: '',
  description: '',
  isActive: false,
  isDirty: false,
  nodes: [],
  edges: [],
  trigger: { type: 'manual', config: {} },
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodeId: null,
  selectedEdgeId: null,
  validationErrors: [],
  isSaving: false,

  // ── Metadata ─────────────────────────────────────────────────

  setName: (name) => set({ name, isDirty: true }),
  setDescription: (description) => set({ description, isDirty: true }),
  setIsActive: (isActive) => set({ isActive, isDirty: true }),
  setTrigger: (trigger) => set({ trigger, isDirty: true }),

  // ── Node CRUD ────────────────────────────────────────────────

  addNode: (type, position, config = {}) => {
    const id = generateId('node');
    const label = NODE_LABELS[type] || type;
    const count = get().nodes.filter((n) => n.type === type).length;
    const node: CanvasNode = {
      id,
      type,
      label: count > 0 ? `${label} ${count + 1}` : label,
      position,
      config,
      isValid: true,
    };
    set((state) => ({
      nodes: [...state.nodes, node],
      isDirty: true,
      selectedNodeId: id,
      selectedEdgeId: null,
    }));
    return id;
  },

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      isDirty: true,
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isDirty: true,
    })),

  moveNode: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
    })),

  // ── Edge CRUD ────────────────────────────────────────────────

  addEdge: (edge) => {
    const id = generateId('edge');
    const existing = get().edges.find(
      (e) => e.source === edge.source && e.target === edge.target
    );
    if (existing) return existing.id;

    set((state) => ({
      edges: [...state.edges, { ...edge, id }],
      isDirty: true,
    }));
    return id;
  },

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
      isDirty: true,
    })),

  updateEdge: (id, updates) =>
    set((state) => ({
      edges: state.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      isDirty: true,
    })),

  // ── Selection ────────────────────────────────────────────────

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

  // ── Canvas ───────────────────────────────────────────────────

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  setPan: (pan) => set({ pan }),

  // ── Validation ───────────────────────────────────────────────

  validate: () => {
    const { nodes, edges } = get();
    const errors: ValidationError[] = [];

    // Must have at least one non-trigger node
    const actionNodes = nodes.filter((n) => n.type !== 'trigger');
    if (actionNodes.length === 0) {
      errors.push({ message: 'Workflow must have at least one step', severity: 'error' });
    }

    // Check for disconnected nodes
    const connectedNodes = new Set<string>();
    for (const edge of edges) {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }
    for (const node of nodes) {
      if (!connectedNodes.has(node.id) && nodes.length > 1) {
        errors.push({
          nodeId: node.id,
          message: `"${node.label}" is not connected to any other step`,
          severity: 'warning',
        });
      }
    }

    // Condition nodes must have at least one branch
    for (const node of nodes) {
      if (node.type === 'condition') {
        const outEdges = edges.filter((e) => e.source === node.id);
        if (outEdges.length === 0) {
          errors.push({
            nodeId: node.id,
            message: `Condition "${node.label}" has no outgoing branches`,
            severity: 'error',
          });
        }
      }
    }

    set({ validationErrors: errors });
    return errors;
  },

  // ── Serialization ────────────────────────────────────────────

  toWorkflowSteps: () => {
    const { nodes, edges } = get();
    const connections = edgesToStepConnections(edges);

    return nodes
      .filter((n) => n.type !== 'trigger' && n.type !== 'end')
      .map((node) => {
        const step = canvasNodeToStep(node);
        const conn = connections.get(node.id);
        return {
          ...step,
          onSuccess: conn?.onSuccess,
          onFailure: conn?.onFailure,
        };
      });
  },

  toSerializedWorkflow: () => {
    const { workflowId, name, description, trigger, nodes, edges, isActive } = get();
    return {
      id: workflowId ?? undefined,
      name,
      description,
      trigger,
      nodes,
      edges,
      is_active: isActive,
    };
  },

  loadFromSerialized: (data) =>
    set({
      workflowId: data.id ?? null,
      name: data.name,
      description: data.description,
      trigger: data.trigger,
      nodes: data.nodes,
      edges: data.edges,
      isActive: data.is_active,
      isDirty: false,
      selectedNodeId: null,
      selectedEdgeId: null,
      validationErrors: [],
    }),

  reset: () =>
    set({
      workflowId: null,
      name: '',
      description: '',
      isActive: false,
      isDirty: false,
      nodes: [],
      edges: [],
      trigger: { type: 'manual', config: {} },
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedNodeId: null,
      selectedEdgeId: null,
      validationErrors: [],
      isSaving: false,
    }),

  setIsSaving: (isSaving) => set({ isSaving }),
}));
