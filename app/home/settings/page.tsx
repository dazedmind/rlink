"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Monitor,
  Palette,
  ArrowLeft,
  Menu,
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SystemSettingsTabContent from "./system-settings/page";
import PrivacyTabContent from "./privacy/page";
import PersonalInfoTabContent from "./personal/page";
import AppearanceTabContent from "./appearance/page";

const navigation = [
  { value: "personal", label: "Personal Information", icon: User },
  { value: "privacy", label: "Privacy & Security", icon: Shield },
  { value: "system", label: "System Settings", icon: Monitor },
  { value: "appearance", label: "Appearance", icon: Palette },
];

function Settings() {
  const { data: session } = useSession();
  const [tab, setTab] = useState('personal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: session?.user.firstName ?? '',
    lastName: session?.user.lastName ?? '',
    middleName: session?.user.middleName ?? '',
    phone: session?.user.phone ?? '',
    position: session?.user.position ?? '',
    department: session?.user.department ?? '',
    employeeId: session?.user.employeeId ??   '',
    birthdate: session?.user.birthdate ?? '',
  });

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  return (
    <ProtectedRoute>
      <div className="scrollbar-accent h-dvh overflow-y-auto overflow-x-hidden w-full bg-accent">
        <main className="flex flex-col gap-8 p-8 px-8 md:px-16 lg:px-24 xl:px-44 h-full">
          <DashboardHeader title="RLink" description="" />

          <div className="flex gap-8 flex-col justify-between h-full">
            <div className="flex gap-8 flex-col h-full">
              {/* Mobile menu bar - visible only on small screens */}
              <header className="sticky top-0 z-40 flex lg:hidden items-center gap-3 border-b bg-accent px-4 py-3 -mx-8 mb-4">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-9">
                      <Menu className="size-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1 p-4">
                      {navigation.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            setTab(item.value);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                            tab === item.value
                              ? "bg-accent shadow-sm text-blue-600 font-medium"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <item.icon className="size-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
                <span className="text-lg font-bold">{navigation.find(item => item.value === tab)?.label}</span>
              </header>

              <span className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-2xl font-bold">
                  <span>
                    <Link href="/home" className="text-sm text-muted-foreground">
                      <ArrowLeft className="size-6" />
                    </Link>
                  </span>
                  Settings
                </span>
                <p className="text-sm text-muted-foreground">
                  Manage your RLink account preferences and system configuration.
                </p>
              </span>
              <Tabs
                defaultValue="personal"
                orientation="vertical"
                className="flex flex-row xl:flex-row gap-4  w-full h-full"
              >
                {/* LEFT SIDEBAR SELECTOR - hidden on mobile */}
                <TabsList className="hidden lg:flex h-auto bg-transparent items-start border-none p-0">
                  {navigation.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className="w-full text-sm justify-start gap-3 px-4 py-3 data-[state=active]:text-blue-600 data-[state=active]:font-bold data-[state=active]:bg-blue-500/5 transition-all cursor-pointer"
                      onClick={() => setTab(item.value)}
                    >
                      <item.icon className="size-4" />
                      <span className="font-medium">{item.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* RIGHT CONTENT PANEL */}
                <div className="flex-1">
                  {/* PERSONAL INFO */}
                  {tab === 'personal' && <PersonalInfoTabContent />}
                  {tab === 'privacy' && <PrivacyTabContent />}
                  {tab === 'system' && <SystemSettingsTabContent />}
                  {tab === 'appearance' && <AppearanceTabContent />}
                </div>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Settings;
