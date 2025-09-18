"use client";

import { DragDropOverlay } from "@/components/drag-drop-overlay";
import { FileDropModal } from "@/features/files/components/file-drop-modal";
import { FilesContainer } from "@/features/files/sections/FilesContainer";
import { useFileUploadStore } from "@/features/files/store/use-file-upload-store";
import { useDragDrop } from "@/hooks/use-drag-drop";

const FilesPage = () => {
  const { queueFiles, isModalOpen } = useFileUploadStore();
  const { isDragOver } = useDragDrop({
    onFilesDropped: (files) => {
      queueFiles(files);
    },
  });

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <FilesContainer />
      <DragDropOverlay isVisible={isDragOver && !isModalOpen} />
      <FileDropModal />
    </div>
  );
};

export default FilesPage;
