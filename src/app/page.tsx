"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

import { loginFormSchema } from "@/lib/validation-schemas";
import dataController from "@/lib/DataController";
import { useUser } from "@/context/UserContext";
import { API_URL } from "@/constants";
import { useRouter } from "next/navigation"; // Use Next.js router for navigation
import { useEffect, useState } from "react";
import { randomAvatar, defaultAvatar } from "@/lib/utils";

const formSchema = loginFormSchema;
const guestFormSchema = z.object({
  guestname: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const guestForm = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      guestname: "",
    },
  });

  const [randomAvatarUrl, setRandomAvatarUrl] = useState<string>(defaultAvatar);

  const router = useRouter();

  const dc = new dataController();
  // Assuming useUser is a custom hook that provides user context
  const { user, login, logout } = useUser();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Assuming an async login function
      console.log(values);
      const loginData = {
        username: values.username,
        password: values.password,
      };

      dc.PostData(API_URL + "/login", loginData)
        .then((response) => {
          if (response.success === true && response.data.success === true) {
            localStorage.setItem("jwt", response.data.data.access_token);
            login(response.data.data.user);
            router.push("/room");
          } else {
            toast.error("Login failed. Please check your credentials.");
          }
        })
        .catch((response) => {
          toast.error("Login failed. Please check your credentials.");
        });

      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  async function onGuestSubmit(values: z.infer<typeof guestFormSchema>) {
    try {
      // Assuming an async login function
      console.log(values);
      const loginData = {
        guest: true,
        username: values.guestname,
        avatar: randomAvatarUrl,
      };
      dc.PostData(API_URL + "/login", loginData)
        .then((response) => {
          if (response.success === true && response.data.success === true) {
            localStorage.setItem("jwt", response.data.data.access_token);
            login(response.data.data.user);
            router.push("/room");
          } else {
            toast.error("Login failed. Please check your credentials.");
          }
        })
        .catch((response) => {
          toast.error("Login failed. Please check your credentials.");
        });
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  useEffect(() => {
    if (user !== null) {
      const accessToken = localStorage.getItem("jwt");
      if (accessToken === null) {
        logout();
      } else {
      }
    }
  }, [user]);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 sm:p-8 h-auto">
      <Card className=" p-8 sm:p-16 text-center">
        <CardTitle className="text-4xl font-bold mb-4">
          Welcome to XQZite
        </CardTitle>
        <CardContent className="text-lg text-gray-700">
          Your ultimate platform for engaging quizzes and interactive trivia.
          Dive into a world of fun and knowledge with XQZite! Made by jetpans.
          <br />
          <br />
          <div>
            <ul className="list-disc text-left">
              <li>Show your trivia knowledge to other users.</li>
              <li>Have a fun experience with your friends.</li>
              <li>Express yourself by designing your own avatar (new!).</li>
              <li>Progress and get special rewards (upcoming).</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {!user && (
        <>
          <Card className="">
            <CardContent>
              <Form {...guestForm}>
                <form
                  onSubmit={guestForm.handleSubmit(onGuestSubmit)}
                  className="space-y-8"
                >
                  <div className="grid gap-4">
                    <FormField
                      control={guestForm.control}
                      name="guestname"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormLabel htmlFor="guestname" className="text-2xl">
                            Guest username
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="guestname"
                              placeholder="gamer123"
                              type="text"
                              autoComplete="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Continue as Guest
                    </Button>
                  </div>
                </form>
              </Form>
              <div className="avatar-picker flex flex-col items-center mt-6">
                <img
                  src={randomAvatarUrl}
                  alt="Random Avatar"
                  className="w-32 h-32 rounded-full mx-auto mb-4 border border-gray-300"
                />
                <Button onClick={() => setRandomAvatarUrl(randomAvatar())}>
                  Randomize
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your username and password to login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormLabel htmlFor="username">Username</FormLabel>
                          <FormControl>
                            <Input
                              id="username"
                              placeholder="gamer123"
                              type="text"
                              autoComplete="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <FormLabel htmlFor="password" className="mr-[1rem]">
                              Password
                            </FormLabel>
                            <Link
                              href="#"
                              className="ml-auto inline-block text-sm underline"
                            >
                              Forgot your password?
                            </Link>
                          </div>
                          <FormControl>
                            <PasswordInput
                              id="password"
                              placeholder="******"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Login with Google
                    </Button>
                  </div>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      <Card className="p-2 sm:p-8 text-center">
        <CardTitle className="text-2xl font-bold mb-1">
          Upcoming Features
        </CardTitle>
        <CardContent className="text-lg text-gray-700">
          <ul className="list-disc list-inside space-y-2">
            <li>Progression: Rewards for doing well.</li>
            <li>Community questions: Submit your own questions for rewards.</li>
            <li>Profile customization: More options to express yourself.</li>
            <li>Style rework: New look for the new app.</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="p-2 sm:p-8 text-center">
        <CardTitle className="text-2xl font-bold mb-1">
          Check out the code
        </CardTitle>
        <CardContent className="text-lg text-gray-700 flex justify-center items-center">
          <a href="https://github.com/jetpans/xqizite">
            <img
              src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
              alt="GitHub Logo"
              className="w-48 h-48"
            />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
