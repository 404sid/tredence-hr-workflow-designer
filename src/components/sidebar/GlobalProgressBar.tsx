import { useWorkflowStore } from '../../store/useWorkflowStore';
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react';

export const GlobalProgressBar = () => {
  const globalProgress = useWorkflowStore(state => state.globalProgress);
  const { totalTasks, completedSuccessfully, failed, isSimulating } = globalProgress;

  if (totalTasks === 0 && !isSimulating) return null;

  const successPercent = totalTasks > 0 ? (completedSuccessfully / totalTasks) * 100 : 0;
  const errorPercent   = totalTasks > 0 ? (failed / totalTasks) * 100 : 0;

  return (
    <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
          <ClipboardList size={13} /> {totalTasks} Tasks
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
            <CheckCircle2 size={11} /> {completedSuccessfully}
          </div>
          <div className="flex items-center gap-1 text-red-400 text-xs font-semibold">
            <XCircle size={11} /> {failed}
          </div>
        </div>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${successPercent}%` }}
        />
        <div
          className="h-full bg-red-500 transition-all duration-300 ease-out"
          style={{ width: `${errorPercent}%` }}
        />
      </div>
    </div>
  );
};
