"use client";

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
import { FileUploadItem } from "./file-upload-item";

export function FileDropModal() {
  const { uploads, isModalOpen, clear, closeModal } = useFileUploadStore();
  const { uploadFilesAndCreateView, isPending } = useFileActions();

  const onOpenChange = () => {
    clear();
    closeModal();
  };

  const handleUploadFilesAndCreateView = async () => {
    await uploadFilesAndCreateView({ concurrency: 5 });
  };

  const queuedCount = uploads.length;

  return (
    <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Tabular View</DialogTitle>
          <DialogDescription>
            Upload your files to create a new tabular view and start extracting data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {queuedCount} file{queuedCount !== 1 ? "s" : ""} ready to upload
          </p>

          <ScrollArea className="h-64 w-full border rounded-md">
            <div className="p-4 space-y-3">
              {uploads.map((fileUpload) => (
                <FileUploadItem key={fileUpload.clientId} fileUpload={fileUpload} />
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button disabled={isPending || uploads.length === 0} onClick={handleUploadFilesAndCreateView}>
              {isPending ? "Creating View..." : "Create Tabular View"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
