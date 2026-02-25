"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import rlandLogo from "@/public/rland-logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.firstName || !form.lastName) {
      setErrorMsg("First and last name are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: form.email,
      password: form.password,
      name: `${form.firstName} ${form.lastName}`.trim(),
      // Additional profile fields picked up by inferAdditionalFields
      firstName: form.firstName,
      lastName: form.lastName,
    });
    setLoading(false);

    if (error) {
      const msg = error.message ?? "Sign up failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    toast.success("Account created! Please sign in.");
    router.push("/login");
  };

  const handleGoogleSignUp = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home",
    });
    if (error) {
      toast.error(error.message ?? "Failed to sign up with Google");
    }
  };

  return (
    <div className="h-screen w-full">
      <main className="flex items-center justify-center h-screen w-full">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-start justify-center h-screen shadow-md w-1/2 bg-linear-to-tr from-primary to-primary-fg">
          <div className="justify-center gap-2 p-20 text-white">
            <h1 className="text-5xl font-bold text-white">RLink Access</h1>
            <p className="text-xl text-neutral-400">
              Centralized Access Platform for RLink
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-center justify-center h-screen rounded-lg shadow-md p-4 border-border border w-1/2 overflow-y-auto">
          {/* SIGN-UP CARD */}
          <div className="flex flex-col items-center justify-center gap-6 border-border border p-8 rounded-lg w-1/2 my-8">
            <Image src={rlandLogo} alt="Logo" width={120} height={120} />

            <span className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-primary">Create Account</h1>
              <p className="text-sm text-gray-500 text-center">
                Register with your employee email to get access
              </p>
            </span>

            <form className="flex flex-col w-full gap-4" onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <Input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Juan"
                    className="w-full p-2 rounded-md text-black"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Dela Cruz"
                    className="w-full p-2 rounded-md text-black"
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Employee Email</FieldLabel>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="jdelacruz@rland.ph"
                  className="w-full p-2 rounded-md text-black"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full p-2 rounded-md text-black"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full p-2 rounded-md text-black"
                  required
                />
              </Field>

              {errorMsg && (
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              )}

              <Button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full p-2 bg-white text-black rounded-md"
              onClick={handleGoogleSignUp}
              type="button"
            >
              <FcGoogle />
              Sign up with Google
            </Button>

            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignUpPage;
