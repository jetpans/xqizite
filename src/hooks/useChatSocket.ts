import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
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

    
    socketRef.current = getSocket(token);


    try{
      socketRef.current?.off("message_from_server");
      socketRef.current?.off("update_user_counts");
      socketRef.current?.off("update_connected_users");
      socketRef.current?.off("update_question");
      socketRef.current?.off("invalid_token");
    }catch(e){
      console.error("Error removing existing event listeners:", e);
    }

      


    socketRef.current.on("message_from_server", (msg: ChatMessage) => {

      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("update_user_counts", (counts: { [roomId: number]: number }) => {

      setUserCounts(counts);
    });

    socketRef.current.on("update_connected_users", (users: UserInfo[]) => {

      setConnectedUsers(users);
    });
    socketRef.current.on("update_question", (question: Question | null) => {

      setActiveQuestion(question ? question : null);
    });
    
    socketRef.current.on("invalid_token", (msg: string | null) => {
      toast.error("Disconnecting because of Logon error: "+ msg);
      logout();
      socketRef.current?.disconnect();
    });
    
    


    return () => {
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