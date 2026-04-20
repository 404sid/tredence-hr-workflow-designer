import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { generateWorkflowWithAI } from '../lib/aiGenerator';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { getLayoutedElements } from '../lib/layout/autoLayout';

export const AIGeneratorDialog = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key.');
      return;
    }
    if (!prompt) {
      setError('Please enter a description for the workflow.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    localStorage.setItem('openai_api_key', apiKey);

    try {
      const { nodes, edges } = await generateWorkflowWithAI(prompt, apiKey);
      const layouted = getLayoutedElements(nodes, edges);
      
      // Temporarily use loadTemplate by injecting our generated payload
      useWorkflowStore.setState({
        nodes: layouted.nodes,
        edges: layouted.edges,
        selectedNodeId: null,
        simulationSteps: [],
        isSimulating: false,
        validationErrors: [],
      });
      // Trigger cinematic fitView via the store signal
      useWorkflowStore.getState().bumpFitView();
      
      setOpen(false);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-zinc-950
                           px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm">
          <Sparkles size={13} />
          Generate with AI
        </button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-lg bg-zinc-950 border border-zinc-800 shadow-2xl shadow-black/60 rounded-2xl p-6 z-50 focus:outline-none">
          <div className="flex justify-between items-center mb-5">
            <Dialog.Title className="text-base font-semibold flex items-center gap-2 text-zinc-100">
              <Sparkles className="text-zinc-400" size={18} />
              AI Workflow Generator
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-600 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label text-xs uppercase tracking-wider">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="form-input font-mono text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-[10px] text-zinc-600 mt-1">Key is stored locally in your browser.</p>
            </div>

            <div>
              <label className="form-label text-xs uppercase tracking-wider">Describe your workflow</label>
              <textarea
                placeholder="Create an employee onboarding workflow with document collection, manager approval, and IT setup..."
                className="form-input min-h-[120px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2
                           rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating Architecture...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Workflow
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
