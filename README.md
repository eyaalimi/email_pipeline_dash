# Dräxlmaier AI Email Pipeline Dashboard

Full-stack dashboard for managing the AI email processing pipeline.

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload
```
Backend runs at http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

## Features

- **Email Management**: CRUD operations, search, filter by status/date, PDF upload
- **Pipeline Execution**: Trigger AI pipeline (Agent 1 + Agent 2) per email or in batch
- **Real-time Logs**: WebSocket-powered live log streaming during pipeline execution
- **JSON Viewer**: Syntax-highlighted, collapsible tree view of parsed output
- **Export**: Download results as Excel (.xlsx) or CSV
- **Statistics**: Charts and KPI cards (success rate, volume, processing time)
- **Execution History**: Full audit trail of all pipeline runs
- **Role-based UI**: IT Admin (full access) / Client (read-only) toggle
- **Dark/Light Mode**: Theme toggle with persistence
- **Keyboard Shortcuts**: `N` = new email, `Esc` = close modals

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, openpyxl
- **Frontend**: React 18, Tailwind CSS, Recharts, Vite
- **Real-time**: WebSocket (FastAPI native)

## Agent Integration

The agents are mocked in `backend/services/agent_service.py`. To connect real agents, replace the mock methods in the `AgentService` class with actual API calls. The rest of the application requires no changes.
