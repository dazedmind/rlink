"use client";

import React from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ActivityLogsTable from "@/components/tables/iam/ActivityLogsTable";

function ActivityLogs() {
  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Activity Logs"
          description="View user activity logs including login, logout, and user management actions."
        />

        <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
          <ActivityLogsTable />
        </div>
      </div>
    </main>
  );
}

export default ActivityLogs;
