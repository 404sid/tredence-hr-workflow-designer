import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

interface AIGenerationResponse {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const generateWorkflowWithAI = async (
  prompt: string,
  apiKey: string
): Promise<AIGenerationResponse> => {
  const systemPrompt = `You are an expert HR Workflow Architect. 
Given the user's natural language request, generate a valid JSON representation of a workflow graph.
The JSON must perfectly match this structure and return ONLY JSON (no markdown wrapping, no explanation):
{
  "nodes": [
    {
      "id": "n1",
      "type": "startNode" | "taskNode" | "approvalNode" | "autoNode" | "aiNode" | "endNode",
      "position": { "x": 250, "y": 50 },
      "data": { 
        "title": "Node Title",
        "type": "same as node type",
        "description": "optional for taskNode",
        "assignee": "optional for taskNode",
        "approverRole": "Manager" | "HRBP" | "Director" | "optional for approvalNode",
        "mockApiAction": "Send Email" | "Generate Document" | "optional for autoNode",
        "systemPrompt": "optional for aiNode",
        "endMessage": "optional for endNode"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "smoothstep",
      "animated": true
    }
  ]
}
Rules:
1. Always include exactly one 'startNode' at the beginning.
2. Always include at least one 'endNode' at the end.
3. Position nodes neatly from top to bottom (x=250, y increments by 120 for each step).
4. Use valid node types: startNode, taskNode, approvalNode, autoNode, aiNode, endNode.
5. Create edges sequentially connecting the flow.
6. The response MUST be pure JSON string parseable by JSON.parse(). Do not include \`\`\`json blocks.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to generate workflow from OpenAI API');
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  try {
    const parsed = JSON.parse(content);
    return parsed as AIGenerationResponse;
  } catch (e) {
    console.error("Failed to parse OpenAI response as JSON:", content);
    throw new Error('OpenAI returned malformed JSON. Please try again.');
  }
};
