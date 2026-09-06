# Collaborative Writing & Publishing Workspace — Frontend

A production-style React frontend for a collaborative document writing and publishing workspace, with real-time editing features.

## Tech Stack

- **Framework:** React + Vite
- **Routing:** React Router
- **Real-time Engine:** Socket.io-client
- **Rich Text Editor:** React-Quill
- **Styling:** Vanilla CSS (Dark Mode Design)
- **Icons:** Lucide React
- **API Calls:** Axios

---

## Features

1. **Authentication:** Register and Login with OTP email verification.
2. **Workspaces:** Create workspaces and manage members (Owner, Editor, Viewer).
3. **Real-time Collaboration:** Multiple users can edit a document simultaneously, and see changes in real-time (via WebSockets).
4. **Rich Text Editor:** Fully featured editor to style documents.
5. **Commenting:** Add inline comments to documents.
6. **Public Publishing:** Generate a public, shareable URL for published documents.

---

## Getting Started

### Installation

```bash
# Clone / navigate to the frontend folder
cd frontend

# Install dependencies (use legacy-peer-deps for React-Quill)
npm install --legacy-peer-deps
```

### Run the App

```bash
# Development server
npm run dev

# Build for production
npm run build
```

By default, the Vite dev server runs on `http://localhost:5173`. 
The backend API is expected to be running on `http://localhost:5000`.
