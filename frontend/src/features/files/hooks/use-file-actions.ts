"use client";

import { batchExecutor } from "@/lib/batch-executor";
import { useCallback } from "react";
import { useCreateTabularViewWithFiles } from "../../tabular/hooks/use-create-tabular-view-with-files";
import { useGeneratePresignedUrl } from "../api/get-presigned-url";
import { useUpdateFileUpload } from "../api/update-file-upload";
import { useUploadFile } from "../api/upload-files";
import { useFileUploadStore } from "../store/use-file-upload-store";

export const useFileActions = () => {
  const { uploads, updateItem } = useFileUploadStore();
  const { createViewWithFiles } = useCreateTabularViewWithFiles();

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
  } = useUpdateFileUpload();

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

  const uploadFilesAndCreateView = useCallback(
    async (options?: { concurrency?: number; viewName?: string }) => {
      const concurrency = options?.concurrency ?? 5;
      const viewName = options?.viewName;
      const idle = uploads.filter((u) => u.status === "idle");
      const completedFileIds: string[] = [];

      // Upload all files first
      await batchExecutor(
        idle,
        async (item) => {
          try {
            const fileId = await uploadSingle(item.clientId, item.file);
            completedFileIds.push(fileId);
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

      // Create tabular view with uploaded files
      if (completedFileIds.length > 0) {
        await createViewWithFiles(completedFileIds, viewName);
      }
    },
    [uploadSingle, updateItem, uploads, createViewWithFiles]
  );

  const isPending = isGeneratingPresignedUrl || isUploading || isUpdatingFile;
  const error = presignedUrlError ?? uploadError ?? updateError;

  return { startUploads, uploadFilesAndCreateView, isPending, error };
};


