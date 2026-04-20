import { useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { AlertCircle, AlertTriangle, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

export const ValidationPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const validationErrors = useWorkflowStore(state => state.validationErrors);

  const errorCount   = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const isClean      = errorCount === 0 && warningCount === 0;

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[560px] max-w-[92vw]
                 bg-zinc-900/85 backdrop-blur-md border border-zinc-700/60 rounded-2xl
                 shadow-2xl shadow-black/60 overflow-hidden flex flex-col
                 transition-all duration-300 ease-in-out"
      style={{ maxHeight: isExpanded ? '300px' : '44px' }}
    >
      {/* Header / pill trigger */}
      <div
        className="h-11 shrink-0 px-4 flex items-center justify-between cursor-pointer
                   hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-xs text-zinc-500 uppercase tracking-widest">
            Workflow Linter
          </span>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {isClean ? (
              <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> All Clear
              </span>
            ) : (
              <>
                {errorCount   > 0 && (
                  <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                    <AlertCircle size={12} /> {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={12} /> {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Expanded content */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
        {validationErrors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-zinc-500 text-sm">
            <CheckCircle2 size={28} className="text-green-500/60" />
            No structural issues detected. Your workflow is valid!
          </div>
        ) : (
          validationErrors.map((err) => (
            <div
              key={err.id}
              className={`flex gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors
                          ${err.type === 'error'
                            ? 'border-l-[3px] border-l-red-500/70'
                            : 'border-l-[3px] border-l-amber-500/70'}`}
            >
              {err.type === 'error'
                ? <AlertCircle   size={16} className="text-red-400   shrink-0 mt-0.5" />
                : <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              }
              <div>
                <h4 className={`text-sm font-semibold mb-0.5
                                ${err.type === 'error' ? 'text-red-300' : 'text-amber-300'}`}>
                  {err.message}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="font-medium text-zinc-400">Suggestion:</span> {err.suggestion}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
