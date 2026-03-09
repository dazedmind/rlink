"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import rlandLogo from "@/public/rland-logo.png";
import { 
  LayoutDashboard, 
  User, 
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
import UserManagementDashboard from "./dashboard/page";
import ManageUsers from "./manage-users/page";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "dashboard", group: "User Management" },
  { title: "Manage Users", icon: User, url: "manage-users", group: "User Management" },
];
    
function UserManagementNavContent({
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

export default function UserManagementSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);
  
  return (
    <SidebarProvider className="bg-neutral-100 min-w-0 overflow-x-hidden">
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
          <UserManagementNavContent
            groupedNav={groupedNav}
            activeTab={activeTab}
            setActiveTab={(tab) => setActiveTab(tab)}
          />
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

      <SidebarInset className="bg-neutral-100 min-w-0 overflow-x-hidden">
        {/* Mobile menu bar - visible only on small screens */}
        <header className="sticky top-0 z-40 flex md:hidden items-center gap-3 border-b bg-white px-4 py-3">
          <SidebarTrigger className="size-9">
            <Menu className="size-5" />
          </SidebarTrigger>
          <Image src={rlandLogo} alt="RLand" width={60} height={32} className="object-contain" />
        </header>

        {/* Content Area */}
        {activeTab === "dashboard" && <UserManagementDashboard />}
        {activeTab === "manage-users" && <ManageUsers />}
      </SidebarInset>
    </SidebarProvider>
  );
}