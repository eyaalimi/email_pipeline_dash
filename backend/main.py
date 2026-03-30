import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import init_db
from routers import emails, pipeline, stats, exports
from websocket_manager import manager

app = FastAPI(title="Dräxlmaier AI Email Pipeline Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(emails.router)
app.include_router(pipeline.router)
app.include_router(stats.router)
app.include_router(exports.router)

# Serve uploads and exports as static files
os.makedirs(os.path.join(os.path.dirname(__file__), "uploads"), exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(__file__), "..", "exports"), exist_ok=True)


@app.websocket("/ws/logs/{run_id}")
async def websocket_logs(websocket: WebSocket, run_id: int):
    await manager.connect(websocket, run_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, run_id)


@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/api/health")
def health():
    return {"status": "ok"}
