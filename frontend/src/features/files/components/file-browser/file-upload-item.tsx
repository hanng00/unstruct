"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { File } from "lucide-react";
import { FileUpload } from "../../types";

const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${size} ${units[i]}`;
};

const statusVariants: Record<
  FileUpload["status"],
  "secondary" | "default" | "destructive"
> = {
  idle: "secondary",
  uploading: "default",
  completed: "default",
  failed: "destructive",
};

type Props = {
  fileUpload: FileUpload;
};

export const FileUploadItem = ({ fileUpload }: Props) => {
  const { file, status, progress, error } = fileUpload;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="aspect-square size-8 flex items-center justify-center shrink-0">
        <File />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <Badge variant={statusVariants[status]} className="text-xs">
            {status}
          </Badge>
        </div>

        <p className="text-xs text-gray-500 mb-2">
          {formatFileSize(file.size)}
        </p>

        {status === "uploading" && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
        )}

        {status === "failed" && error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};
