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
import { useTheme } from "next-themes";
import { Sun } from "lucide-react";
import { Moon } from "lucide-react";
import { Monitor } from "lucide-react";

const themes = [
  {
    name: "Light",
    icon: Sun,
    value: "light",
    color: "bg-neutral-50",
  },
  {
    name: "Dark",
    icon: Moon,
    value: "dark",
    color: "bg-neutral-800",
  },
  {
    name: "System",
    icon: Monitor,
    value: "system",
    color: "bg-neutral-400",
  },
];

function AppearanceTabContent() {
  const { theme: currentTheme, setTheme } = useTheme();

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setTheme(theme.value)}
                    className={`border-2 ${theme.value === currentTheme ? "border-blue-600" : "border-transparent"} p-3 rounded-lg flex flex-col items-center gap-2 cursor-pointer`}
                  >
                    <div
                      className={`flex items-center justify-center w-full h-40 ${theme.color} border rounded-lg`}
                    >
                      <theme.icon className="size-10 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{theme.name}</span>
                  </button>
                ))}
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
