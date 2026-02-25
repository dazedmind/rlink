"use client";
import React, { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ProtectedRoute from "@/components/utils/ProtectedRoute";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Monitor,
  Palette,
  Camera,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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

  const handleSaveProfile = async () => {
    const { error } = await authClient.updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      employeeId: formData.employeeId,
      birthdate: formData.birthdate,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-neutral-50/50">
        <main className="flex flex-col gap-8 p-8 px-8 md:px-16 lg:px-24 xl:px-44 h-screen">
          <DashboardHeader title="RLink" description="" />

          <div className="flex gap-8 flex-col justify-between h-full">
            <div className="flex gap-8 flex-col h-full">
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
                className="flex flex-col xl:flex-row gap-10"
              >
                {/* LEFT SIDEBAR SELECTOR */}
                <TabsList className="flex flex-col h-auto bg-transparent gap-1 items-start w-full md:w-64 border-none p-0">
                  {navigation.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all"
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
        
            
            <footer>
              <Footer />
            </footer>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Settings;
