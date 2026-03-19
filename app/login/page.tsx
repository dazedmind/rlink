"use client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import rlandLogo from "@/public/rland-logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AlertCircle, ShieldCheck } from "lucide-react";
import TextInput from "@/components/ui/TextInput";

function LoginPage() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authClient.signIn.email({ email, password }),
    onSuccess: (result) => {
      if (!result.error) {
        router.push("/home");
      }
    },
    onError: (err) => {
      console.error("[sign-in error]", err);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const trimmedEmail = value.email.trim().toLowerCase();
      if (!trimmedEmail.includes("@rland.ph")) {
        toast.error("Please use your employee email (@rland.ph)");
        return;
      }
      loginMutation.mutate({ email: trimmedEmail, password: value.password });
    },
  });

  const errorMsg = loginMutation.data?.error?.message ?? null;
  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-center w-[52%] relative overflow-hidden bg-slate-900 p-12">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-7">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-6">
              <Image src={rlandLogo} alt="RLand Logo" width={80} height={80} />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your employee account to continue
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Subscribe
              selector={(state) => ({
                emailValue: state.values.email || "",
                passwordValue: state.values.password || "",
                emailErrors: state.fieldMeta.email?.errors || [],
              })}
            >
              {({ emailValue, passwordValue, emailErrors }) => {
                const trimmedEmail = emailValue.trim().toLowerCase();
                const isEmailValid = trimmedEmail.endsWith("@rland.ph") && emailErrors.length === 0;
                const hasPassword = passwordValue.length > 0;
                const isFormValid = isEmailValid && hasPassword;

                return (
                  <>
                    <form.Field
                      name="email"
                      validators={{
                        onChange: ({ value }) => {
                          const trimmed = value.trim().toLowerCase();
                          if (trimmed !== "" && !trimmed.endsWith("@rland.ph")) {
                            return "Please use your employee email";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <Field>
                          <TextInput
                            label="Employee Email"
                            name="email"
                            type="text"
                            placeholder="Enter your email"
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value}
                            validationType="none"
                          />
                          {field.state.meta.errors.length > 0 && (
                            <span className="text-xs text-destructive">
                              {field.state.meta.errors[0]}
                            </span>
                          )}
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="password">
                      {(field) => (
                        <Field>
                          <TextInput
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value}
                          />
                          <span className="text-xs text-primary cursor-pointer hover:underline font-medium">
                            Forgot password?
                          </span>
                        </Field>
                      )}
                    </form.Field>

                    {errorMsg && (
                      <div
                        role="alert"
                        className="flex items-center gap-2 rounded-lg bg-destructive/5 px-3 py-2.5 text-xs text-destructive animate-in fade-in-50 slide-in-from-top-1 duration-200"
                      >
                        <AlertCircle className="size-4 text-destructive" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground cursor-pointer select-none"
                      >
                        Remember me for 30 days
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
                      disabled={isPending || !isFormValid}
                    >
                      {isPending ? (
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
                  </>
                );
              }}
            </form.Subscribe>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            For employee access only · Property of RLand Development Inc.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;