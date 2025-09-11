"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FileReference,
    useListFileReferences,
} from "@/features/files/api/list-files";
import { FileDropModal } from "@/features/files/components/file-drop-modal";
import { useFileUploadStore } from "@/features/files/store/use-file-upload-store";
import { formatDistanceToNow } from "date-fns";
import { FileText, List, Search, Upload } from "lucide-react";
import { useState } from "react";

const FilesPage = () => {
  const { data: files, isLoading, error } = useListFileReferences();
  const { openModal } = useFileUploadStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles =
    files?.filter((file) =>
      file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isLoading) {
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
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          Failed to load files. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Navbar */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="font-medium">Files</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={openModal}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No files yet</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "No files match your search."
              : "Upload your first file to get started."}
          </p>
          {!searchQuery && (
            <Button variant="outline" onClick={openModal}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredFiles.map((file) => (
            <FileItem key={file.id} file={file} />
          ))}
        </div>
      )}

      {/* File Upload Modal */}
      <FileDropModal />
    </div>
  );
};

export default FilesPage;

const FileItem = ({ file }: { file: FileReference }) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div
      key={file.id}
      className="flex items-center gap-4 p-3 border rounded bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <FileText className="h-4 w-4 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{file.filename}</div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span>{file.mimeType}</span>
          <span>{file.status}</span>
          <span>
            {formatDistanceToNow(new Date(file.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
