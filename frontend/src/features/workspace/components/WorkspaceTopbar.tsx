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

type Props = { workspaceName?: string };

export const WorkspaceTopbar = ({ workspaceName }: Props) => {
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
            <span className="text-sm text-muted-foreground">{workspaceName || "Unnamed"}</span>
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