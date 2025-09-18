"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/features/auth";

type Props = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: Props) => {
  return (
    <ProtectedRoute>
      <SidebarProvider className="w-full h-full">
        <div className="bg-muted flex flex-row p-2 w-full">
          <AppSidebar />
          <main className="rounded-md border border-sidebar-border overflow-hidden grow bg-background">
            {children}
            <Toaster />
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default AppLayout;
