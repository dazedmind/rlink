"use client";
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
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

function PrivacyTabContent() {

  return (
    <div>
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
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter New Password" />
              </div>
              <Button variant="outline" className="w-fit">
                Change Password
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
    </div>
  );
}

export default PrivacyTabContent;
