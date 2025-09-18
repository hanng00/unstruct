"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { FileReference } from "../api/list-files";
import { FileDropModal } from "../components/file-drop-modal";
import { FileItem } from "../components/file-item";

interface Props {
  files?: FileReference[];
  isLoading: boolean;
  error: Error | null;
}
export const FilesFeed = ({ files, isLoading, error }: Props) => {
  if (isLoading || !files) return <FilesFeed.Skeleton />;
  if (error) return <FilesFeed.Error />;

  return (
    <div className="p-6">
      {files.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No files yet</h3>
        </div>
      )}
      <ScrollArea className="h-full">
        {files.length > 0 && (
          <div className="gap-2 flex flex-col">
            {files.map((file) => (
              <FileItem key={file.id} file={file} />
            ))}
          </div>
        )}
      </ScrollArea>

      <FileDropModal />
    </div>
  );
};

const FilesFeedSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};
FilesFeed.Skeleton = FilesFeedSkeleton;

const FileFeedError = () => {
  return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">
        Failed to load files. Please try again.
      </p>
    </div>
  );
};
FilesFeed.Error = FileFeedError;
