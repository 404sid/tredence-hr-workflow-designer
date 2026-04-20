import type { WorkflowNode, WorkflowEdge, ValidationResult, ValidationError } from '../types/workflow';

/**
 * Validates the workflow DAG and configuration fields, acting like a linter for the workflow.
 */
export const validateWorkflow = (nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult => {
  const errors: ValidationError[] = [];
  let isValid = true;
  let errorIdCounter = 1;

  const addError = (type: 'error' | 'warning', message: string, suggestion: string, nodeId?: string) => {
    if (type === 'error') isValid = false;
    errors.push({ id: `err-${errorIdCounter++}`, type, message, suggestion, nodeId });
  };

  if (nodes.length === 0) {
    addError('error', 'Workflow is empty.', 'Drag and drop nodes from the palette to start building your workflow.');
    return { isValid, cycleEdges: [], errors };
  }

  // 1. Check Start and End Nodes
  const startNodes = nodes.filter(n => n.type === 'startNode');
  const endNodes = nodes.filter(n => n.type === 'endNode');

  if (startNodes.length === 0) {
    addError('error', 'Missing Start Node.', 'Every workflow must have exactly one Start Node to trigger execution.');
  } else if (startNodes.length > 1) {
    addError('error', 'Multiple Start Nodes detected.', 'A workflow should only have one entry point. Please remove the extra Start Nodes.');
  }

  if (endNodes.length === 0) {
    addError('warning', 'Missing End Node.', 'It is best practice to explicitly define when a workflow concludes using an End Node.');
  }

  // Build connection maps
  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  
  nodes.forEach(n => {
    incomingCount.set(n.id, 0);
    outgoingCount.set(n.id, 0);
  });

  edges.forEach(e => {
    incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1);
    outgoingCount.set(e.source, (outgoingCount.get(e.source) || 0) + 1);
  });

  // 2. Check connections and Node-specific missing fields
  nodes.forEach(node => {
    const incoming = incomingCount.get(node.id) || 0;
    const outgoing = outgoingCount.get(node.id) || 0;

    // Disconnected / Unreachable checks
    if (nodes.length > 1) {
      if (incoming === 0 && outgoing === 0) {
        addError('warning', `Isolated node: [${node.data.title}]`, `This node is entirely disconnected. Connect it to the workflow or remove it.`, node.id);
      } else if (incoming === 0 && node.type !== 'startNode') {
        addError('warning', `Unreachable node: [${node.data.title}]`, `No incoming connections found. This node will never be executed.`, node.id);
      } else if (outgoing === 0 && node.type !== 'endNode') {
        addError('warning', `Dead end at: [${node.data.title}]`, `Execution will halt here. Connect it to a subsequent step or an End Node.`, node.id);
      }
    }

    // Node data validation
    if (!node.data.title || node.data.title.trim() === '') {
      addError('warning', `Unnamed node detected.`, `Give this node a descriptive title in the Configuration panel.`, node.id);
    }

    if (node.type === 'taskNode' && (!node.data.assignee || node.data.assignee.trim() === '')) {
      addError('warning', `Task node missing assignee: [${node.data.title}]`, `Define who is responsible for this task in the Configuration panel.`, node.id);
    }

    if (node.type === 'aiNode' && (!node.data.systemPrompt || node.data.systemPrompt.trim() === '')) {
      addError('warning', `AI Agent missing prompt: [${node.data.title}]`, `An AI Agent requires a System Prompt to know what to do.`, node.id);
    }
  });

  // 3. Cycle Detection (DFS)
  const adjacencyList = new Map<string, { target: string; edgeId: string }[]>();
  nodes.forEach(node => adjacencyList.set(node.id, []));
  edges.forEach(edge => {
    if (adjacencyList.has(edge.source)) {
      adjacencyList.get(edge.source)!.push({ target: edge.target, edgeId: edge.id });
    }
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cycleEdges = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    recStack.add(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.target)) {
        if (dfs(neighbor.target)) {
          cycleEdges.add(neighbor.edgeId);
          return true;
        }
      } else if (recStack.has(neighbor.target)) {
        cycleEdges.add(neighbor.edgeId);
        return true;
      }
    }
    recStack.delete(nodeId);
    return false;
  };

  let cycleFound = false;
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        cycleFound = true;
      }
    }
  }

  if (cycleFound) {
    addError('error', 'Infinite loop detected.', 'Circular dependencies are not allowed. Please remove the edges highlighted in red.');
  }

  return {
    isValid,
    cycleEdges: Array.from(cycleEdges),
    errors
  };
};
