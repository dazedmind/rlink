"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  Card, CardContent } from "@/components/ui/card";
import UsersTable from "@/components/tables/user-management/UsersTable";
import { Users, Building, Ban } from "lucide-react";

function UserManagementDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: qk.users(),
    queryFn: async () => {
      const res = await fetch("/api/users");
      const json = await res.json();
      return { total: json.total ?? 0 };
    },
  });

  const totalUsers = data?.total ?? 0;
  const totalDepartments = 0;
  const deactivatedUsers = 0;

  const user_stats = [
    { id: 1, stats: totalUsers, label: "Total Users", icon: Users },
    { id: 2, stats: totalDepartments, label: "Total departments", icon: Building },
    { id: 3, stats: deactivatedUsers, label: "Deactivated Users", icon: Ban },
  ];

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Identity & Access Management (IAM)"
          description="Track your leads, client inquiries, and sales progression."
        />

        <div className="flex flex-col gap-8 animate-fade-in-up">
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {user_stats.map((user_stat) => (
              <Card key={user_stat.id} className="flex flex-col justify-end h-[150px] relative overflow-hidden">
                <CardContent className="flex flex-col items-start">
                  <div className="flex items-center gap-2 text-4xl font-bold">
                    {isLoading ? (
                      <span className="h-10 w-16 rounded-md bg-muted animate-pulse" />
                    ) : (
                      user_stat.stats
                    )}
                  </div>
                  <div className="flex items-center gap-2 z-30">
                    <p className="text-lg font-semibold text-muted-foreground">{user_stat.label}</p>
                  </div>

                  <span className="absolute -bottom-3 right-0 opacity-[0.06]">
                    <user_stat.icon className="size-20 stroke-2" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <UsersTable onEdit={() => {}} onDelete={() => {}} onAdd={() => {}} viewOnly={true} />
        </div>
      </div>
    </main>
  );
}

export default UserManagementDashboard;
