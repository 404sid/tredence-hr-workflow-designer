import { create } from 'zustand';
import type {
  Connection,
  EdgeChange,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData, SimulationStep, ValidationError, NodeTelemetry } from '../types/workflow';
import { validateWorkflow } from '../lib/validators';
import { templates } from '../lib/templates';
import type { WorkflowTemplate } from '../lib/templates';
import { getLayoutedElements } from '../lib/layout/autoLayout';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  simulationSteps: SimulationStep[];
  isSimulating: boolean;
  validationErrors: ValidationError[];
  nodeMetrics: Record<string, NodeTelemetry>;
  globalProgress: { totalTasks: number; completedSuccessfully: number; failed: number; isSimulating: boolean };
  fitViewTrigger: number; // incremented to signal the canvas to call fitView
  
  activeNodeId: string | null;
  activeEdgeId: string | null;
  completedNodeIds: string[];
  
  past: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }[];
  future: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }[];
  
  customTemplates: WorkflowTemplate[];
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: WorkflowNode) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  validate: () => boolean;
  setSimulationSteps: (steps: SimulationStep[] | ((prev: SimulationStep[]) => SimulationStep[])) => void;
  setIsSimulating: (isSimulating: boolean) => void;
  clearSimulation: () => void;
  setActiveNodeId: (id: string | null) => void;
  setActiveEdgeId: (id: string | null) => void;
  setCompletedNodeIds: (ids: string[]) => void;
  loadTemplate: (templateId: string) => void;
  clearCanvas: () => void;
  saveCustomTemplate: (name: string) => void;
  initCustomTemplates: () => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  importWorkflow: (data: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
  updateNodeMetrics: (nodeId: string, metrics: Partial<NodeTelemetry>) => void;
  resetMetrics: () => void;
  initializeSimulationProgress: (totalTasks: number) => void;
  incrementGlobalProgress: (status: 'success' | 'error') => void;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  applyAutoLayout: () => void;
  bumpFitView: () => void;
}

const initialNodes: WorkflowNode[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 250, y: 100 },
    data: { title: 'Employee Onboarding', type: 'startNode', metadata: [] },
  },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  selectedNodeId: null,
  simulationSteps: [],
  isSimulating: false,
  validationErrors: [],
  nodeMetrics: {},
  globalProgress: { totalTasks: 0, completedSuccessfully: 0, failed: 0, isSimulating: false },
  fitViewTrigger: 0,
  activeNodeId: null,
  activeEdgeId: null,
  completedNodeIds: [],
  past: [],
  future: [],
  customTemplates: [],

  onNodesChange: (changes: NodeChange[]) => {
    const isSignificant = changes.some(c => (c.type === 'position' && !c.dragging) || c.type === 'remove' || c.type === 'add');
    if (isSignificant) get().saveHistory();
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    const isSignificant = changes.some(c => c.type === 'remove' || c.type === 'add');
    if (isSignificant) get().saveHistory();
    set({
      edges: applyEdgeChanges(changes, get().edges) as WorkflowEdge[],
    });
  },
  onConnect: (connection: Connection) => {
    get().saveHistory();
    set({
      edges: addEdge({ ...connection, animated: true, type: 'smoothstep' }, get().edges) as WorkflowEdge[],
    });
    // Clear validation error on new connection
    get().validate();
  },
  addNode: (node: WorkflowNode) => {
    get().saveHistory();
    set({ nodes: [...get().nodes, node] });
  },
  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => {
    get().saveHistory();
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  validate: () => {
    const { nodes, edges } = get();
    const result = validateWorkflow(nodes, edges);
    
    set({
      validationErrors: result.errors,
      edges: edges.map(edge => ({
        ...edge,
        animated: result.cycleEdges.includes(edge.id) ? true : edge.animated,
        style: result.cycleEdges.includes(edge.id) ? { stroke: 'red', strokeWidth: 2 } : { stroke: '#94a3b8' }
      }))
    });
    
    return result.isValid;
  },
  setSimulationSteps: (steps) => {
    set((state) => ({
      simulationSteps: typeof steps === 'function' ? steps(state.simulationSteps) : steps
    }));
  },
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  clearSimulation: () => set({ 
    simulationSteps: [],
    activeNodeId: null,
    activeEdgeId: null,
    completedNodeIds: [],
    nodeMetrics: {},
    globalProgress: { totalTasks: 0, completedSuccessfully: 0, failed: 0, isSimulating: false },
    edges: get().edges.map(e => ({ ...e, style: { stroke: '#94a3b8', strokeWidth: 1 } }))
  }),
  loadTemplate: (templateId: string) => {
    let template = templates.find(t => t.id === templateId);
    if (!template) {
      // Check custom templates
      template = get().customTemplates.find(t => t.id === templateId);
    }
    
    if (template) {
      get().saveHistory();
      const layouted = getLayoutedElements(template.nodes, template.edges);
      set({
        nodes: layouted.nodes,
        edges: layouted.edges,
        selectedNodeId: null,
        simulationSteps: [],
        isSimulating: false,
        validationErrors: [],
        nodeMetrics: {},
        globalProgress: { totalTasks: 0, completedSuccessfully: 0, failed: 0, isSimulating: false },
        activeNodeId: null,
        activeEdgeId: null,
        completedNodeIds: [],
      });
      // Signal AutoFitTrigger to call fitView
      set(state => ({ fitViewTrigger: state.fitViewTrigger + 1 }));
    }
  },
  setActiveNodeId: (id) => set({ activeNodeId: id }),
  setActiveEdgeId: (id) => {
    set((state) => ({
      activeEdgeId: id,
      edges: state.edges.map(e => 
        e.id === id 
          ? { ...e, style: { stroke: '#10b981', strokeWidth: 2 } } 
          : e
      )
    }));
  },
  setCompletedNodeIds: (ids) => set({ completedNodeIds: ids }),
  clearCanvas: () => {
    get().saveHistory();
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      simulationSteps: [],
      isSimulating: false,
      validationErrors: [],
      nodeMetrics: {},
      globalProgress: { totalTasks: 0, completedSuccessfully: 0, failed: 0, isSimulating: false },
      activeNodeId: null,
      activeEdgeId: null,
      completedNodeIds: [],
    });
  },
  saveCustomTemplate: (name: string) => {
    const state = get();
    const newTemplate: WorkflowTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description: 'Custom user-saved template.',
      nodes: state.nodes,
      edges: state.edges
    };
    const updatedTemplates = [...state.customTemplates, newTemplate];
    set({ customTemplates: updatedTemplates });
    localStorage.setItem('hr_custom_templates', JSON.stringify(updatedTemplates));
  },
  initCustomTemplates: () => {
    try {
      const saved = localStorage.getItem('hr_custom_templates');
      if (saved) {
        set({ customTemplates: JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load custom templates', e);
    }
  },
  deleteNode: (id: string) => {
    get().saveHistory();
    set((state) => {
      const edges = state.edges.filter(e => e.source !== id && e.target !== id);
      const nodes = state.nodes.filter(n => n.id !== id);
      return { 
        nodes, 
        edges, 
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId 
      };
    });
    get().validate();
  },
  deleteEdge: (id: string) => {
    get().saveHistory();
    set((state) => ({ edges: state.edges.filter(e => e.id !== id) }));
    get().validate();
  },
  importWorkflow: (data) => {
    get().saveHistory();
    const layouted = getLayoutedElements(data.nodes || [], data.edges || []);
    set({
      nodes: layouted.nodes,
      edges: layouted.edges,
      selectedNodeId: null,
      simulationSteps: [],
      isSimulating: false,
      validationErrors: [],
      nodeMetrics: {},
      globalProgress: { totalTasks: 0, completedSuccessfully: 0, failed: 0, isSimulating: false },
      activeNodeId: null,
      activeEdgeId: null,
      completedNodeIds: [],
    });
    get().validate();
    // Signal AutoFitTrigger to call fitView
    set(state => ({ fitViewTrigger: state.fitViewTrigger + 1 }));
  },
  saveHistory: () => {
    set((state) => {
      const past = [...state.past, { nodes: state.nodes, edges: state.edges }];
      if (past.length > 50) past.shift();
      return { past, future: [] };
    });
  },
  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future],
        nodes: previous.nodes,
        edges: previous.edges,
      };
    });
    get().validate();
  },
  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges,
      };
    });
    get().validate();
  },
  updateNodeMetrics: (nodeId, metrics) => set((state) => ({
    nodeMetrics: {
      ...state.nodeMetrics,
      [nodeId]: {
        ...state.nodeMetrics[nodeId] || { success: 0, error: 0, pending: 0 },
        ...metrics
      }
    }
  })),
  resetMetrics: () => set({ nodeMetrics: {} }),
  initializeSimulationProgress: (totalTasks) => set({
    globalProgress: { totalTasks, completedSuccessfully: 0, failed: 0, isSimulating: true }
  }),
  incrementGlobalProgress: (status) => set((state) => ({
    globalProgress: {
      ...state.globalProgress,
      completedSuccessfully: state.globalProgress.completedSuccessfully + (status === 'success' ? 1 : 0),
      failed: state.globalProgress.failed + (status === 'error' ? 1 : 0)
    }
  })),
  applyAutoLayout: () => {
    get().saveHistory();
    const { nodes, edges } = get();
    const layouted = getLayoutedElements(nodes, edges);
    set({ nodes: layouted.nodes, edges: layouted.edges });
    // Signal AutoFitTrigger to call fitView
    set(state => ({ fitViewTrigger: state.fitViewTrigger + 1 }));
  },
  bumpFitView: () => set(state => ({ fitViewTrigger: state.fitViewTrigger + 1 }))
}));
