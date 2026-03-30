"use client";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useMemo } from "react";
import {
  ChartLine,
  Laptop,
  Users,
  ArrowUpRight,
  HelpCircle,
  BarChart3,
  Settings,
  FileText,
  Folder,
  type LucideIcon,
  Loader2,
} from "lucide-react";
import type { ModuleAccessConfig } from "@/lib/iam/module-access-types";
import {
  getModuleAccessCache,
  setModuleAccessCache,
} from "@/lib/module-access-cache";
import ModuleCardSkeleton from "@/components/layout/skeleton/ModuleCardSkeleton";

const ICON_MAP: Record<string, LucideIcon> = {
  ChartLine,
  Laptop,
  Users,
  HelpCircle,
  BarChart3,
  Settings,
  FileText,
  Folder,
};

function canAccessModule(
  config: ModuleAccessConfig | undefined,
  moduleConfigKey: string,
  userRole: string,
  userDept: string
): boolean {
  const entry = config?.[moduleConfigKey];
  // Not configured: default to admin-only (backwards compat before first save)
  if (!entry) return userRole === "admin";

  const roles = Array.isArray(entry.roles) ? entry.roles : [];
  const departments = Array.isArray(entry.departments) ? entry.departments : [];
  const hasRoles = roles.length > 0;
  const hasDepts = departments.length > 0;

  if (!hasRoles && !hasDepts) return userRole === "admin";
  return roles.includes(userRole) || departments.includes(userDept);
}

function Home() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string)?.toLowerCase() ?? "";
  const userDept = (session?.user?.department as string)?.toLowerCase() ?? "";

  const { data: moduleAccessConfig, isLoading } = useQuery({
    queryKey: qk.developerToolsSettings("module-access"),
    queryFn: async () => {
      const cached = getModuleAccessCache();
      if (cached != null) return cached as ModuleAccessConfig;

      const res = await fetch("/api/developer-tools/settings?section=module-access", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const data = (json.data ?? {}) as ModuleAccessConfig;
      setModuleAccessCache(data);
      return data;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 min - skip refetch when navigating within app
  });

  const modules = useMemo(() => {
    const fromConfig = Object.entries(moduleAccessConfig ?? {}).map(
      ([configKey, entry]) => ({
        configKey,
        name: (entry.name as string) ?? configKey,
        shortName: (entry.shortName as string) ?? configKey,
        icon: (entry.icon as string) ?? "ChartLine",
        href: (entry.href as string) ?? `/home/${configKey}`,
        description: (entry.description as string) ?? "",
      })
    );
    if (fromConfig.length > 0) return fromConfig;
    return [];
  }, [moduleAccessConfig]);

  const filteredModules = modules.filter((module) =>
    canAccessModule(moduleAccessConfig, module.configKey, userRole, userDept)
  );
  
  return (
    <ProtectedRoute>
      <div className="h-screen overflow-y-auto w-full bg-accent">
        <main className="flex flex-col gap-10 p-8 px-8 md:px-16 lg:px-24 xl:px-44 h-screen">
          <DashboardHeader description="" />

          <div className="flex flex-col gap-8 flex-1">
            {/* Greeting */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                  Welcome back
                </p>
                <h1 className="text-3xl font-bold text-accent-foreground tracking-tight">
                  {(session?.user.firstName + " " + session?.user.lastName) || session?.user?.name || "User"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Select a module below to get started.
              </p>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {isLoading && (
                <ModuleCardSkeleton />
              )}
              {filteredModules.map((module, i) => {
                const IconComponent = ICON_MAP[module.icon] ?? ChartLine;
                return (
                <Link href={module.href} key={module.configKey} className="group animate-fade-in-up">
                  <div className="relative flex flex-col justify-between h-52 rounded-2xl border border-border bg-background p-6 overflow-hidden transition-all duration-300 hover:shadow-sm hover:-translate-y-1">
                    {/* Top row: tag + arrow */}
                    <div className="flex items-center justify-end">
                      <ArrowUpRight
                        className="size-6 text-neutral-200 transition-all duration-200 group-hover:text-neutral-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>

                    {/* Bottom: icon + name + description */}
                    <div className="flex flex-col gap-2">
                      <div
                        className="rounded-xl flex items-center">
                        <IconComponent
                          className="size-10 text-blue-600"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mt-0.5">
                          {module.shortName}
                        </p>
                        <h2 className="text-2xl font-bold text-foreground leading-tight">
                          {module.name}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {module.description}
                        </p>
                      </div>
                    </div>           
                  </div>
                </Link>
              );
              })}
            </div>
          </div>

          <footer>
            <Footer />
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Home;