from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        print("DEBUG: Socket Manager Initialized")

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"DEBUG: Client Connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"DEBUG: Client Disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        print(f"DEBUG: Broadcasting message to {len(self.active_connections)} clients")
        
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"DEBUG: Error sending to client: {e}")
                self.disconnect(connection)

manager = ConnectionManager()