import type { WorkflowNode, WorkflowEdge, SimulationStep } from '../types/workflow';

// Helper to find starting nodes (nodes with no incoming edges)
const findStartNodes = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const targetIds = new Set(edges.map(e => e.target));
  return nodes.filter(n => !targetIds.has(n.id) && n.type === 'startNode');
};

export const calculateTotalTasks = (nodes: WorkflowNode[]) => {
  let total = 0;
  for (const node of nodes) {
    if (node.type === 'taskNode') total += 10;
    else if (node.type === 'approvalNode') total += 5;
    else if (node.type === 'autoNode') total += 20;
    else if (node.type === 'aiNode') total += 8;
  }
  return total;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function* simulateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): AsyncGenerator<SimulationStep, void, unknown> {
  let stepCounter = 0;
  const createStep = (
    message: string, 
    nodeId?: string, 
    action?: 'start' | 'running' | 'complete' | 'traverse' | 'process',
    edgeId?: string,
    metrics?: { success: number; error: number; pending: number },
    incrementGlobal?: 'success' | 'error'
  ): SimulationStep => ({
    id: `step-${Date.now()}-${stepCounter++}`,
    message,
    timestamp: Date.now(),
    nodeId,
    edgeId,
    action,
    metrics,
    incrementGlobal
  });

  async function* processTelemetry(nodeId: string, nodeTitle: string, total: number = 10) {
    let pending = total;
    let success = 0;
    let error = 0;
    
    yield createStep(`Initializing batch for ${nodeTitle} (${total} items)`, nodeId, 'process', undefined, { pending, success, error });
    await delay(300);

    while (pending > 0) {
      await delay(200 + Math.random() * 200); // 200-400ms
      pending -= 1;
      let status: 'success' | 'error' = 'success';
      if (Math.random() < 0.9) {
        success += 1;
        status = 'success';
      } else {
        error += 1;
        status = 'error';
      }
      yield createStep(`Processing batch... ${success + error}/${total} complete`, nodeId, 'process', undefined, { pending, success, error }, status);
    }
  }

  yield createStep('Initializing workflow simulation engine...');
  await delay(800);

  const startNodes = findStartNodes(nodes, edges);
  if (startNodes.length === 0) {
    yield createStep('Error: No Start Node found. Workflow cannot begin.');
    return;
  }

  // Build Adjacency List for simulation
  const adjacencyList = new Map<string, { target: string; edgeId: string }[]>();
  nodes.forEach(n => adjacencyList.set(n.id, []));
  edges.forEach(e => {
    adjacencyList.get(e.source)?.push({ target: e.target, edgeId: e.id });
  });

  const queue: { id: string; incomingEdgeId?: string }[] = [...startNodes.map(n => ({ id: n.id }))];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id: currentId, incomingEdgeId } = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (incomingEdgeId) {
      yield createStep(`Traversing connection...`, undefined, 'traverse', incomingEdgeId);
      await delay(400);
    }

    const node = nodes.find(n => n.id === currentId);
    if (!node) continue;

    // Simulate Node Execution based on Type
    yield createStep(`Executing [${node.data.title}] (${node.data.type})`, currentId, 'start');
    await delay(600);

    switch (node.type) {
      case 'startNode':
        yield createStep(`Started workflow with ${node.data.metadata?.length || 0} metadata fields.`);
        break;
      case 'taskNode':
        yield createStep(`Task assigned to: ${node.data.assignee || 'Unassigned'}`);
        yield* processTelemetry(currentId, node.data.title || 'Task', 10);
        yield createStep(`Task completed.`);
        break;
      case 'approvalNode':
        yield createStep(`Pending approval from: ${node.data.approverRole || 'Manager'}`);
        yield* processTelemetry(currentId, node.data.title || 'Approval', 5);
        yield createStep(`Approved successfully.`);
        break;
      case 'autoNode':
        yield createStep(`Triggering automated action: ${node.data.mockApiAction || 'Send Email'}`);
        yield* processTelemetry(currentId, node.data.title || 'Automated Step', 20);
        yield createStep(`Action completed via Mock API.`);
        break;
      case 'aiNode':
        yield createStep(`Invoking AI Agent with prompt...`);
        yield* processTelemetry(currentId, node.data.title || 'AI Agent', 8);
        yield createStep(`AI Agent returned processed data context.`);
        break;
      case 'endNode':
        yield createStep(`Workflow reached terminal state: ${node.data.endMessage || 'Completed'}`);
        break;
    }

    yield createStep(`Node [${node.data.title}] completed.`, currentId, 'complete');
    await delay(300);

    // Enqueue neighbors
    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.target)) {
        queue.push({ id: neighbor.target, incomingEdgeId: neighbor.edgeId });
      }
    }
  }

  yield createStep('Simulation finished successfully.');
}
