// lib/socket.ts
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/constants";


let socket: Socket | null = null;

/**
 * Returns the singleton Socket.IO client.
 * Creates it if it doesn't exist yet.
 * Disconnects only when the tab/window is closed.
 */
export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    // Optional: log connection status
    socket.on("connect", () => console.log("Socket connected"));
    socket.on("disconnect", () => console.log("Socket disconnected"));

    // Disconnect only on tab close
    const handleBeforeUnload = () => {
      socket?.disconnect();
      socket = null;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  return socket;
}