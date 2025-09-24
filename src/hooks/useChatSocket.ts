import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";

// Types for incoming messages from the server
export interface ChatMessage {
messageId: number;
avatar: string;
  username: string;
  message: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface Question {
  roomId: number;
  question: string;
  answer: string;
  clue: string;
  timeStarted: string;
  timeLimit: number;
}

// Props passed into the hook
interface UseChatSocketProps {
  token: string; // JWT
}

export interface UserInfo{
  avatar: string;
  username: string;
}

export default function useChatSocket({ token }: UseChatSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<UserInfo[]>([]);
  const [userCounts, setUserCounts] = useState<{ [roomId: number]: number }>({});
  const [connected, setConnected] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const { user, logout } = useUser();


  useEffect(() => {
    let token = localStorage.getItem("jwt");

    if (!token) return;
    console.log("Initializing chat socket with token:", token);

    socketRef.current = io("http://localhost:5000", {
      auth: { token }, // Flask will get this from socket.handshake.auth.token
      transports: ["websocket"],
    });

    // Check if 

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

    socketRef.current.on("update_user_counts", (counts: { [roomId: number]: number }) => {
      console.log("Received user counts update:", counts);
      setUserCounts(counts);
    });

    socketRef.current.on("update_connected_users", (users: UserInfo[]) => {
      console.log("Received connected users update:", users);
      setConnectedUsers(users);
    });
    socketRef.current.on("update_question", (question: Question | null) => {
      console.log("Received question update:", question);
      setActiveQuestion(question ? question : null);
    });
    
    socketRef.current.on("invalid_token", () => {
      console.error("Invalid token. Disconnecting socket.");
      logout();
      socketRef.current?.disconnect();
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
    userCounts,
    connectedUsers,
    activeQuestion,
  };
}