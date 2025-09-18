"use client";

import { GeneralNavbar } from "@/components/general-navbar";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/features/workspace/components/CreateWorkspaceDialog";
import { WorkspaceList } from "@/features/workspace/components/WorkspaceList";
import Link from "next/link";

export default function WorkspacePage() {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Topbar placeholder */}
      <GeneralNavbar
        breadcrumbConfig={[{ label: "Workspaces", href: "/workspaces" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/data-models">All templates</Link>
            </Button>
            <CreateWorkspaceDialog />
          </div>
        }
      />

      {/* Main content */}
      <main className="grow p-8">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Browse your workspaces
          </p>
          <WorkspaceList />
        </div>
      </main>

      {/* bottom spacer removed; dialog moved above list */}
    </div>
  );
}
