"use client";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleAction,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react"; // Added import
import useChatSocket from "@/hooks/useChatSocket";
import dataController from "@/lib/DataController";
import { API_URL } from "@/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Use Next.js router for navigation
interface ChatRoomProps {
  token: string;
}

interface Room {
  chatRoomId: number;
  name: string;
  icon: string;
  type_description: string;
  population: number;
  capacity: number;
}
export default function Room() {
  const { user, logout } = useUser();
  const [inputValue, setInputValue] = useState(""); // Added state for input

  const {
    connected,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
    userCounts,
    connectedUsers,
    activeQuestion,
  } = useChatSocket({ token: user?.token || "" });

  // const [messages, setMessages] = useState([
  //   {
  //     messageId: 1,
  //     content: "Help me with my essay.",
  //     username: "user",
  //     avatar: "D",
  //     timestamp: new Date().toLocaleTimeString(),
  //   },
  // ]);

  const router = useRouter();

  const dc = new dataController();

  const [rooms, setRooms] = useState<Room[]>([]);

  const [activeRoom, setActiveRoom] = useState<Room>({} as Room);

  const handleSetActiveRoom = (room: any) => {
    if (activeRoom.chatRoomId && activeRoom.chatRoomId !== room.chatRoomId) {
      leaveRoom(activeRoom.chatRoomId);
    }
    joinRoom(room.chatRoomId);

    setActiveRoom(room);
  };

  const handleSendMessage = (e: any) => {
    e.preventDefault();

    // Check if input has content
    if (!inputValue.trim()) return;

    sendMessage(activeRoom.chatRoomId, inputValue);
    setInputValue("");
  };

  useEffect(() => {
    console.log("User is: ", user);
    if (user !== null) {
      const accessToken = localStorage.getItem("jwt");
      if (accessToken === null) {
        logout();
        router.push("/");
      }

      if (localStorage.getItem("jwt") === null) {
        router.push("/");
      }
      router.push("/room");
    } else {
      if (localStorage.getItem("jwt") === null) {
        router.push("/");
      }
    }

    dc.GetData(API_URL + "/api/rooms")
      .then((response) => {
        if (response.success === true && response.data.success === true) {
          setRooms(response.data.data);
        } else {
          console.error("Failed to fetch rooms");
        }
      })
      .catch((response) => {
        toast.error("Login failed. Please check your credentials.");
      });
  }, []);

  useEffect(() => {
    for (let room of rooms) {
      room.population = userCounts[room.chatRoomId] || 0;
    }
  }, [userCounts]);

  useEffect(() => {
    if (!activeRoom.chatRoomId) return;

    const unload = () => {
      leaveRoom(activeRoom.chatRoomId);
    };

    window.addEventListener("beforeunload", unload);

    return () => {
      window.removeEventListener("beforeunload", unload);
      // Optional: leave the room on unmount
      leaveRoom(activeRoom.chatRoomId);
    };
  }, [activeRoom.chatRoomId]);

  return (
    <div
      className="flex flex-row justify-center mt-[1rem] w-full h-full flex-wrap"
      onCopy={(e) => {
        toast.error("Copying is not allowed!");
        e.preventDefault();
      }}
      onCut={(e) => {
        toast.error("Cutting is not allowed!");
        e.preventDefault();
      }}
      onPaste={(e) => {
        toast.error("Pasting is not allowed!");
        e.preventDefault();
      }}
    >
      <div className="info">
        <div className="roomlist m-[1rem] min-w-[10vw]">
          <h2 className="text-lg font-bold mb-4">Chat Rooms</h2>
          <ul className="space-y-2 overflow-y-auto max-h-[70vh]">
            {rooms.map((room) => (
              <li
                key={room.chatRoomId}
                className={`p-2 rounded-lg cursor-pointer ${
                  activeRoom.chatRoomId === room.chatRoomId
                    ? "bg-blue-100"
                    : "bg-gray-50 hover:bg-gray-100"
                }
                ${
                  activeRoom.chatRoomId === room.chatRoomId &&
                  "pointer-events-none"
                }`}
                onClick={() => handleSetActiveRoom(room)}
              >
                <div className="flex items-center">
                  <img
                    src={room.icon}
                    alt={room.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {room.name} ({room.population}/{room.capacity})
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.type_description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="userlist m-[1rem] min-w-[20vw]">
          <h2 className="text-lg font-bold mb-4">Connected Users</h2>
          <div className="thelist overflow-y-auto max-h-[70vh]">
            {connectedUsers.length != 0 &&
              connectedUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center mb-2 p-2 bg-gray-50 rounded-lg"
                >
                  <ChatBubbleAvatar
                    src={user.avatar}
                    fallback={user.username[0].toUpperCase()}
                  />
                  <span className="font-medium">{user.username}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {!activeRoom.chatRoomId ? (
        <div
          className="chat w-[60vw] h-[60vh] border-solid 
        border-2 border-gray-200 
        rounded-lg shadow-lg bg-white
        flex justify-center items-center
        font-bold text-5xl family-sans text-gray-500"
        >
          Select room ...
        </div>
      ) : (
        <div className="chat mx-3 min-w-[90vw] max-w-[90vw] sm:min-w-[60vw] sm:max-w-[60vw] max-h-[90vh] min-h-[90vh] border-solid border-2 border-gray-200 rounded-lg shadow-lg bg-white flex flex-col break-words">
          <div className="flex items-center justify-center p-4 border-b h-[10%]">
            <ChatBubbleAvatar src={activeRoom.icon}></ChatBubbleAvatar>
            <h2 className="text-xl font-semibold">{activeRoom.name}</h2>
          </div>
          <div className="question p-4 border-b  bg-gray-100 flex flex-col gap-3 items-center justify-center">
            <h3 className="questiontext text-lg font-medium select-none">
              {activeQuestion
                ? `${activeQuestion.question}`
                : "Waiting for the next question..."}
            </h3>

            <div className="ml-4 p-1 bg-yellow-200 rounded-md text-lg font-medium whitespace-pre select-none">
              {activeQuestion?.answer
                ? 'Answer was "' + activeQuestion.answer + '"'
                : activeQuestion?.clue
                ? `${activeQuestion.clue}`
                : "?"}
            </div>
          </div>
          <ChatMessageList className="h-auto max-h-[57vh]">
            {messages.map((message, index) => {
              return (
                <ChatBubble key={message.messageId} layout="ai">
                  <ChatBubbleAvatar
                    src={message.avatar}
                    fallback={message.username[0].toUpperCase()}
                    className="w-16 h-16"
                  />
                  {message.isCorrect ? (
                    <ChatBubbleMessage className="bg-green-100">
                      {message.username}:{message.message}
                    </ChatBubbleMessage>
                  ) : (
                    <ChatBubbleMessage>
                      <b>{message.username}</b> : {message.message}
                    </ChatBubbleMessage>
                  )}
                </ChatBubble>
              );
            })}
          </ChatMessageList>
          <form
            className=" relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
            onSubmit={handleSendMessage}
          >
            <ChatInput
              placeholder="Type your message here..."
              className="h-[2rem] !text-lg resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0 "
              value={inputValue} // Added controlled input
              onChange={(e) => setInputValue(e.target.value)} // Added onChange handler
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e); // Call send message on Enter
                }
              }}
            />
            <div className="flex items-center p-3 pt-0">
              <Button size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
