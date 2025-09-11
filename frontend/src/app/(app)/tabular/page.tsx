"use client";

import { DragDropOverlay } from "@/components/drag-drop-overlay";
import { FileDropModal } from "@/features/files/components/file-drop-modal";
import { useFileUploadStore } from "@/features/files/store/use-file-upload-store";
import { TabularViewList } from "@/features/tabular/components/TabularViewList";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { FileIcon, UploadIcon } from "lucide-react";

export default function TabularPage() {
  const { queueFiles } = useFileUploadStore();
  const { isDragOver } = useDragDrop({
    onFilesDropped: (files) => {
      queueFiles(files);
    },
  });

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Main drag-and-drop area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileIcon className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Create Tabular View</h2>
            <p className="text-muted-foreground">
              Drag and drop your files here to create a new tabular view and
              start extracting data
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <UploadIcon className="w-4 h-4" />
            <span>Drop files anywhere to begin</span>
          </div>
        </div>
      </div>

      {/* Existing views section */}
      <div className="max-w-md mx-auto mb-10">
        <TabularViewList />
      </div>

      <DragDropOverlay isVisible={isDragOver} />
      <FileDropModal />
    </div>
  );
}
