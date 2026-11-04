"use client";
import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <Toaster />
    </StoreProvider>
  );
}
