
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from 'reactflow';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const deleteEdge = useWorkflowStore(state => state.deleteEdge);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 hover:opacity-100 hover:scale-100'}`}
        >
          <button
            className="p-1 rounded-full bg-slate-800 border border-slate-600 text-red-400 hover:bg-red-500 hover:text-white shadow-lg transition-all"
            onClick={(event) => {
              event.stopPropagation();
              deleteEdge(id);
            }}
            title="Delete Connection"
          >
            <X size={14} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
