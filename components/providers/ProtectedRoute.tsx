"use client";
import React from 'react'
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  // 1. Wait for the auth check to finish
  if (isPending) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Only redirect if the check is finished and there is definitely no session
  if (!session) {
    return redirect("/login");
  }

  return <>{children}</>;
}