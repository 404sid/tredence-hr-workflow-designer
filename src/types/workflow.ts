import type { Node, Edge } from 'reactflow';
export type NodeType = 'startNode' | 'taskNode' | 'approvalNode' | 'autoNode' | 'aiNode' | 'endNode';

export interface WorkflowNodeData extends Record<string, unknown> {
  title: string;
  type: NodeType;
  // Start Node
  metadata?: { key: string; value: string }[];
  // Task Node
  description?: string;
  assignee?: string;
  dueDate?: string;
  // Approval Node
  approverRole?: 'Manager' | 'HRBP' | 'Director';
  autoApproveThreshold?: number;
  // Auto Node
  mockApiAction?: 'Send Email' | 'Generate Document';
  // AI Agent Node
  systemPrompt?: string;
  dataContext?: string;
  // End Node
  endMessage?: string;
  isSummary?: boolean;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  nodeId?: string;
  message: string;
  suggestion: string;
}

export interface ValidationResult {
  isValid: boolean;
  cycleEdges: string[];
  errors: ValidationError[];
}

export interface NodeTelemetry {
  success: number;
  error: number;
  pending: number;
}

export interface SimulationStep {
  id: string;
  message: string;
  timestamp: number;
  nodeId?: string;
  edgeId?: string;
  action?: 'start' | 'running' | 'complete' | 'traverse' | 'process';
  metrics?: Partial<NodeTelemetry>;
  incrementGlobal?: 'success' | 'error';
}
