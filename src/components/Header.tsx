"use client";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="p-4 bg-gray-100 border-b shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between">
        <div className="text-lg font-bold">XQZite</div>
        <div>
          {user ? (
            <>
              <span className="mr-4">Hello, {user.username}</span>
              <button onClick={logout} className="text-blue-500">
                Logout
              </button>
            </>
          ) : (
            <span className="text-gray-600">Not logged in</span>
          )}
        </div>
      </div>
    </header>
  );
}
