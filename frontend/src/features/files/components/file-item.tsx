import { Button } from "@/components/ui/button";
import { FileReference } from "@/features/files/api/list-files";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import Link from "next/link";

export const FileItem = ({ file }: { file: FileReference }) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div
      key={file.id}
      className="flex items-center gap-4 p-3 border rounded bg-card"
    >
      {/* ICON */}
      <FileText className="size-4 text-muted-foreground" />

      {/* FILE NAME */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{file.filename}</div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span>{file.mimeType}</span>
          <span>
            {formatDistanceToNow(new Date(file.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* ACTION */}
      <Button variant="link" size="sm" asChild>
        <Link href={`/files/${file.id}`}>View</Link>
      </Button>
    </div>
  );
};
