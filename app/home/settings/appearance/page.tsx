"use client";
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/layout/Footer";

function AppearanceTabContent() {  
  return (
    <Tabs defaultValue="appearance">
      <TabsContent value="appearance" className="mt-0">
        <Card>
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">Appearance</CardTitle>
            <CardDescription>
              Customize how RLink looks on your screen.
            </CardDescription>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme Preference</Label>
              <div className="grid grid-cols-3 gap-4">
                <button className="border-2 border-blue-600 p-3 rounded-lg flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-white border rounded-lg" />
                  <span className="text-xs font-medium">Light</span>
                </button>
                <button className="border p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-neutral-50">
                  <div className="w-full h-20 bg-neutral-900 border rounded-lg" />
                  <span className="text-xs font-medium">Dark</span>
                </button>
                <button className="border p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-neutral-50">
                  <div className="w-full h-20 bg-neutral-400 border rounded-lg" />
                  <span className="text-xs font-medium">System</span>
                </button>
              </div>
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

export default AppearanceTabContent;
