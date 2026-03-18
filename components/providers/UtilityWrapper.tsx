"use client";
import React from 'react'
import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';

export default function UtilityWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}