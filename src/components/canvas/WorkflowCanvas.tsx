import React, { useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionMode,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { 
  StartNode, 
  TaskNode, 
  ApprovalNode, 
  AutoNode, 
  AINode, 
  EndNode 
} from './CustomNodes';
import { CustomEdge } from './CustomEdge';
import { ValidationPanel } from './ValidationPanel';
import { AutoFitTrigger } from './AutoFitTrigger';

const nodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  autoNode: AutoNode,
  aiNode: AINode,
  endNode: EndNode,
};

const edgeTypes = {
  smoothstep: CustomEdge,
};

export const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const addNode = useWorkflowStore((state) => state.addNode);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate drop position accurately using React Flow's screenToFlowPosition
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNode: any = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { title: `New ${type.replace('Node', '')}`, type },
      };

      addNode(newNode);
    },
    [addNode, reactFlowInstance]
  );

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={50}
        className="bg-canvas"
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls style={{ marginBottom: '64px' }} />
        <AutoFitTrigger />
      </ReactFlow>
      <ValidationPanel />
    </div>
  );
};
