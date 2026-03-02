"use client";
import React, { useState } from "react";
import Image from "next/image";
import rlandLogo from "@/public/rland-logo.png";
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  Box, 
  List, 
  ChevronRight, 
  Code,
  Menu
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Link from "next/link";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import CMSDashboard from "./dashboard/page";
import PageManager from "./page-manager/page";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "dashboard", group: "CMS Menu" },
  { title: "Page Management", icon: LayoutDashboard, url: "page-manager", group: "CMS Menu" },
  { title: "Media Content", icon: User, url: "media-content", group: "Content Management", 
    items: [
    { title: "Blogs", url: "media-content/blogs" },
    { title: "Videos", url: "media-content/videos" },
    { title: "Photos", url: "media-content/photos" },
    { title: "Links", url: "media-content/links" },
  ] },
  { title: "Forms", icon: User, url: "forms", group: "Content Management",
    items: [
      { title: "Inquiries", url: "forms/contact-form" },
      { title: "Reservations", url: "forms/reservation-form" },
      { title: "Newsletter", url: "forms/subscription-form" },
    ]
   },
  { 
    title: "Listings", 
    icon: List, 
    url: "listings", 
    group: "Content Management",
    items: [
      { title: "Projects", url: "listings/projects" },
      { title: "Careers", url: "listings/careers" },
      { title: "Promos", url: "listings/promos" },
      { title: "Articles", url: "listings/articles" },
    ]
  },
  { title: "Internal", icon: User, url: "internal", group: "Content Management" },
  { title: "Developer Tools", icon: Code, url: "developer-tools", group: "Configuration", 
    items: [
      { title: "SEO Tools", url: "developer-tools/seo-tools" },
      { title: "Analytics Tools", url: "developer-tools/analytics-tools" },
      { title: "Performance Tools", url: "developer-tools/performance-tools" },
      { title: "Security Tools", url: "developer-tools/security-tools" },
    ]
  },
];

function CmsNavContent({
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
          <SidebarGroupLabel className="text-xs font-bold uppercase">
            {groupName}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const hasSubItems = item.items && item.items.length > 0;

                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={activeTab === item.url}
                        onClick={() => handleNavClick(item.url)}
                        className={`transition-all ${
                          activeTab === item.url
                            ? "bg-white border border-border shadow-sm font-medium"
                            : "hover:bg-neutral-200"
                        }`}
                      >
                        <item.icon className="size-5" />
                        <span className="text-sm">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={activeTab.startsWith(item.url)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="hover:bg-neutral-200"
                        >
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={activeTab === subItem.url}
                                className={activeTab === subItem.url ? "font-medium text-black" : ""}
                              >
                                <button onClick={() => handleNavClick(subItem.url)}>
                                  <span>{subItem.title}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

export default function CmsSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");

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
          <CmsNavContent
            groupedNav={groupedNav}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/home" className="flex items-center gap-2 text-blue-600 ">
                  <span className="bg-neutral-200 p-2 rounded-full">
                    <HiOutlineSquares2X2 className="size-6 " />
                  </span>
                  <span className="text-sm ">Back to RLink</span>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-neutral-100">
        {/* Mobile menu bar - visible only on small screens */}
        <header className="sticky bg-white top-0 z-40 flex md:hidden items-center gap-3 border-b px-4 py-3">
          <SidebarTrigger className="size-9">
            <Menu className="size-5" />
          </SidebarTrigger>
          <Image src={rlandLogo} alt="RLand" width={60} height={32} className="object-contain" />
        </header>

        {activeTab === "dashboard" && <CMSDashboard />}
        {activeTab === "page-manager" && <PageManager />}
 
      </SidebarInset>
    </SidebarProvider>
  );
}