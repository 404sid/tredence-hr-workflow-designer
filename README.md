Markdown

# ⚡️ AI-Powered HR Workflow Designer**Applicant:** Siddhant Jain  **Role:** Full Stack Engineering Intern (AI Agentic Platforms) — Tredence Studio  **Timebox:** 4-6 Hours 

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-8A2BE2?style=for-the-badge)](INSERT_YOUR_VERCEL_LINK_HERE)> **Note to Reviewers:** To eliminate setup friction and instantly demonstrate the LLM integrations, I highly recommend viewing the **Live Demo** linked above. API keys are securely managed in the deployment environment. 

---## 📖 Overview

This project is a production-grade prototype of an HR Workflow Designer, built to align with Tredence Studio's mission of engineering state-of-the-art AI Agentic platforms. Moving beyond standard drag-and-drop mechanics, this canvas acts as an intelligent surface—capable of generating complex workflows from natural language, validating structural integrity via graph algorithms, and running asynchronous mock simulations with real-time telemetry.## 🛠 Tech Stack* **Core:** React 18, TypeScript (Strict Mode), Vite* **Canvas Engine:** React Flow* **State Management:** Zustand (with Undo/Redo middleware)* **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide Icons* **Algorithms:** Dagre (Auto-Layout), Depth-First Search (Cycle Detection)

---## 🚀 Step-by-Step Installation & Running Guide

Follow these steps to run the application locally on your machine.### 1. Clone the Repository
If you received this as a zipped file, extract it to your desired directory. Otherwise, clone the repo:```bash
git clone <your-repository-url>
cd hr-workflow-designer
2. Install Dependencies
Ensure you have Node.js installed (v18+ recommended).

Bash

npm install
3. Environment Variables (For AI Features)
To enable the Natural Language to Workflow generation locally, you need to provide an API key.
Create a file named .env.local in the root directory and add your key:

Code snippet

VITE_OPENAI_API_KEY="sk-your-api-key-here"
# OR
VITE_ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
Note: If no API key is provided, the UI handles it gracefully and falls back to loading mock workflow templates when the AI feature is triggered.

4. Start the Development Server
Bash

npm run dev
Navigate to http://localhost:5173 in your browser to view the application.
✨ Star Features & Product Capabilities
🥇 1. Natural Language -> Workflow Generation (AI Agent)
Instead of manually dragging nodes, users can type a prompt (e.g., "Create an onboarding flow with IT setup, document collection, and manager approval"). The system queries the LLM to dynamically generate the nodes, map the edges, and render the graph.

Cinematic Auto-Fit: Automatically executes a smooth camera pan (fitView) to perfectly frame the newly generated nodes.
🥈 2. Mock SSE Simulation & Live Telemetry
To demonstrate handling of complex asynchronous data streams, I built a custom mock Server-Sent Events (SSE) engine.

In-Node Telemetry: As the workflow executes, nodes display live, ticking counters (Success, Error, Pending) directly inside their footer.
Animated Graph: Active nodes elevate, and active edges pulse to visualize the exact execution path.
Aggregated Progress: A global segmented progress bar in the Sandbox tab visually tracks the macro-success of the entire workflow execution.
🥉 3. Algorithmic Cycle Detection & Intelligent Linter (DSA)
Workflows are directed graphs. Before execution, the system runs a Depth-First Search (DFS) traversal to validate structural integrity.

Visual Cycle Highlighting: If an infinite loop is detected, the app dynamically updates the canvas state to turn the offending edges red.
Intelligent Linter: A floating pill at the bottom of the screen acts as a Developer Experience (DX) linter, explaining why a node is invalid (e.g., "Dangling Task") and suggesting actionable fixes.
🏅 4. Premium "Linear-Style" Dark Mode UI
Engineered a premium, Vercel/Linear-inspired dark mode to mimic top-tier developer tools.

Aesthetics: Utilizes a strictly neutral monochrome palette (zinc), subtle backdrop blurs, crisp 1px borders, and the Inter font family.
Ergonomics: Canvas controls (Zoom/Pan) are oriented as a vertical side-toolbar to prevent obstruction of downward-growing workflow branches.
🏅 5. Advanced Canvas Mechanics
Auto-Layout Engine: Integrated dagre to automatically calculate mathematical spacing (X/Y coordinates) for nodes, preventing visual collisions when loading templates or AI-generated graphs.
Time-Travel State: Implemented a robust Undo/Redo stack for canvas mutations.
JSON Export/Import: Complete canvas serialization to save and load templates.
🏗️ Architecture & Design Decisions
1. State Management: Zustand over Context
To manage the highly interactive state of the canvas alongside the sidebars and telemetry data, I opted for Zustand.

React Context would trigger unnecessary re-renders across the entire canvas whenever a single node's form updated. Zustand allows components to selectively subscribe to precise slices of state.
This architecture made implementing the Undo/Redo middleware and syncing the dynamic Node Configuration forms seamless.
2. Separation of Concerns & Custom Hooks
I kept the React UI components purely presentational, offloading heavy business logic to custom utility hooks:

useSimulationEngine.ts: Encapsulates the async generator loop, handling the mock SSE stream and telemetry increments.
useWorkflowValidator.ts: Houses the graph traversal algorithms to keep validation logic decoupled from the rendering layer.
autoLayout.ts: Wraps the dagre logic to decouple mathematical layout calculations from the view.
3. Dynamic Form Architecture
Node configuration forms are dynamically rendered in the right sidebar based on the selected node's type. Using controlled components tied directly to the Zustand store ensures that edits in the sidebar instantly reflect on the canvas, maintaining a strict single source of truth.
📂 Directory Structure
Plaintext

/src
  ├── components/
  │   ├── canvas/          # React Flow instance, custom nodes, custom edges
  │   ├── sidebar/         # Dynamic forms (Config) and Simulation Sandbox
  │   └── ui/              # Reusable, accessible UI primitives (Tailwind)
  ├── store/
  │   └── useWorkflowStore.ts  # Zustand global state & actions
  ├── lib/
  │   ├── layout/          # Dagre auto-layout logic
  │   └── validators/      # DFS graph traversal & Linter logic
  ├── mockApi/             # Async generators for simulation & mock API responses
  ├── types/               # Strict TypeScript interfaces
  └── App.tsx              # Main application wrapper
⏳ Future Scope (Scaling to Production)
If given more time to scale this prototype into a production-ready feature, I would prioritize:

Backend Persistence: Move the graph state to a PostgreSQL database via a FastAPI backend, saving workflows as structured JSON.
True WebSockets/SSE: Replace the client-side async generator with a real backend simulation engine streaming logs via Server-Sent Events.
Comprehensive Testing: Add E2E tests using Playwright to verify drag-and-drop interactions, and Jest for the graph traversal utility functions.
Node Grouping: Allow users to collapse multiple nodes into a single "Sub-workflow" node to manage visual complexity.


give this whole thing in a copy paste time formate which i can directly paste in readme , give it as .md format 
