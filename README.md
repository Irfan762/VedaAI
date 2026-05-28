# VedaAI - AI Assessment Creator Platform

VedaAI is a premium-quality AI Assessment Creator platform that allows educators to create, manage, and evaluate assessments with AI-powered tools. It features a stunning glassmorphism design, offline fallback support, and real-time generation feedback via WebSockets.

## Architecture

This project is divided into two main parts:
- **Frontend:** Next.js 14, React, Zustand, Tailwind CSS, Socket.IO Client.
- **Backend:** Express.js, TypeScript, Mongoose/MongoDB (with in-memory fallback), Redis (with mock fallback), Socket.IO Server.

The backend is designed to run completely offline without external dependencies (MongoDB/Redis) by utilizing a robust fallback mechanism. If Redis or MongoDB fails to connect, the system automatically falls back to an in-memory `memoryStore` and a mock queue processing simulation.

## Features

- **Dynamic Assignment Dashboard:** View, search, filter, and manage previous assessments.
- **Wizard Creator:** Step-by-step form powered by React Hook Form & Zod with dynamic drag-and-drop file ingestion.
- **AI Synthesis:** Generates high-fidelity assessments locally or using OpenAI/Gemini APIs.
- **Real-Time Generation UI:** WebSocket-powered progress overlay to show generation progress in real-time.
- **Professional Print Output:** Custom print CSS (`@media print`) for flawless PDF exports.
- **Offline Reliability:** Zustand store with `localStorage` persistence and fallback backend database support.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Optional: MongoDB, Redis

### Installation
Run the following command in the root folder to install dependencies for both the frontend and backend:
```bash
npm install
```

### Running Locally

To run both the frontend and backend servers concurrently, simply run the following command in the root folder:

```bash
npm run dev
```

- **Frontend Server:** Available at `http://localhost:3000`
- **Backend Server:** Available at `http://localhost:5000`

*Note: If the backend fails to connect to Redis or MongoDB, it will output connection errors and automatically switch to mock queue fallback mode. This is expected and ensures local development can proceed without infrastructure dependencies.*
