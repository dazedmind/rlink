"use client";
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  Card, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/tables/crm/LeadsTable";
import UsersTable from "@/components/tables/user-management/UsersTable";


function UserManagementDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [deactivatedUsers, setDeactivatedUsers] = useState(0);

  const user_stats = [
    {id: 1, stats: totalUsers, label: "Total Users"},
    {id: 2, stats: totalDepartments, label: "Total departments"},
    {id: 3, stats: deactivatedUsers, label: "Deactivated Users"},
  ]
  
  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="User Management Dashboard"
          description="Track your leads, client inquiries, and sales progression."
        />
        
        <div className="flex flex-col gap-8">
          {/* TOP STATS CARDS */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {user_stats.map((user_stat) => (
              <Card key={user_stat.id} className="flex flex-col justify-end h-[150px]">
                <CardContent className="flex flex-col items-start">
                  <div className="text-4xl font-bold">{user_stat.stats}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-muted-foreground">{user_stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* LEADS TABLE SECTION */}
          <UsersTable onEdit={() => {}} onDelete={() => {}} onAdd={() => {}} />
        </div>

      </div>
    </main>
  );
}

export default UserManagementDashboard;