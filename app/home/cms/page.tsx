"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import rlandLogo from "@/public/rland-logo.png";
import { 
  LayoutDashboard, 
  List, 
  ChevronRight, 
  Code,
  Menu,
  ShieldX,
  Link2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

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

function DeveloperToolsForbidden() {
  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldX className="size-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Developer Tools are only available to Admin and IT roles. Contact your administrator if you need access.
        </p>
      </div>
    </main>
  );
}
import CMSDashboard from "./dashboard/page";
import ProjectsManager from "./listings/projects/page";
import CareersManager from "./listings/careers/page";
import PromosManager from "./listings/promos/page";
import NewsManager from "./listings/news/page";
import SeoToolsPage from "./developer-tools/seo-tools/page";
import AnalyticsToolsPage from "./developer-tools/analytics-tools/page";
import SecurityToolsPage from "./developer-tools/security-tools/page";
import ManageLinks from "./manage-links/page";
import { CmsQueryBootstrap } from "@/lib/cms/cms-bootstrap";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "dashboard", group: "CMS Menu" },
  { 
    title: "Listings", 
    icon: List, 
    url: "listings", 
    group: "Content Management",
    items: [
      { title: "Projects", url: "listings/projects" },
      { title: "Careers", url: "listings/careers" },
      { title: "Promos", url: "listings/promos" },
      { title: "News Articles", url: "listings/news" },
    ]
  },
  { title: "Social Links", icon: Link2, url: "manage-links", group: "Content Management" },
  { title: "Developer Tools", icon: Code, url: "developer-tools", group: "Configuration", 
    items: [
      { title: "SEO Tools", url: "developer-tools/seo-tools" },
      { title: "Analytics Tools", url: "developer-tools/analytics-tools" },
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
        <SidebarGroup key={groupName} className="px-4 lg:px-2">
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
                        className={`transition-all cursor-pointer ${
                          activeTab === item.url
                            ? "bg-white border border-border shadow-sm font-medium"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                    defaultOpen={true}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
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
                                className={activeTab === subItem.url ? "font-bold text-blue-600" : ""}
                              >
                                <button onClick={() => handleNavClick(subItem.url)} className="cursor-pointer">
                                  <span className={activeTab === subItem.url ? "font-bold text-blue-800" : ""}>{subItem.title}</span>
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

function canAccessDeveloperTools(role?: string | null, department?: string | null) {
  const r = (role ?? "").toLowerCase();
  const d = (department ?? "").toLowerCase();
  return r === "admin" || r === "it" || d === "it";
}

export default function CmsSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: session } = useSession();

  const filteredNavItems = useMemo(() => {
    const hasDevToolsAccess = canAccessDeveloperTools(session?.user?.role, session?.user?.department);
    if (hasDevToolsAccess) return navItems;
    return navItems.filter((item) => item.url !== "developer-tools");
  }, [session?.user?.role, session?.user?.department]);

  const groupedNav = useMemo(
    () =>
      filteredNavItems.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
      }, {} as Record<string, typeof navItems>),
    [filteredNavItems]
  );

  const hasDevToolsAccess = canAccessDeveloperTools(session?.user?.role, session?.user?.department);

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
        <CmsQueryBootstrap />
        {/* Mobile menu bar - visible only on small screens */}
        <header className="sticky top-0 z-40 flex lg:hidden items-center gap-3 border-b bg-white px-4 py-3 shrink-0">
          <SidebarTrigger className="size-9">
            <Menu className="size-5" />
          </SidebarTrigger>
          <Image src={rlandLogo} alt="RLand" width={60} height={32} className="object-contain" />
        </header>

        {/* CMS MENU */}
        {activeTab === "dashboard" && <CMSDashboard onNavigate={setActiveTab} />}
        
        {/* CONTENT MANAGEMENT */}
        {activeTab === "listings/projects" && <ProjectsManager />}
        {activeTab === "listings/careers" && <CareersManager />}
        {activeTab === "listings/promos" && <PromosManager />}  
        {activeTab === "listings/news" && <NewsManager />}

        {activeTab === "manage-links" && <ManageLinks />}

        {/* CONFIGURATION */}
        {activeTab === "developer-tools/seo-tools" && (
          hasDevToolsAccess ? <SeoToolsPage /> : <DeveloperToolsForbidden />
        )}
        {activeTab === "developer-tools/analytics-tools" && (
          hasDevToolsAccess ? <AnalyticsToolsPage /> : <DeveloperToolsForbidden />
        )}
        {activeTab === "developer-tools/security-tools" && (
          hasDevToolsAccess ? <SecurityToolsPage /> : <DeveloperToolsForbidden />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}