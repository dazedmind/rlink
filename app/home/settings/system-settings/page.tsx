"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

function SystemSettingsTabContent() {

  return (
    <Tabs defaultValue="system">
      <TabsContent value="system" className="mt-0">
        <Card>
          <CardHeader className="pb-4 flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">System Settings</CardTitle>
            <CardDescription>Configure your system settings.</CardDescription>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-neutral-500">
                  Receive weekly lead summaries via email.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Tracking</Label>
                <p className="text-xs text-neutral-500">
                  Allow system to collect anonymous usage data.
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

export default SystemSettingsTabContent;
