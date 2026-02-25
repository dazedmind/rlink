"use client";
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";

function PageManager() {

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Page Manager"
          description="Track your leads, client inquiries, and sales progression."
        />
        
        <div className="flex flex-col gap-8">
        
        </div>

      </div>
    </main>
  );
}

export default PageManager;