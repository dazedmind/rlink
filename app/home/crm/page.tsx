"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import rlandLogo from "@/public/rland-logo.png";
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  Box, 
  MessageCircle, 
  Mail 
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import Reservation from "./reservation/page";
import LeadGeneration from "./lead-generation/page";
import Inventory from "./inventory/page";
import CRMDashboard from "./dashboard/page";
import { useRouter } from "next/navigation";
import Inquiries from "./inquiries/page";
import Newsletter from "./newsletter/page";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "dashboard", group: "CRM Menu" },
  { title: "Inventory", icon: Box, url: "inventory", group: "CRM Menu" },
  { title: "Reservation", icon: Calendar, url: "reservation", group: "CRM Menu" },
  { title: "Digital Sales Lead", icon: User, url: "lead-generation", group: "CRM Menu" },
  { title: "Inquiries", icon: MessageCircle, url: "inquiries", group: "Inbox" },
  { title: "Newsletter", icon: Mail, url: "newsletter", group: "Inbox" },
];

export default function CrmSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();

  // 1. Grouping Logic: Reduces navItems into an object keyed by group name
  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <SidebarProvider className="bg-neutral-100">
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="bg-neutral-100 p-4 border-none"
      >
        <SidebarHeader className="py-4">
          <div className="flex flex-col items-start gap-3 px-2">
            <Image src={rlandLogo} alt="Logo" width={100} height={100} />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* 2. Map over the groups */}
          {Object.entries(groupedNav).map(([groupName, items]) => (
            <SidebarGroup key={groupName}>
              <SidebarGroupLabel className="text-xs font-bold uppercase text-neutral-500">
                {groupName}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={activeTab === item.url}
                        className={`transition-all ${
                          activeTab === item.url
                            ? "bg-white border border-border shadow-sm font-medium"
                            : "hover:bg-neutral-200"
                        }`}
                        onClick={() => setActiveTab(item.url)}
                      >
                        <item.icon className="size-5" />
                        <span className="text-sm">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/home" className="flex items-center gap-2 text-blue-600 hover:opacity-80 transition-opacity">
                <span className="bg-neutral-200 p-2 rounded-full">
                  <HiOutlineSquares2X2 className="size-6" />
                </span>
                <span className="text-sm font-medium">Back to RLink</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Content Area */}
        {activeTab === "dashboard" && <CRMDashboard />}
        {activeTab === "reservation" && <Reservation />}
        {activeTab === "lead-generation" && <LeadGeneration />}
        {activeTab === "inventory" && <Inventory />}

        {activeTab === "inquiries" && <Inquiries />}
        {activeTab === "newsletter" && <Newsletter />}
    </SidebarProvider>
  );
}