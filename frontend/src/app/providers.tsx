"use client";

import { AuthProvider } from "@/features/auth";
import { QueryProvider } from "@/lib/providers/QueryProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
};
