import React from 'react';
import { Play, CheckSquare, CheckCircle, Zap, Bot, Flag } from 'lucide-react';

const nodeTypes = [
  { type: 'startNode',    label: 'Start',          icon: Play,        bg: 'bg-green-500/15',  text: 'text-green-400'  },
  { type: 'taskNode',     label: 'Task',            icon: CheckSquare, bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  { type: 'approvalNode', label: 'Approval',        icon: CheckCircle, bg: 'bg-amber-500/15',  text: 'text-amber-400'  },
  { type: 'autoNode',     label: 'Automated Step',  icon: Zap,         bg: 'bg-purple-500/15', text: 'text-purple-400' },
  { type: 'aiNode',       label: 'AI Agent',        icon: Bot,         bg: 'bg-pink-500/15',   text: 'text-pink-400'   },
  { type: 'endNode',      label: 'End',             icon: Flag,        bg: 'bg-red-500/15',    text: 'text-red-400'    },
];

export const LeftSidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col z-10 shrink-0">
      <div className="px-5 py-4 border-b border-zinc-800/60">
        <h2 className="text-sm font-semibold text-zinc-100">Node Palette</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Drag onto canvas to add</p>
      </div>

      <div className="p-3 flex flex-col gap-1.5 overflow-y-auto">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-800/60
                       bg-zinc-900/60 hover:bg-zinc-800/70 hover:border-zinc-700 cursor-grab
                       transition-all duration-150 group"
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            <div className={`p-1.5 rounded-lg ${node.bg}`}>
              <node.icon size={14} className={node.text} />
            </div>
            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors">
              {node.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
