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
import { Check, Sun } from "lucide-react";
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
                    className={`group border-2 transition-all duration-200 ${
                      theme.value === currentTheme
                        ? "border-blue-600"
                        : "border-transparent"
                    } p-3 rounded-xl flex flex-col items-center gap-3 cursor-pointer`}
                  >
                    <div
                      className={`relative flex items-center justify-center w-full h-40 rounded-lg overflow-hidden border border-border/50 ${theme.color}`}
                    >
                      {theme.value === "system" ? (
                        <>
                          {/* The Diagonal Split: Hard edge at 50% */}
                          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(135deg,white_50%,#171717_50%)] dark:bg-[linear-gradient(135deg,#0a0a0a_50%,#e5e5e5_50%)]" />

                          {/* Center Icon with a backdrop so it's visible on both colors */}
                          <div className="relative z-10 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                            <theme.icon className="size-10 text-white dark:text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="relative z-10 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                        <theme.icon className="size-10 text-muted-foreground" />
                      </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-700">
                        {theme.name}
                      </span>
                      {theme.value === currentTheme && (
                        <div className="flex items-center justify-center size-5 bg-blue-600 rounded-full">
                          <Check
                            className="size-3 text-white"
                            strokeWidth={4}
                          />
                        </div>
                      )}
                    </div>
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
