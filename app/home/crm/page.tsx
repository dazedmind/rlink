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
  Mail,
  Menu,
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
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import Reservation from "./reservation/page";
import LeadGeneration from "./lead-generation/page";
import Inventory from "./inventory/page";
import CRMDashboard from "./dashboard/page";
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

function CrmNavContent({
  groupedNav,
  activeTab,
  setActiveTab,
}: {
  groupedNav: Record<string, typeof navItems>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = (url: string) => {
    setActiveTab(url);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      {Object.entries(groupedNav).map(([groupName, items]) => (
        <SidebarGroup key={groupName} className="px-4 lg:px-2">
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
                    className={`transition-all cursor-pointer ${
                      activeTab === item.url
                        ? "bg-sidebar-accent border border-border shadow-sm font-medium"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    onClick={() => handleNavClick(item.url)}
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
    </>
  );
}

export default function CrmSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // 1. Grouping Logic: Reduces navItems into an object keyed by group name
  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <SidebarProvider className="bg-accent min-w-0 overflow-x-hidden">
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="bg-accent p-4 border-none"
      >
        <SidebarHeader className="py-4">
          <div className="flex flex-col items-start gap-3 px-2">
            <Image src={rlandLogo} alt="Logo" width={100} height={100} />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <CrmNavContent
            groupedNav={groupedNav}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/home" className="flex items-center gap-2 text-blue-600 hover:opacity-80 transition-opacity">
                <span className="flex items-center p-2 gap-2">
                  <HiOutlineSquares2X2 className="size-6" />
                  <p className="text-sm font-medium">Back to RLink</p>
                </span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-accent min-w-0 overflow-x-hidden">
        {/* Mobile menu bar - visible only on small screens */}
        <header className="sticky top-0 z-40 flex lg:hidden items-center gap-3 border-b bg-white px-4 py-3 shrink-0">
          <SidebarTrigger className="size-9">
            <Menu className="size-5" />
          </SidebarTrigger>
          <Image src={rlandLogo} alt="RLand" width={60} height={32} className="object-contain" />
        </header>

        {/* Content Area */}
        {activeTab === "dashboard" && <CRMDashboard setActiveTab={(tab) => setActiveTab(tab)}/>}
        {activeTab === "reservation" && <Reservation />}
        {activeTab === "lead-generation" && <LeadGeneration />}
        {activeTab === "inventory" && <Inventory />}
        {activeTab === "inquiries" && <Inquiries />}
        {activeTab === "newsletter" && <Newsletter />}
      </SidebarInset>
    </SidebarProvider>
  );
}