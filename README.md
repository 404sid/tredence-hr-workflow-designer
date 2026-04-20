# ⚡️ AI-Powered HR Workflow Designer

**Applicant:** Siddhant Jain
**Role:** Full Stack Engineering Intern (AI Agentic Platforms) — Tredence Studio
**Timebox:** 4–6 Hours

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-8A2BE2?style=for-the-badge)](https://tredence-hr-workflow-designer.netlify.app/)

> **Note to Reviewers:** To eliminate setup friction, I highly recommend viewing the **Live Demo** linked above. API keys are securely managed in the deployment environment.

---

## 📖 Overview

This project is a production-grade prototype of an HR Workflow Designer, built to align with Tredence Studio's mission of engineering state-of-the-art AI Agentic platforms. Moving beyond standard drag-and-drop mechanics, this canvas acts as an intelligent surface — capable of generating complex workflows from natural language, validating structural integrity via graph algorithms, and running asynchronous mock simulations with real-time telemetry.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Core | React 18, TypeScript (Strict Mode), Vite |
| Canvas Engine | React Flow |
| State Management | Zustand (with Undo/Redo middleware) |
| Styling & UI | Tailwind CSS, Radix UI Primitives, Lucide Icons |
| Algorithms | Dagre (Auto-Layout), Depth-First Search (Cycle Detection) |

---

## 🚀 Installation & Setup

### 1. Clone the Repository

If you received this as a zipped file, extract it to your desired directory. Otherwise, clone the repo:

```bash
git clone <your-repository-url>
cd hr-workflow-designer
```

### 2. Install Dependencies

Ensure you have **Node.js v18+** installed.

```bash
npm install
```

### 3. Environment Variables (For AI Features)

To enable Natural Language → Workflow generation locally, provide an API key by creating a `.env.local` file in the root directory:

```env
VITE_OPENAI_API_KEY="sk-your-api-key-here"
# OR
VITE_ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

> **Note:** If no API key is provided, the UI handles it gracefully and falls back to loading mock workflow templates when the AI feature is triggered.

### 4. Start the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## ✨ Features

### 🥇 1. Natural Language → Workflow Generation (AI Agent)

Instead of manually dragging nodes, users can type a prompt (e.g., *"Create an onboarding flow with IT setup, document collection, and manager approval"*). The system queries the LLM to dynamically generate nodes, map edges, and render the graph.

- **Cinematic Auto-Fit:** Automatically executes a smooth camera pan (`fitView`) to perfectly frame the newly generated workflow.

---

### 🥈 2. Mock SSE Simulation & Live Telemetry

A custom mock Server-Sent Events (SSE) engine demonstrates handling of complex asynchronous data streams.

- **In-Node Telemetry:** Live, ticking counters (Success, Error, Pending) displayed directly inside node footers during execution.
- **Animated Graph:** Active nodes elevate and active edges pulse to visualize the exact execution path.
- **Aggregated Progress:** A global segmented progress bar in the Sandbox tab tracks macro-success across the entire workflow.

---

### 🥉 3. Algorithmic Cycle Detection & Intelligent Linter (DSA)

Before execution, a Depth-First Search (DFS) traversal validates the structural integrity of the workflow graph.

- **Visual Cycle Highlighting:** Offending edges are dynamically turned red when an infinite loop is detected.
- **Intelligent Linter:** A floating pill at the bottom of the screen explains why a node is invalid (e.g., *"Dangling Task"*) and suggests actionable fixes.

---

### 🏅 4. Premium "Linear-Style" Dark Mode UI

A Vercel/Linear-inspired dark mode UI built to mimic top-tier developer tools.

- **Aesthetics:** Neutral monochrome palette (zinc), subtle backdrop blurs, crisp 1px borders, Inter font.
- **Ergonomics:** Canvas controls (Zoom/Pan) oriented as a vertical side-toolbar to prevent obstruction of downward-growing workflow branches.

---

### 🏅 5. Advanced Canvas Mechanics

- **Auto-Layout Engine:** Dagre integration automatically calculates X/Y spacing for nodes, preventing visual collisions when loading templates or AI-generated graphs.
- **Time-Travel State:** Robust Undo/Redo stack for all canvas mutations.
- **JSON Export/Import:** Complete canvas serialization to save and load workflow templates.

---

## 🏗️ Architecture & Design Decisions

### 1. State Management: Zustand over Context

Zustand was chosen over React Context to manage the highly interactive canvas state alongside sidebars and telemetry data.

- React Context triggers unnecessary re-renders across the entire canvas whenever a single node's form updates. Zustand allows components to selectively subscribe to precise slices of state.
- This architecture made implementing the Undo/Redo middleware and syncing dynamic Node Configuration forms seamless.

### 2. Separation of Concerns & Custom Hooks

React UI components are kept purely presentational, with heavy business logic offloaded to custom utility hooks:

- **`useSimulationEngine.ts`** — Encapsulates the async generator loop, handling the mock SSE stream and telemetry increments.
- **`useWorkflowValidator.ts`** — Houses the graph traversal algorithms, decoupled from the rendering layer.
- **`autoLayout.ts`** — Wraps Dagre logic to decouple mathematical layout calculations from the view.

### 3. Dynamic Form Architecture

Node configuration forms are dynamically rendered in the right sidebar based on the selected node's type. Controlled components tied directly to the Zustand store ensure that sidebar edits instantly reflect on the canvas — maintaining a strict single source of truth.

---

## 📂 Directory Structure

```
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
```

---

## ⏳ Future Scope

If given more time to scale this prototype to production, the priorities would be:

- **Backend Persistence:** Move graph state to a PostgreSQL database via a FastAPI backend, saving workflows as structured JSON.
- **True WebSockets/SSE:** Replace the client-side async generator with a real backend simulation engine streaming logs via Server-Sent Events.
- **Comprehensive Testing:** E2E tests with Playwright for drag-and-drop interactions; Jest for graph traversal utilities.
- **Node Grouping:** Allow users to collapse multiple nodes into a single "Sub-workflow" node to manage visual complexity.
