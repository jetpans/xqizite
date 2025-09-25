"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { defaultAvatar } from "@/lib/utils";

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

import { registerFormSchema } from "@/lib/validation-schemas";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import dataController from "@/lib/DataController";
import { API_URL } from "@/constants";
const formSchema = registerFormSchema;
import { useRouter } from "next/navigation"; // Use Next.js router for navigation
import { randomAvatar } from "@/lib/utils";

export default function RegisterPreview() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [randomAvatarUrl, setRandomAvatarUrl] = useState(defaultAvatar);
  const router = useRouter();

  const dc = new dataController();
  const { user, login, logout } = useUser();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Assuming an async registration function
      console.log(values);
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        avatar: randomAvatarUrl,
      };

      console.log("Wanted path is: ", API_URL + "/register");
      dc.PostData(API_URL + "/register", registerData)
        .then((response) => {
          if (response.success === true && response.data.success === true) {
            setTimeout(() => {
              router.push("/login");
            }, 1000);
          } else {
            toast.error("Registration failed. Please try again.");
          }
        })
        .catch((resp) => {
          toast.error("Registration failed. Please try again.");
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
      router.push("/room");
    }
  }, [user]);

  return (
    <div className="flex min-h-[60vh] h-full w-full items-center justify-center px-4 gap-[10vw]">
      <Card className="">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create a new account by filling out the form below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <FormControl>
                        <Input id="username" placeholder="Jetpans" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirmPassword"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className="">
        <CardContent>
          <CardTitle className="text-2xl">Choose avatar</CardTitle>
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
    </div>
  );
}
