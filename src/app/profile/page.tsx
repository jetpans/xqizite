"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { randomAvatar } from "@/lib/utils";
import { useState, useEffect } from "react";
import AvatarCustomizer from "@/components/AvatarCustomizer";
import { buildAvatarUrl, AvatarOptions } from "@/lib/utils";
import dataController from "@/lib/DataController";
import { API_URL } from "@/constants";
import { toast } from "sonner";

export default function Home() {
  const { user, login, logout } = useUser();
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || "");
  const [initial, setInitial] = useState<Partial<AvatarOptions>>({});

  const dc = new dataController();
  const handleSubmit = () => {
    if (user) {
      dc.PostData(
        API_URL + "/updateProfile",
        {
          username: user.username,
          avatar: currentAvatar,
        },
        localStorage.getItem("jwt")
      ).then((response) => {
        if (response.success && response.data.success) {
          // Update user context
          login({ ...user, avatar: currentAvatar });
          toast.success("Profile updated successfully!");
        } else {
          alert("Failed to update profile: " + response.data.data.message);
        }
      });
    }
  };
  useEffect(() => {
    if (user?.avatar) {
      setCurrentAvatar(user.avatar);
    }
    // Parse avatar URL to extract initial options
    if (user?.avatar) {
      const url = new URL(user.avatar);
      const params = url.searchParams;
      const opts: Partial<AvatarOptions> = {};
      params.forEach((value, key) => {
        opts[key as keyof AvatarOptions] = value;
      });
      setInitial(opts);
      console.log("Initial avatar options:", opts);
    }
  }, [user]);
  return (
    <div className="p-4 flex flex-row justify-center items-start min-h-screen flex-wrap gap-8">
      <Card className="max-w-md mt-10 flex flex-row items-center justify-center">
        <CardContent>
          <CardTitle className="text-2xl text-center">Choose avatar</CardTitle>
          <div className="avatar-picker flex flex-col items-center mt-6">
            <img
              src={currentAvatar}
              alt="Random Avatar"
              className="w-32 h-32 rounded-full mx-auto mb-4 border border-gray-300"
            />
            <Button onClick={() => setCurrentAvatar(randomAvatar())}>
              Randomize
            </Button>
          </div>
        </CardContent>
      </Card>
      {Object.keys(initial).length > 0 && (
        <AvatarCustomizer
          initial={initial}
          onChange={(opts) => {
            const url = buildAvatarUrl(opts);
            setCurrentAvatar(url);
          }}
          className="max-w-md  mt-10"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
