import { useCallback, useEffect, useState } from "react";

interface UseDragDropOptions {
  onFilesDropped?: (files: File[]) => void;
}

export function useDragDrop({ onFilesDropped }: UseDragDropOptions = {}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);

  const isNativeFileDrag = (e: DragEvent) => {
    const types = Array.from(e.dataTransfer?.types || []);
    return types.includes("Files");
  };

  const handleDragEnter = useCallback((e: DragEvent) => {
    if (!isNativeFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (!isNativeFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    // Only hide overlay if leaving the window entirely
    if (!e.relatedTarget) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    if (!isNativeFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (!isNativeFileDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        setDroppedFiles(files);
        setShowModal(true);
        onFilesDropped?.(files);
      }
    },
    [onFilesDropped]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setDroppedFiles([]);
  }, []);

  useEffect(() => {
    // Add event listeners to the document
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return {
    isDragOver,
    droppedFiles,
    showModal,
    closeModal,
  };
}
