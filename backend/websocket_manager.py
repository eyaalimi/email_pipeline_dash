from fastapi import WebSocket
import asyncio
import json
from datetime import datetime, timezone


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}  # pipeline_run_id -> connections
        self.global_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket, run_id: int = None):
        await websocket.accept()
        if run_id is not None:
            self.active_connections.setdefault(run_id, []).append(websocket)
        else:
            self.global_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, run_id: int = None):
        if run_id is not None and run_id in self.active_connections:
            self.active_connections[run_id] = [c for c in self.active_connections[run_id] if c != websocket]
        self.global_connections = [c for c in self.global_connections if c != websocket]

    async def send_log(self, run_id: int, level: str, message: str):
        entry = {
            "run_id": run_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "message": message,
        }
        data = json.dumps(entry)
        targets = self.active_connections.get(run_id, []) + self.global_connections
        for conn in targets:
            try:
                await conn.send_text(data)
            except Exception:
                pass

    async def broadcast_event(self, event: dict):
        data = json.dumps(event)
        for conn in self.global_connections:
            try:
                await conn.send_text(data)
            except Exception:
                pass


manager = ConnectionManager()
