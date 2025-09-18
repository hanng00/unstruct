"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRemoveFileFromWorkspace } from "@/features/workspace/api/remove-file-from-workspace";
import { Eye, FileText, Trash2 } from "lucide-react";

interface FileCellRendererParams {
  workspaceId?: string;

  file: {
    name: string;
  };
  handleViewFile?: () => void;
  handleRemoveFile?: () => void;
}

export const FileCellRenderer = (params: FileCellRendererParams) => {
  const { file, handleViewFile, handleRemoveFile, workspaceId } = params;

  const removeMutation = useRemoveFileFromWorkspace(workspaceId);

  return (
    <div className="flex items-center gap-2 h-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="text-xs">
            <FileText />
            {file.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleViewFile} disabled={!workspaceId}>
            <Eye /> View
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleRemoveFile}
            disabled={!workspaceId || removeMutation.isPending}
          >
            <Trash2 /> Remove from workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
