import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { XIcon } from "lucide-react";
import { FileReference } from "../../api/get-file";
import FilePreview from "./FilePreview";

type Props = {
  file?: FileReference;
  onClose: () => void;
};
export const FilePreviewSidebar = ({ file, onClose }: Props) => {
  if (!file) {
    return <FilePreviewSidebar.Skeleton />;
  }
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium truncate pr-2">{file.filename}</div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Close preview"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <FilePreview fileId={file.id} />
      </div>
    </div>
  );
};

const FilePreviewSidebarSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium truncate pr-2">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
};

FilePreviewSidebar.Skeleton = FilePreviewSidebarSkeleton;
