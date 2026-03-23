"use client";

import React from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ModulesTable from "@/components/tables/user-management/ModulesTable";
import { useSession } from "@/lib/auth-client";
import { ShieldX } from "lucide-react";
import { redirect } from "next/navigation";

function ModuleAccess() {
  const { data: session } = useSession();
  if (session?.user?.role !== "admin" && session?.user?.department !== "it") {
    redirect("/home");
    return null;
  }

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Module Access"
          description="Configure which roles and departments can access each module."
        />
        <div className="mt-10 animate-in fade-in duration-500">
          <ModulesTable />
        </div>
      </div>
    </main>
  );
}

export default ModuleAccess;
