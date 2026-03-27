"use client";

import React, { useState, Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/ui/TextInput";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import rlandLogo from "@/public/rland-logo.png";
import { passwordStrengthMeta } from "@/app/utils/password-strength";
import { Check, Circle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null);

  const { requirements, metCount, isStrong, strengthLabel, barColor, total } =
    useMemo(() => {
      const m = passwordStrengthMeta(password);
      return { ...m, total: m.requirements.length };
    }, [password]);

  useEffect(() => {
    if (redirectSeconds === null) return;
    if (redirectSeconds <= 0) {
      router.push("/login");
      return;
    }
    const t = window.setTimeout(() => {
      setRedirectSeconds((s) => (s === null ? null : s - 1));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [redirectSeconds, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset link.");
      return;
    }
    if (!isStrong) {
      toast.error("Please meet all password requirements.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (error) {
        toast.error(error.message ?? "Could not reset password.");
        return;
      }
      toast.success("Password updated.");
      setPassword("");
      setConfirm("");
      setRedirectSeconds(5);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  if (errParam === "INVALID_TOKEN" || errParam === "invalid_token") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-primary font-medium hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">No reset token in this link.</p>
        <Link href="/forgot-password" className="text-primary font-medium hover:underline text-sm">
          Request a password reset
        </Link>
      </div>
    );
  }

  if (redirectSeconds !== null) {
    return (
      <div className="space-y-4 text-center py-2">
        <p className="text-sm text-muted-foreground">
          {redirectSeconds > 0
            ? `Redirecting to sign in in ${redirectSeconds}s…`
            : "Redirecting…"}
        </p>
        <Link href="/login" className="text-primary font-medium hover:underline text-sm">
          Go to sign in now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="New password"
        name="password"
        type="password"
        placeholder="Enter a strong password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="space-y-2">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{
              width: `${(metCount / total) * 100}%`,
            }}
          />
        </div>
        <span className="flex items-center justify-between gap-1">
          <p className="text-xs text-muted-foreground">Strength: {strengthLabel}</p>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <HelpCircle size={16} className="text-muted-foreground cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right" className="p-3 w-48">
                <p className="font-bold mb-2 text-xs">Password requirements</p>
                <ul className="space-y-1">
                  {requirements.map((req, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 text-xs ${req.met ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      {req.met ? <Check size={12} /> : <Circle size={10} />}
                      {req.label}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      </div>

      <TextInput
        label="Confirm password"
        name="confirm"
        type="password"
        placeholder="Repeat password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <Button
        type="submit"
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        disabled={pending || !isStrong || password !== confirm}
      >
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex items-center gap-3 mb-2">
          <Image src={rlandLogo} alt="RLand Logo" width={64} height={64} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Set new password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a strong password you haven&apos;t used elsewhere.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
