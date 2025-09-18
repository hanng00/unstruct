"use client";

import { batchExecutor } from "@/lib/batch-executor";
import { useCallback, useEffect, useRef } from "react";
import { useGeneratePresignedUrl } from "../api/get-presigned-url";
import { useUpdateFile } from "../api/update-file";
import { useUploadFile } from "../api/upload-file-blob";
import { useFileUploadStore } from "../store/use-file-upload-store";

interface Props {
  onAllUploaded?: () => Promise<void>;
}
export const useFileActions = ({ onAllUploaded }: Props) => {
  const { uploads, updateItem } = useFileUploadStore();

  const hasCompletedRef = useRef(false);
  useEffect(() => {
    const hasUploads = Array.isArray(uploads) && uploads.length > 0;
    const allComplete = hasUploads && uploads.every((u) => u.status === "completed");

    if (allComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      void onAllUploaded?.();
    } else if (!allComplete) {
      // Reset when new uploads are queued or any upload is not completed yet
      hasCompletedRef.current = false;
    }
  }, [uploads, onAllUploaded]);

  const {
    mutateAsync: generatePresignedUrlFn,
    isPending: isGeneratingPresignedUrl,
    error: presignedUrlError,
  } = useGeneratePresignedUrl();
  const {
    mutateAsync: uploadFileFn,
    isPending: isUploading,
    error: uploadError,
  } = useUploadFile();
  const {
    mutateAsync: updateFileUploadFn,
    isPending: isUpdatingFile,
    error: updateError,
  } = useUpdateFile();

  const uploadSingle = useCallback(
    async (clientId: string, file: File): Promise<string> => {
      const presigned = await generatePresignedUrlFn({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });
      updateItem(clientId, {
        fileId: presigned.fileId,
        status: "uploading",
        progress: 0,
      });

      await uploadFileFn({
        presignedUrl: presigned.presignedUrl,
        file,
        onProgress: (progress: number) => updateItem(clientId, { progress }),
      });

      await updateFileUploadFn({
        fileId: presigned.fileId,
        status: "completed",
      });

      updateItem(clientId, { status: "completed", progress: 100 });

      return presigned.fileId;
    },
    [generatePresignedUrlFn, updateFileUploadFn, uploadFileFn, updateItem]
  );

  const startUploads = useCallback(
    async (options?: { concurrency?: number }) => {
      const concurrency = options?.concurrency ?? 5;
      const idle = uploads.filter((u) => u.status === "idle");

      await batchExecutor(
        idle,
        async (item) => {
          try {
            await uploadSingle(item.clientId, item.file);
          } catch (err) {
            updateItem(item.clientId, {
              status: "failed",
              error: err instanceof Error ? err.message : "Upload failed",
            });
            throw err;
          }
        },
        { batchSize: concurrency }
      );
    },
    [uploadSingle, updateItem, uploads]
  );

  const isPending = isGeneratingPresignedUrl || isUploading || isUpdatingFile;
  const error = presignedUrlError ?? uploadError ?? updateError;

  return { startUploads, isPending, error };
};
