"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import rlandLogo from "@/public/rland-logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message ?? "Invalid email or password";
      setErrorMsg(msg);
      toast.error(msg);
      console.error("[sign-in error]", error);
      return;
    }
    toast.success("Login successful");
    router.push("/home");
  };

  const handleGoogleLogin = async () => {
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/home" });
    if (error) {
      toast.error(error.message ?? "Failed to sign in with Google");
      return;
    }
  };

  return (
    <div className="h-screen w-full">
      {/* <NavBar /> */}

      <main className="flex items-center justify-center h-screen w-full">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-start justify-center h-screen shadow-md w-1/2  bg-linear-to-tr from-primary to-primary-fg">
          <div className=" justify-center gap-2 p-20 text-white">
            <h1 className="text-5xl font-bold text-white">RLink Access</h1>
            <p className="text-xl text-neutral-400">
              Centralized Access Platform for RLink
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-center justify-center h-screen rounded-lg shadow-md p-4 border-border border w-1/2">
          {/* LOGIN CARD */}
          <div className="flex flex-col items-center justify-center gap-6 border-border border p-8 rounded-lg w-1/2">
            <Image src={rlandLogo} alt="Logo" width={150} height={150} />
            <span className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-primary">RLink Access</h1>
              <p className="text-sm text-gray-500">
                Please login with your employee email to continue
              </p>
            </span>

            <form className="flex flex-col w-full gap-4" onSubmit={handleLogin}>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel>Employee Email</FieldLabel>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  placeholder="jdelacruz@rland.ph"
                  className="w-full p-2 rounded-md text-black"
                />
              </Field>

              <Field className="col-span-2 md:col-span-1">
                <FieldLabel>Password</FieldLabel>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter Password"
                  className="w-full p-2 rounded-md text-black"
                />
              </Field>

              <div className="flex items-center justify-between gap-2">
                <span className="flex flex-row items-center gap-2">
                  <Checkbox />
                  <p className="text-sm text-gray-500">Remember Me</p>
                </span>
                <span className="flex flex-row items-center gap-2">
                  <p className="text-sm text-primary cursor-pointer">
                    Forgot Password?
                  </p>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Login"}
              </Button>
            </form>

            <Button
              variant="outline"
              className="w-full p-2 bg-white text-black rounded-md"
              onClick={handleGoogleLogin}
            >
              <FcGoogle />
              Sign in with Google
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
