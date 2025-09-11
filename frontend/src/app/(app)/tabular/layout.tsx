"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/features/auth";

type Props = {
  children: React.ReactNode;
};
const SheetLayout = ({ children }: Props) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="bg-muted grow flex flex-row py-2 px-1">
          <AppSidebar />
          <div className="rounded-md border border-sidebar-border overflow-hidden grow">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default SheetLayout;
