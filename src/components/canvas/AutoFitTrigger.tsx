import { useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';

/**
 * Invisible component mounted inside <ReactFlowProvider>.
 * Watches fitViewTrigger in the Zustand store and calls
 * fitView() with a cinematic animation whenever it increments.
 */
export const AutoFitTrigger = () => {
  const { fitView } = useReactFlow();
  const fitViewTrigger = useWorkflowStore(state => state.fitViewTrigger);
  // Skip the very first render (initial mount, no user action yet)
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // 150ms: enough for React to commit the new nodes to the DOM
    // so React Flow can measure their dimensions before moving the camera.
    const id = setTimeout(() => {
      fitView({
        padding: 0.2,   // 20% margin around the workflow
        duration: 800,  // smooth cinematic pan/zoom
        nodes: undefined // fit all nodes
      });
    }, 150);
    return () => clearTimeout(id);
  }, [fitViewTrigger, fitView]);

  return null; // purely behavioral, renders nothing
};
