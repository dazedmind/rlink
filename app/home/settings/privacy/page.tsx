"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { setPasswordAction } from "@/lib/setpassword";

function PrivacyTabContent() {
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkProvider = async () => {
      const { data: accounts } = await authClient.listAccounts();
      console.log("accounts:", accounts); // ← add this
      const hasCredential = accounts?.some(
        (a) =>
          a.providerId === "credential" || a.providerId === "email-password",
      );
      setIsGoogleUser(!hasCredential);
      setIsPasswordSet(hasCredential ?? false);
    };
    checkProvider();
  }, []);

  const handleChangePassword = async () => {
    setErrorMsg("");

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    if (isGoogleUser) {
      // Google-first user: create a new credential account via setPassword
      try {
        const result = await setPasswordAction(newPassword);
        setLoading(false);
        if (!result.success) {
          setErrorMsg(result.message);
        } else {
          toast.success(result.message);
          setIsGoogleUser(false);
          setNewPassword("");
        }
      } catch (e: unknown) {
        setLoading(false);
        setErrorMsg(e instanceof Error ? e.message : "Failed to set password.");
      }
    } else {
      // Credential user: update existing password via client
      // if (!currentPassword) {
      //   setErrorMsg("Please enter your current password.");
      //   setLoading(false);
      //   return;
      // }
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      setLoading(false);
      if (error) {
        setErrorMsg(error.message ?? "Failed to change password.");
      } else {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
      }
    }
  };

  return (
    <Tabs defaultValue="privacy">
      <TabsContent value="privacy" className="mt-0 focus-visible:outline-none">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your password and authentication methods.
            </CardDescription>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 max-w-md">
              {!isPasswordSet ? (
                <div className="space-y-2">
                  <Label>Set Your Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}
              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
              <Button
                onClick={handleChangePassword}
                variant="outline"
                className="w-fit"
              >
                {isPasswordSet ? "Change Password" : "Set Password"}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-xs text-neutral-500">
                  Secure your account with an authentication app.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default PrivacyTabContent;
