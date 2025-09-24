"use client";
import { useUser } from "@/context/UserContext";
import { Button } from "./ui/button";
import { ChatBubbleAvatar } from "./ui/chat/chat-bubble";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="p-4 bg-gray-100 border-b shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between">
        <div className="text-lg font-bold">XQZite</div>
        <div className="flex items-center">
          {user ? (
            <>
              <span className="mr-4">Hello, {user.username}</span>
              <ChatBubbleAvatar
                src={user ? user.avatar : undefined}
                fallback={user ? user.username[0].toUpperCase() : undefined}
                className="mr-4"
              />
            </>
          ) : (
            <span className="text-gray-600">Not logged in</span>
          )}
        </div>
        {user && (
          <Button
            onClick={logout}
            className="text-white bg-blue-500 hover:bg-blue-900"
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
