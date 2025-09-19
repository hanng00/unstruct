"use client";

import { Button } from "@/components/ui/button";
import { FileCellRenderer } from "@/features/workspace/components/cellRenders/FileCellRenderer";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { WorkspaceRowData } from "../../types/workspace-row-data";

export const FileWithToggle = ({
  data,
  toggleExpanded,
  isExpanded,
  openPreview,
  mutationRemoveFile,
  workspaceId,
  hasChildren, // new prop
}: {
  data: WorkspaceRowData;
  toggleExpanded: (fileId: string) => void;
  isExpanded: boolean;
  openPreview: (fileId: string) => void;
  mutationRemoveFile: { mutate: (fileId: string) => void };
  workspaceId: string;
  hasChildren: boolean;
}) => {
  if (data._isPivot) {
    return (
      <p className="text-xs text-foreground/80 ml-8">
        Row {data.rowNumber || ""}
      </p>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {hasChildren && (
        <Button
          className="text-xs size-4 "
          onClick={() => toggleExpanded(data.file.fileId)}
          variant="ghost"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 transition-transform duration-200 ease-in-out",
              isExpanded ? "rotate-90" : ""
            )}
          />
        </Button>
      )}
      <FileCellRenderer
        file={data.file}
        handleViewFile={() => openPreview(data.file.fileId)}
        handleRemoveFile={() => mutationRemoveFile.mutate(data.file.fileId)}
        workspaceId={workspaceId}
      />
    </div>
  );
};
