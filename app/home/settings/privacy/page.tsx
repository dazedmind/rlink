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
import { setPasswordAction } from "@/lib/setpassword";
import Footer from "@/components/layout/Footer";
import TextInput from "@/components/ui/TextInput";
import { HelpCircle, Check, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function PrivacyTabContent() {
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Password Validation Logic ---
  const requirements = useMemo(() => [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "Number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "Special character (!@#$...)", met: /[^A-Za-z0-9]/.test(newPassword) },
  ], [newPassword]);

  const metCount = requirements.filter(r => r.met).length;
  const isStrong = metCount === requirements.length;

  const strengthColor = () => {
    if (metCount === 0) return "bg-neutral-200";
    if (metCount <= 2) return "bg-red-500";
    if (metCount <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  useEffect(() => {
    const checkProvider = async () => {
      const { data: accounts } = await authClient.listAccounts();
      const hasCredential = accounts?.some(
        (a) => a.providerId === "credential" || a.providerId === "email-password",
      );
      setIsPasswordSet(hasCredential ?? false);
    };
    checkProvider();
  }, []);

  const handleChangePassword = async () => {
    setErrorMsg("");

    if (!isStrong) {
      setErrorMsg("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    // ... rest of your existing submission logic
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
    } catch (e) {
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
            <CardDescription>Control your password and authentication methods.</CardDescription>
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

                {/* Password Strength Meter */}
                <div className="h-1.5 w-full bg-muted rounded-full my-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strengthColor()}`} 
                    style={{ width: `${(metCount / requirements.length) * 100}%` }}
                  />
                </div>
                <span className="flex items-center justify-between gap-1">
                  <p className="text-xs text-muted-foreground">
                    Strength: {metCount <= 2 ? "Weak" : metCount <= 4 ? "Medium" : "Strong"}
                  </p>
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="p-3 w-48">
                        <p className="font-bold mb-2 text-xs">Password Requirements:</p>
                        <ul className="space-y-1">
                          {requirements.map((req, i) => (
                            <li key={i} className={`flex items-center gap-2 text-xs ${req.met ? "text-green-500" : "text-muted-foreground"}`}>
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-neutral-500">Secure your account with an authentication app.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <footer><Footer /></footer>
    </Tabs>
  );
}

export default PrivacyTabContent;