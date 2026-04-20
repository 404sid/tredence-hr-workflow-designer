import React, { useEffect, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { Network, FolderOpen, Trash2, Save, Download, Upload, Undo2, Redo2, Wand } from 'lucide-react';
import { useWorkflowStore } from './store/useWorkflowStore';
import { templates } from './lib/templates';
import { AIGeneratorDialog } from './components/AIGeneratorDialog';

function App() {
  const loadTemplate = useWorkflowStore(state => state.loadTemplate);
  const clearCanvas = useWorkflowStore(state => state.clearCanvas);
  const customTemplates = useWorkflowStore(state => state.customTemplates);
  const saveCustomTemplate = useWorkflowStore(state => state.saveCustomTemplate);
  const initCustomTemplates = useWorkflowStore(state => state.initCustomTemplates);
  const importWorkflow = useWorkflowStore(state => state.importWorkflow);
  const applyAutoLayout = useWorkflowStore(state => state.applyAutoLayout);
  
  const undo = useWorkflowStore(state => state.undo);
  const redo = useWorkflowStore(state => state.redo);
  const canUndo = useWorkflowStore(state => state.past.length > 0);
  const canRedo = useWorkflowStore(state => state.future.length > 0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    initCustomTemplates();
  }, [initCustomTemplates]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      loadTemplate(e.target.value);
      e.target.value = ''; // Reset select after loading
    }
  };

  const handleSaveTemplate = () => {
    const name = window.prompt('Enter a name for your new template:');
    if (name && name.trim()) {
      saveCustomTemplate(name.trim());
    }
  };

  const handleExport = () => {
    const state = useWorkflowStore.getState();
    const data = {
      nodes: state.nodes,
      edges: state.edges
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hr-workflow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.edges) {
          importWorkflow(parsed);
        } else {
          alert('Invalid workflow file format.');
        }
      } catch (error) {
        alert('Failed to parse the file. Ensure it is a valid JSON workflow.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset the input
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-5 z-20 shrink-0 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="bg-white p-1.5 rounded-lg">
            <Network className="text-zinc-950" size={16} />
          </div>
          <h1 className="font-semibold text-sm tracking-tight text-zinc-100">HR Workflow Designer</h1>
        </div>

        <div className="w-px h-5 bg-zinc-800 mx-1" />
        {/* ── Undo / Redo ── */}
        <div className="flex items-center gap-0.5 bg-zinc-800 rounded-full p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-30
                       disabled:hover:bg-transparent transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-30
                       disabled:hover:bg-transparent transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="w-px h-5 bg-zinc-800" />

        {/* ── Action buttons ── */}
        <button
          onClick={applyAutoLayout}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800
                     px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-zinc-800 bg-zinc-900"
          title="Auto-layout Nodes"
        >
          <Wand size={14} />
          Auto Layout
        </button>

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10
                     px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-zinc-800 bg-zinc-900"
          title="Clear entire canvas"
        >
          <Trash2 size={14} />
          Clear
        </button>

        <div className="w-px h-5 bg-zinc-800" />

        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800
                     border border-zinc-800 bg-zinc-900 transition-all"
          title="Import Workflow from JSON"
        >
          <Upload size={14} />
        </button>
        <button
          onClick={handleExport}
          className="p-2 rounded-full text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800
                     border border-zinc-800 bg-zinc-900 transition-all"
          title="Export Workflow to JSON"
        >
          <Download size={14} />
        </button>

        <div className="w-px h-5 bg-zinc-800" />

        <AIGeneratorDialog />

        <button
          onClick={handleSaveTemplate}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800
                     px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-zinc-800 bg-zinc-900"
          title="Save current workflow as template"
        >
          <Save size={14} />
          Save
        </button>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 relative">
          <FolderOpen size={14} className="text-zinc-600" />
          <select
            className="bg-transparent text-sm text-zinc-400 focus:outline-none appearance-none cursor-pointer pr-4 max-w-[120px]"
            onChange={handleTemplateChange}
            defaultValue=""
          >
            <option value="" disabled>Load Template…</option>
              <optgroup label="Built-in Templates">
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            {customTemplates.length > 0 && (
              <optgroup label="My Custom Templates">
                {customTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <ReactFlowProvider>
          <LeftSidebar />
          <WorkflowCanvas />
          <RightSidebar />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default App;
