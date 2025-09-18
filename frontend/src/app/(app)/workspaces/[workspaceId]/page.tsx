"use client";

import { DragDropOverlay } from "@/components/drag-drop-overlay";
import { FileDropModal } from "@/features/files/components/file-drop-modal";
import { useFileUploadStore } from "@/features/files/store/use-file-upload-store";
import { useAddFilesToWorkspace } from "@/features/workspace/api/add-files-to-workspace";
import { useGetWorkspace } from "@/features/workspace/api/get-workspace";
import { useListWorkspaceRows } from "@/features/workspace/api/list-workspace-rows";
import { WorkspaceActions } from "@/features/workspace/components/WorkspaceActions";
import { WorkspaceTableContainer } from "@/features/workspace/components/WorkspaceTableContainer";
import { WorkspaceTopbar } from "@/features/workspace/components/WorkspaceTopbar";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { use } from "react";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspaceDetailPage({ params }: Props) {
  const { workspaceId } = use(params);
  const { data: workspace } = useGetWorkspace(workspaceId);
  const { data: rows } = useListWorkspaceRows(workspaceId);
  const addFilesMutation = useAddFilesToWorkspace(workspaceId);

  const { queueFiles, isModalOpen } = useFileUploadStore();
  const { isDragOver } = useDragDrop({
    onFilesDropped: (files) => {
      queueFiles(files);
    },
  });

  const hasRows = (rows || []).length > 0;

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <WorkspaceTopbar workspaceName={workspace?.name} />
      <WorkspaceActions
        workspaceId={workspaceId}
        selectedFileIds={(rows || []).map((r) => r.fileId)}
        selectedDataModelId={workspace?.dataModelId}
      />
      <div className="grow overflow-auto">
        {hasRows && (
          <WorkspaceTableContainer
            workspaceId={workspaceId}
            dataModelId={workspace?.dataModelId || ""}
          />
        )}
      </div>
      <DragDropOverlay isVisible={isDragOver && !isModalOpen} />
      <FileDropModal
        onAfterAllUploaded={async (fileIds) => {
          if (fileIds.length > 0) {
            await addFilesMutation.mutateAsync(fileIds);
          }
        }}
      />
    </div>
  );
}
