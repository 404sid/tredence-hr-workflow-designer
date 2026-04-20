import { useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Play, Terminal, Settings2, Trash2 } from 'lucide-react';
import { simulateWorkflow, calculateTotalTasks } from '../../mockApi/simulator';
import { GlobalProgressBar } from './GlobalProgressBar';

export const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'sandbox'>('config');
  
  const nodes = useWorkflowStore(state => state.nodes);
  const edges = useWorkflowStore(state => state.edges);
  const selectedNodeId = useWorkflowStore(state => state.selectedNodeId);
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const deleteNode = useWorkflowStore(state => state.deleteNode);
  const validate = useWorkflowStore(state => state.validate);
  const setSimulationSteps = useWorkflowStore(state => state.setSimulationSteps);
  const simulationSteps = useWorkflowStore(state => state.simulationSteps);
  const isSimulating = useWorkflowStore(state => state.isSimulating);
  const setIsSimulating = useWorkflowStore(state => state.setIsSimulating);
  const clearSimulation = useWorkflowStore(state => state.clearSimulation);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleSimulate = async () => {
    const isValid = validate();
    // Allow warnings to simulate, but block on errors
    const hasErrors = useWorkflowStore.getState().validationErrors.some(e => e.type === 'error');
    if (hasErrors || !isValid) return;

    const totalTasks = calculateTotalTasks(nodes);
    useWorkflowStore.getState().initializeSimulationProgress(totalTasks);
    
    setActiveTab('sandbox');
    clearSimulation();
    setIsSimulating(true);

    try {
      const generator = simulateWorkflow(nodes, edges);
      for await (const step of generator) {
        setSimulationSteps(prev => [...prev, step]);
        
        // Handle visual highlights
        const state = useWorkflowStore.getState();
        if (step.action === 'traverse' && step.edgeId) {
          state.setActiveEdgeId(step.edgeId);
        } else if (step.action === 'start' && step.nodeId) {
          state.setActiveNodeId(step.nodeId);
          state.setActiveEdgeId(null); // Clear edge once node starts
        } else if (step.action === 'complete' && step.nodeId) {
          state.setCompletedNodeIds([...state.completedNodeIds, step.nodeId]);
          state.setActiveNodeId(null);
        } else if (step.action === 'process' && step.nodeId && step.metrics) {
          state.updateNodeMetrics(step.nodeId, step.metrics);
          if (step.incrementGlobal) {
            state.incrementGlobalProgress(step.incrementGlobal);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col z-10">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800/60">
        <button
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
            ${activeTab === 'config'
              ? 'text-zinc-100 border-b-2 border-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings2 size={15} />
          Config
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
            ${activeTab === 'sandbox'
              ? 'text-zinc-100 border-b-2 border-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('sandbox')}
        >
          <Terminal size={15} />
          Sandbox
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'config' && (
          <div className="space-y-4">
            {!selectedNode ? (
              <div className="flex flex-col items-center justify-center gap-2 text-zinc-600 mt-16">
                <Settings2 size={28} className="opacity-30" />
                <p className="text-sm">Select a node to configure</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
                    {selectedNode.type?.replace('Node', '')} Node
                  </span>
                </div>
                
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedNode.data.title || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
                  />
                </div>

                {selectedNode.type === 'startNode' && (
                  <div>
                    <label className="form-label">Metadata (Key-Value)</label>
                    <div className="text-xs text-muted">Config builder here...</div>
                  </div>
                )}

                {selectedNode.type === 'taskNode' && (
                  <>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input min-h-[80px]"
                        value={selectedNode.data.description || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Assignee</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedNode.data.assignee || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { assignee: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={selectedNode.data.dueDate || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { dueDate: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === 'approvalNode' && (
                  <>
                    <div>
                      <label className="form-label">Approver Role</label>
                      <select
                        className="form-select"
                        value={selectedNode.data.approverRole || 'Manager'}
                        onChange={(e) => updateNodeData(selectedNode.id, { approverRole: e.target.value as any })}
                      >
                        <option value="Manager">Manager</option>
                        <option value="HRBP">HRBP</option>
                        <option value="Director">Director</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Auto-approve Threshold (Days)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={selectedNode.data.autoApproveThreshold || 0}
                        onChange={(e) => updateNodeData(selectedNode.id, { autoApproveThreshold: Number(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === 'autoNode' && (
                  <div>
                    <label className="form-label">Action</label>
                    <select
                      className="form-select"
                      value={selectedNode.data.mockApiAction || 'Send Email'}
                      onChange={(e) => updateNodeData(selectedNode.id, { mockApiAction: e.target.value as any })}
                    >
                      <option value="Send Email">Send Email</option>
                      <option value="Generate Document">Generate Document</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'aiNode' && (
                  <>
                    <div>
                      <label className="form-label">System Prompt</label>
                      <textarea
                        className="form-input min-h-[100px] font-mono text-xs"
                        value={selectedNode.data.systemPrompt || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { systemPrompt: e.target.value })}
                        placeholder="You are an AI HR assistant..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Data Context</label>
                      <select
                        className="form-select"
                        value={selectedNode.data.dataContext || 'Employee Profile'}
                        onChange={(e) => updateNodeData(selectedNode.id, { dataContext: e.target.value })}
                      >
                        <option value="Employee Profile">Employee Profile</option>
                        <option value="Company Policies">Company Policies</option>
                        <option value="Recent Performance">Recent Performance Reviews</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedNode.type === 'endNode' && (
                  <>
                    <div>
                      <label className="form-label">End Message</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedNode.data.endMessage || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { endMessage: e.target.value })}
                      />
                    </div>
                  <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        id="isSummary"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-zinc-600"
                        checked={selectedNode.data.isSummary || false}
                        onChange={(e) => updateNodeData(selectedNode.id, { isSummary: e.target.checked })}
                      />
                      <label htmlFor="isSummary" className="text-sm text-zinc-300 cursor-pointer">
                        Generate Summary Report
                      </label>
                    </div>
                  </>
                )}

                <div className="pt-5 mt-5 border-t border-zinc-800">
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/15
                               text-red-400 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                               border border-red-500/20 hover:border-red-500/30"
                  >
                    <Trash2 size={15} />
                    Delete Node
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="flex flex-col h-full">
            <GlobalProgressBar />
            
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200
                         text-zinc-900 text-sm py-2.5 px-4 rounded-xl font-medium transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed mb-4 shadow-sm"
            >
              <Play size={15} />
              {isSimulating ? 'Simulating…' : 'Simulate Workflow'}
            </button>



            <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-3 overflow-y-auto font-mono text-xs">
              {simulationSteps.length === 0 ? (
                <div className="text-zinc-600 text-center mt-10 font-sans text-sm">Run simulation to view timeline</div>
              ) : (
                <div className="space-y-2">
                  {simulationSteps.map((step) => (
                    <div key={step.id} className="flex gap-3">
                      <span className="text-zinc-600 shrink-0">
                        {new Date(step.timestamp).toISOString().substring(11, 19)}
                      </span>
                      <span className="text-green-400">{step.message}</span>
                    </div>
                  ))}
                  {isSimulating && (
                    <div className="flex gap-3 animate-pulse">
                      <span className="text-zinc-600 shrink-0">...</span>
                      <span className="text-zinc-500">Processing…</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
