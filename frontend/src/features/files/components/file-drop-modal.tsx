"use client";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileActions } from "../hooks/use-file-actions";
import { useFileUploadStore } from "../store/use-file-upload-store";
import { FileUploadItem } from "./file-browser/file-upload-item";

type Props = {
  onAfterAllUploaded?: (fileIds: string[]) => Promise<void> | void;
};

export function FileDropModal({ onAfterAllUploaded }: Props) {
  const { uploads, isModalOpen, clear, closeModal, removeIdleUploads } = useFileUploadStore();
  const { startUploads, isPending } = useFileActions({
    onAllUploaded: async () => {
      const fileIds = uploads
        .map((u) => u.fileId)
        .filter((id): id is string => Boolean(id));

      if (fileIds.length > 0) {
        await onAfterAllUploaded?.(fileIds);
      }

      // Sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      clear();
      closeModal();
    },
  });

  const onOpenChange = () => {
    removeIdleUploads();
    if (uploads.length === 0 || uploads.every((u) => u.status !== "uploading")) {
      // If nothing is uploading anymore, close and clear out fully
      clear();
      closeModal();
    } else {
      closeModal();
    }
  };

  const handleUploadFiles = async () => {
    await startUploads({ concurrency: 5 });
  };

  const queuedCount = uploads.length;

  return (
    <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Upload your files to start extracting data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {queuedCount} file{queuedCount !== 1 ? "s" : ""} ready to upload
          </p>

          <ScrollArea className="h-64 w-full border rounded-md">
            <div className="p-4 space-y-3">
              {uploads.map((fileUpload) => (
                <FileUploadItem
                  key={fileUpload.clientId}
                  fileUpload={fileUpload}
                />
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || uploads.length === 0}
              onClick={handleUploadFiles}
            >
              {isPending ? (
                <>
                  <Loader />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
