import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { WorkflowNodeData } from '../../types/workflow';
import {
  Play, CheckSquare, CheckCircle, Zap, Bot, Flag, Check,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../../store/useWorkflowStore';

// ─── Per-type dark-mode colour config ────────────────────────────────────────
type NodeColor = {
  iconBg: string;
  iconText: string;
  ring: string;
};

const typeColors: Record<string, NodeColor> = {
  startNode:    { iconBg: 'bg-green-500/15',  iconText: 'text-green-400',  ring: 'ring-green-500/50'  },
  taskNode:     { iconBg: 'bg-blue-500/15',   iconText: 'text-blue-400',   ring: 'ring-blue-500/50'   },
  approvalNode: { iconBg: 'bg-amber-500/15',  iconText: 'text-amber-400',  ring: 'ring-amber-500/50'  },
  autoNode:     { iconBg: 'bg-purple-500/15', iconText: 'text-purple-400', ring: 'ring-purple-500/50' },
  aiNode:       { iconBg: 'bg-pink-500/15',   iconText: 'text-pink-400',   ring: 'ring-pink-500/50'   },
  endNode:      { iconBg: 'bg-red-500/15',    iconText: 'text-red-400',    ring: 'ring-red-500/50'    },
};

// ─── Shared NodeWrapper ───────────────────────────────────────────────────────
const NodeWrapper = ({
  id, selected, title, icon: Icon, nodeType, children, isEnd = false, isStart = false,
}: {
  id: string;
  selected: boolean;
  title: string;
  icon: any;
  nodeType: string;
  children?: React.ReactNode;
  isEnd?: boolean;
  isStart?: boolean;
}) => {
  const isActive    = useWorkflowStore(state => state.activeNodeId === id);
  const isCompleted = useWorkflowStore(state => state.completedNodeIds.includes(id));
  const metrics     = useWorkflowStore(state => state.nodeMetrics[id]);

  const colors = typeColors[nodeType] ?? typeColors.taskNode;

  return (
    <div
      className={clsx(
        'node-base flex-col !items-stretch',
        selected   && 'selected',
        isActive   && `ring-2 ring-offset-1 ring-offset-zinc-950 ${colors.ring} !border-zinc-500 z-50`,
        isCompleted && 'opacity-60 ring-1 ring-green-500/30 ring-offset-1 ring-offset-zinc-950',
      )}
    >
      {!isStart && <Handle type="target" position={Position.Top} />}

      {/* Header row: icon badge + title */}
      <div className="flex items-center gap-2.5">
        <div className={clsx('p-2 rounded-xl flex-shrink-0', colors.iconBg, isActive && 'animate-pulse')}>
          <Icon size={15} className={colors.iconText} />
        </div>
        <span className={clsx('text-sm font-semibold', colors.iconText)}>{title}</span>
      </div>

      {/* Telemetry footer — always reserves space; fades in when metrics exist */}
      <div
        className={clsx(
          'w-full mt-2 pt-2 border-t flex items-center justify-between gap-1 transition-all duration-300',
          metrics ? 'opacity-100 border-zinc-700/50' : 'opacity-0 border-transparent pointer-events-none',
        )}
      >
        <div
          key={`s-${metrics?.success ?? 0}`}
          className="flex items-center gap-1 bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-semibold animate-pop"
        >
          <CheckCircle2 size={10} /> {metrics?.success ?? 0}
        </div>
        <div
          key={`e-${metrics?.error ?? 0}`}
          className="flex items-center gap-1 bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-semibold animate-pop"
        >
          <XCircle size={10} /> {metrics?.error ?? 0}
        </div>
        <div
          key={`p-${metrics?.pending ?? 0}`}
          className="flex items-center gap-1 bg-zinc-700/50 text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-semibold animate-pop"
        >
          <Clock size={10} /> {metrics?.pending ?? 0}
        </div>
      </div>

      {/* Completion badge */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-0.5 shadow ring-2 ring-zinc-950">
          <Check size={12} className="text-white" />
        </div>
      )}

      {children}

      {!isEnd && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
};

// ─── Exported node components ─────────────────────────────────────────────────
export const StartNode    = memo(({ id, data, selected }: NodeProps<WorkflowNodeData>) => (
  <NodeWrapper id={id} selected={selected} title={data.title || 'Start'}          icon={Play}        nodeType="startNode"    isStart />
));
export const TaskNode     = memo(({ id, data, selected }: NodeProps<WorkflowNodeData>) => (
  <NodeWrapper id={id} selected={selected} title={data.title || 'Task'}           icon={CheckSquare} nodeType="taskNode"     />
));
export const ApprovalNode = memo(({ id, data, selected }: NodeProps<WorkflowNodeData>) => (
  <NodeWrapper id={id} selected={selected} title={data.title || 'Approval'}       icon={CheckCircle} nodeType="approvalNode" />
));
export const AutoNode     = memo(({ id, data, selected }: NodeProps<WorkflowNodeData>) => (
  <NodeWrapper id={id} selected={selected} title={data.title || 'Automated Step'} icon={Zap}         nodeType="autoNode"     />
));
export const AINode       = memo(({ id, data, selected }: NodeProps<WorkflowNodeData>) => (
  <NodeWrapper id={id} selected={selected} title={data.title || 'AI Agent'}       icon={Bot}         nodeType="aiNode"       />
));
export const EndNode      = memo(({ id, data, selected }: NodeProps<WorkflowNodeData>) => (
  <NodeWrapper id={id} selected={selected} title={data.title || 'End'}            icon={Flag}        nodeType="endNode"      isEnd />
));
