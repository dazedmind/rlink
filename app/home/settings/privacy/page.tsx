"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";
import TextInput from "@/components/ui/TextInput";
import { HelpCircle, Check, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QRCode from "react-qr-code";
import { setPasswordAction } from "@/lib/setpassword";
import { passwordStrengthMeta } from "@/app/utils/password-strength";

function PrivacyTabContent() {
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const twoFactorEnabled = Boolean(
    session?.user &&
      "twoFactorEnabled" in session.user &&
      (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
  );

  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [loading, setLoading] = useState(false);

  const [mfaStep, setMfaStep] = useState<
    null | "enable-password" | "enable-scan" | "disable-password"
  >(null);
  const [mfaPassword, setMfaPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  const { requirements, metCount, isStrong, strengthLabel, barColor } =
    useMemo(() => passwordStrengthMeta(newPassword), [newPassword]);

  useEffect(() => {
    const checkProvider = async () => {
      const { data: accounts } = await authClient.listAccounts();
      const hasCredential = accounts?.some(
        (a) =>
          a.providerId === "credential" || a.providerId === "email-password",
      );
      setIsPasswordSet(hasCredential ?? false);
    };
    checkProvider();
  }, []);

  const resetMfaFlow = () => {
    setMfaPassword("");
    setTotpUri("");
    setBackupCodes([]);
    setVerifyCode("");
    setMfaStep(null);
    setMfaBusy(false);
  };

  const handleMfaSwitch = (checked: boolean) => {
    if (!isPasswordSet) {
      toast.error("Set a password on your account before enabling 2FA.");
      return;
    }
    if (checked) {
      setMfaStep("enable-password");
    } else {
      if (!twoFactorEnabled) {
        resetMfaFlow();
        return;
      }
      setMfaStep("disable-password");
    }
  };

  const handleEnableStart = async () => {
    if (!mfaPassword.trim()) {
      toast.error("Enter your current password.");
      return;
    }
    setMfaBusy(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: mfaPassword,
        issuer: "R Link",
      });
      if (error) {
        toast.error(error.message ?? "Could not start 2FA setup.");
        return;
      }
      if (data?.totpURI && data.backupCodes?.length) {
        setTotpUri(data.totpURI);
        setBackupCodes(data.backupCodes);
        setMfaStep("enable-scan");
        setMfaPassword("");
        toast.success("Scan the QR code, then enter a code to finish.");
      }
    } finally {
      setMfaBusy(false);
    }
  };

  const handleVerifyTotp = async () => {
    const code = verifyCode.trim().replace(/\s/g, "");
    if (code.length < 6) {
      toast.error("Enter the 6-digit code from your app.");
      return;
    }
    setMfaBusy(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: false,
      });
      if (error) {
        toast.error(error.message ?? "Invalid code.");
        return;
      }
      toast.success("Two-factor authentication is enabled.");
      await refetchSession();
      resetMfaFlow();
    } finally {
      setMfaBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!mfaPassword.trim()) {
      toast.error("Enter your current password.");
      return;
    }
    setMfaBusy(true);
    try {
      const { error } = await authClient.twoFactor.disable({
        password: mfaPassword,
      });
      if (error) {
        toast.error(error.message ?? "Could not disable 2FA.");
        return;
      }
      toast.success("Two-factor authentication is disabled.");
      await refetchSession();
      resetMfaFlow();
    } finally {
      setMfaBusy(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorMsg("");

    if (!isStrong) {
      setErrorMsg("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      if (!isPasswordSet) {
        const result = await setPasswordAction(newPassword);
        if (!result.success) setErrorMsg(result.message);
        else {
          toast.success(result.message);
          setIsPasswordSet(true);
          setNewPassword("");
        }
      } else {
        const { error } = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });
        if (error) setErrorMsg(error.message ?? "Failed to change password.");
        else {
          toast.success("Password changed successfully.");
          setCurrentPassword("");
          setNewPassword("");
        }
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="privacy">
      <TabsContent value="privacy" className="mt-0 focus-visible:outline-none">
        <Card className="border-border border">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">Privacy & Security</CardTitle>
            <CardDescription>
              Control your password and authentication methods.
            </CardDescription>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 max-w-md relative">
              <TextInput
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="Enter Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <div className="space-y-2 relative">
                <TextInput
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="Enter Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <div className="h-1.5 w-full bg-muted rounded-full my-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${barColor}`}
                    style={{
                      width: `${(metCount / requirements.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="flex items-center justify-between gap-1">
                  <p className="text-xs text-muted-foreground">
                    Strength: {strengthLabel}
                  </p>
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <HelpCircle
                          size={16}
                          className="text-muted-foreground cursor-help"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="p-3 w-48">
                        <p className="font-bold mb-2 text-xs">
                          Password Requirements:
                        </p>
                        <ul className="space-y-1">
                          {requirements.map((req, i) => (
                            <li
                              key={i}
                              className={`flex items-center gap-2 text-xs ${req.met ? "text-green-500" : "text-muted-foreground"}`}
                            >
                              {req.met ? (
                                <Check size={12} />
                              ) : (
                                <Circle size={10} />
                              )}
                              {req.label}
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </div>
              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={loading || (newPassword.length > 0 && !isStrong)}
              className="w-fit bg-blue-600 hover:bg-blue-700 mt-2"
            >
              {loading ? "Processing..." : "Change Password"}
            </Button>

            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Two-Factor Authentication (2FA)
                  </p>
                  <p className="text-xs text-neutral-500">
                    Use an authenticator app (Google Authenticator, Authy, etc.).
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleMfaSwitch}
                  disabled={!isPasswordSet}
                />
              </div>

              {mfaStep === "enable-password" && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4 max-w-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">
                      Enable two-factor authentication
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Enter your password to generate a secret and QR code.
                    </p>
                  </div>
                  <TextInput
                    label="Current password"
                    name="mfaPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={mfaPassword}
                    onChange={(e) => setMfaPassword(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetMfaFlow}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleEnableStart}
                      disabled={mfaBusy}
                    >
                      {mfaBusy ? "Working…" : "Continue"}
                    </Button>
                  </div>
                </div>
              )}

              {mfaStep === "enable-scan" && (
                <div className="rounded-lg border border-border bg-accent/30 p-4 space-y-4 ">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">Scan & verify</h3>
                    <p className="text-xs text-muted-foreground">
                      Scan this QR with your authenticator app. Save your backup
                      codes in a safe place, then enter a 6-digit code to
                      confirm.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {totpUri ? (
                      <div className="rounded-lg border bg-white p-3">
                        <QRCode value={totpUri} size={180} />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-4 w-full">
                      <div className="w-full space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Backup codes (one-time use each)
                        </p>
                        <div className="rounded-md border bg-muted/40 p-3 font-mono text-xs grid grid-cols-2 gap-1">
                          {backupCodes.map((c) => (
                            <span key={c}>{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="w-full">
                        <TextInput
                          label="6-digit code"
                          name="verifyCode"
                          type="text"
                          placeholder="000000"
                          value={verifyCode}
                          onChange={(e) =>
                            setVerifyCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                        />
                      </div>
                    </div>
                  
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetMfaFlow}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleVerifyTotp}
                      disabled={mfaBusy || verifyCode.length < 6}
                    >
                      {mfaBusy ? "Verifying…" : "Verify & enable"}
                    </Button>
                  </div>
                </div>
              )}

              {mfaStep === "disable-password" && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4 max-w-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">
                      Disable two-factor authentication
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Enter your password to turn off 2FA for this account.
                    </p>
                  </div>
                  <TextInput
                    label="Current password"
                    name="mfaDisablePassword"
                    type="password"
                    placeholder="Enter your password"
                    value={mfaPassword}
                    onChange={(e) => setMfaPassword(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetMfaFlow}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDisable}
                      disabled={mfaBusy}
                    >
                      {mfaBusy ? "Working…" : "Disable 2FA"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <footer>
        <Footer />
      </footer>
    </Tabs>
  );
}

export default PrivacyTabContent;
