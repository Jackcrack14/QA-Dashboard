import { useEffect, useState, useCallback, useRef } from "react";
import { SocketMessage } from "@/types/types";

export const useSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const [status, setStatus] = useState<"CONNECTING" | "OPEN" | "CLOSED">(
    "CLOSED"
  );

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log("Connecting to WebSocket...");
    setStatus("CONNECTING");

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setStatus("OPEN");
      clearTimeout(reconnectTimeout.current);
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLastMessage(parsed);
      } catch (e) {
        console.error("WebSocket parse error", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected.");
      setStatus("CLOSED");
      wsRef.current = null;

      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
      ws.close();
    };

    wsRef.current = ws;
  }, [url]);

  const refreshConnection = useCallback(() => {
    clearTimeout(reconnectTimeout.current);

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("CLOSED");
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  return { lastMessage, status, refreshConnection };
};
