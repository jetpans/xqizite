import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Types for incoming messages from the server
export interface ChatMessage {
messageId: number;
avatar: string;
  username: string;
  message: string;
  isCorrect: boolean;
  timestamp: string;
}

// Props passed into the hook
interface UseChatSocketProps {
  token: string; // JWT
}

export default function useChatSocket({ token }: UseChatSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    let token = localStorage.getItem("jwt");

    if (!token) return;
    console.log("Initializing chat socket with token:", token);

    socketRef.current = io("http://localhost:5000", {
      auth: { token }, // Flask will get this from socket.handshake.auth.token
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chat socket");
      setConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from chat socket");
      setConnected(false);
    });

    socketRef.current.on("message_from_server", (msg: ChatMessage) => {
      console.log("Received message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  const joinRoom = useCallback((roomId: number) => {
    socketRef.current?.emit("join_room", { chatRoomId: roomId });
    setMessages([]); // Clear messages when joining a new room
  }, []);

  const leaveRoom = useCallback((roomId: number) => {
    socketRef.current?.emit("leave_room", { chatRoomId: roomId });
  }, []);

  const sendMessage = useCallback((roomId: number, message: string) => {
    socketRef.current?.emit("send_message", {
      chatRoomId: roomId,
      message,
    });
  }, []);

  return {
    connected,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
  };
}