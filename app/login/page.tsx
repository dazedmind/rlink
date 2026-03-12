"use client";
import React, { useState, useEffect } from "react";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import rlandLogo from "@/public/rland-logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck } from "lucide-react";
import TextInput from "@/components/ui/TextInput";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Logic unchanged ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.includes("@rland.ph")) {
      toast.error("Invalid email. Please use your employee email.");
      return;
    }
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
    router.push("/home");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleValidateEmail();
    }, 1000);
    return () => clearTimeout(timer);
  }, [email]);

  const handleValidateEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail !== "" && !trimmedEmail.endsWith("@rland.ph")) {
      setErrorMsg("Invalid email. Please use your employee email.");
    } else {
      setErrorMsg("");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-center w-[52%] relative overflow-hidden bg-slate-900 p-12">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Center headline */}
        <div className="relative space-y-6 px-12">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5">
            <ShieldCheck size={13} className="text-blue-400" />
            <span className="text-blue-400 text-xs font-medium tracking-wide uppercase">
              RLink
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Centralized
            <br />
            <span className="text-blue-400">Access</span> Platform
          </h1>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm space-y-7">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-6">
              <Image src={rlandLogo} alt="RLand Logo" width={80} height={80} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500">
              Sign in to your employee account to continue
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <Field>
              <TextInput
                label="Employee Email"
                name="email"
                type="text"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </Field>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
            )}

            <Field>
              <TextInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <span className="text-xs text-blue-600 cursor-pointer hover:underline font-medium">
                Forgot password?
              </span>
            </Field>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm text-slate-500 cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            For employee access only · Property of RLand Develoment Inc.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
