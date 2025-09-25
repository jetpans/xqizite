"use client";
import { useUser } from "@/context/UserContext";
import { Button } from "./ui/button";
import { ChatBubbleAvatar } from "./ui/chat/chat-bubble";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();

  return (
    <header className="p-4 bg-gray-100 border-b shadow-sm flex flex-row justify-between items-center flex-wrap">
      <div className="cursor-pointer text-lg font-bold select-none flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-8 inline mr-2"
          onClick={() => {
            router.push("/");
          }}
        />
        {user && (
          <Button
            onClick={() => {
              router.push("/room");
            }}
          >
            Rooms
          </Button>
        )}
      </div>
      <div className="flex items-center">
        {user ? (
          <>
            <span className="mr-4">Hello, {user.username}</span>
            <ChatBubbleAvatar
              src={user ? user.avatar : undefined}
              fallback={user ? user.username[0].toUpperCase() : undefined}
              className="mr-4 w-10 h-10"
            />
          </>
        ) : (
          <span className="text-gray-600">Not logged in</span>
        )}
      </div>
      {user && (
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button onClick={() => router.push("/profile")}>Edit profile</Button>
          <Button
            onClick={logout}
            className="text-white bg-blue-500 hover:bg-blue-900"
          >
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
