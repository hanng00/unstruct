"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetDownloadUrl } from "@/features/files/api/get-download-url";
import { useGetFile } from "@/features/files/api/get-file";
import { AudioViewer } from "../viewers/AudioViewer";
import { CsvViewer } from "../viewers/CsvViewer";
import { ImageViewer } from "../viewers/ImageViewer";
import { OfficeViewer } from "../viewers/OfficeViewer";
import { PdfViewer } from "../viewers/PdfViewer";
import { TextViewer } from "../viewers/TextViewer";
import { VideoViewer } from "../viewers/VideoViewer";

type Props = {
  fileId: string;
};

export function FilePreview({ fileId }: Props) {
  const { data: file, isLoading: isLoadingMeta } = useGetFile(fileId);
  const { data: url, isLoading: isLoadingUrl } = useGetDownloadUrl(fileId);

  if (isLoadingMeta || isLoadingUrl) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!file || !url) {
    return (
      <div className="text-sm text-muted-foreground p-4">No preview available.</div>
    );
  }

  const mime = file.mimeType || "";

  if (mime.startsWith("image/")) return <ImageViewer url={url} alt={file.filename} />;
  if (mime === "application/pdf") return <PdfViewer url={url} />;
  if (mime.startsWith("video/")) return <VideoViewer url={url} />;
  if (mime.startsWith("audio/")) return <AudioViewer url={url} />;
  if (mime === "text/csv" || file.filename.toLowerCase().endsWith(".csv")) return <CsvViewer url={url} />;
  if (mime.startsWith("text/")) return <TextViewer url={url} filename={file.filename} mime={mime} />;

  // Office documents via online viewers
  const lower = file.filename.toLowerCase();
  const isOffice =
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xlsm") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".ppt");
  if (
    isOffice ||
    mime.startsWith("application/vnd.openxmlformats-officedocument") ||
    mime === "application/msword" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.ms-powerpoint"
  ) {
    // Prefer Office Web Viewer; if that fails in your environment, switch to GoogleViewer
    return <OfficeViewer url={url} />;
    // return <GoogleViewer url={url} />;
  }

  return (
    <div className="p-4 space-y-3">
      <div className="text-sm text-muted-foreground">Preview not supported.</div>
      <a className="underline" href={url} target="_blank" rel="noopener noreferrer">
        Download {file.filename}
      </a>
    </div>
  );
}

export default FilePreview;


