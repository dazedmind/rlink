"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/ui/TextInput";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import rlandLogo from "@/public/rland-logo.png";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { guard, release } = useSubmitGuard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!guard()) return;
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await authClient.requestPasswordReset({
        email: trimmed,
        redirectTo: `${origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message ?? "Could not send reset email.");
        return;
      }
      toast.success("If an account exists for this email, we sent a reset link.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      release();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex items-center gap-3 mb-2">
          <Image src={rlandLogo} alt="RLand Logo" width={64} height={64} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your employee email. We&apos;ll send a link to reset your password.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@rland.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Send reset link
          </Button>
        </form>
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
