import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const templates: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Standard Onboarding',
    description: 'A basic employee onboarding flow with IT setup and HR orientation.',
    nodes: [
      { id: 'n1', type: 'startNode', position: { x: 250, y: 50 }, data: { title: 'New Hire Started', type: 'startNode', metadata: [] } },
      { id: 'n2', type: 'taskNode', position: { x: 250, y: 150 }, data: { title: 'IT Equipment Setup', type: 'taskNode', assignee: 'IT Dept', description: 'Provision laptop and accounts.' } },
      { id: 'n3', type: 'autoNode', position: { x: 250, y: 250 }, data: { title: 'Send Welcome Email', type: 'autoNode', mockApiAction: 'Send Email' } },
      { id: 'n4', type: 'taskNode', position: { x: 250, y: 350 }, data: { title: 'HR Orientation', type: 'taskNode', assignee: 'HR Team', description: 'Complete day 1 orientation.' } },
      { id: 'n5', type: 'endNode', position: { x: 250, y: 450 }, data: { title: 'Onboarding Complete', type: 'endNode', endMessage: 'Employee successfully onboarded.' } },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'n4', target: 'n5', type: 'smoothstep', animated: true },
    ]
  },
  {
    id: 'leave-request',
    name: 'Leave Request Approval',
    description: 'Automated leave request with AI policy validation and manager approval.',
    nodes: [
      { id: 'l1', type: 'startNode', position: { x: 250, y: 50 }, data: { title: 'Leave Requested', type: 'startNode', metadata: [] } },
      { id: 'l2', type: 'aiNode', position: { x: 250, y: 150 }, data: { title: 'Validate Leave Policy', type: 'aiNode', systemPrompt: 'Check if requested dates overlap with company blackouts and if employee has sufficient balance.', dataContext: 'Company Policies' } },
      { id: 'l3', type: 'approvalNode', position: { x: 250, y: 250 }, data: { title: 'Manager Approval', type: 'approvalNode', approverRole: 'Manager', autoApproveThreshold: 3 } },
      { id: 'l4', type: 'autoNode', position: { x: 100, y: 350 }, data: { title: 'Update HRIS', type: 'autoNode', mockApiAction: 'Generate Document' } },
      { id: 'l5', type: 'endNode', position: { x: 100, y: 450 }, data: { title: 'Approved', type: 'endNode', endMessage: 'Leave approved and logged.', isSummary: true } },
    ],
    edges: [
      { id: 'el1-2', source: 'l1', target: 'l2', type: 'smoothstep', animated: true },
      { id: 'el2-3', source: 'l2', target: 'l3', type: 'smoothstep', animated: true },
      { id: 'el3-4', source: 'l3', target: 'l4', type: 'smoothstep', animated: true },
      { id: 'el4-5', source: 'l4', target: 'l5', type: 'smoothstep', animated: true },
    ]
  },
  {
    id: 'performance-review',
    name: 'Performance Review',
    description: 'Quarterly review workflow requiring self and manager evaluations.',
    nodes: [
      { id: 'p1', type: 'startNode', position: { x: 250, y: 50 }, data: { title: 'Q3 Review Kickoff', type: 'startNode', metadata: [] } },
      { id: 'p2', type: 'taskNode', position: { x: 250, y: 150 }, data: { title: 'Self Evaluation', type: 'taskNode', assignee: 'Employee', description: 'Employee completes self-assessment.' } },
      { id: 'p3', type: 'taskNode', position: { x: 250, y: 250 }, data: { title: 'Manager Evaluation', type: 'taskNode', assignee: 'Manager', description: 'Manager reviews and grades performance.' } },
      { id: 'p4', type: 'approvalNode', position: { x: 250, y: 350 }, data: { title: 'Director Calibration', type: 'approvalNode', approverRole: 'Director' } },
      { id: 'p5', type: 'endNode', position: { x: 250, y: 450 }, data: { title: 'Review Finalized', type: 'endNode', endMessage: 'Performance review logged to profile.', isSummary: true } },
    ],
    edges: [
      { id: 'ep1-2', source: 'p1', target: 'p2', type: 'smoothstep', animated: true },
      { id: 'ep2-3', source: 'p2', target: 'p3', type: 'smoothstep', animated: true },
      { id: 'ep3-4', source: 'p3', target: 'p4', type: 'smoothstep', animated: true },
      { id: 'ep4-5', source: 'p4', target: 'p5', type: 'smoothstep', animated: true },
    ]
  }
];
