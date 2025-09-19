"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SlashIcon, Workflow } from "lucide-react";
import Link from "next/link";
import { useGetWorkspace, Workspace } from "../api/get-workspace";

type Props = { workspaceId?: Workspace["id"] };

export const WorkspaceTopbar = ({ workspaceId }: Props) => {
  const { data: workspace } = useGetWorkspace(workspaceId);
  if (!workspace) return null;
  
  return (
    <div className="border-b p-4 flex items-center gap-3 justify-between">
      {/* Left breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/workspaces">Workspace</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <span className="text-sm text-muted-foreground">
              {workspace?.name || "Unnamed"}
            </span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right breadcrumbs */}
      <Button size="sm">
        <Workflow />
        Sync to Plytix
      </Button>
    </div>
  );
};
