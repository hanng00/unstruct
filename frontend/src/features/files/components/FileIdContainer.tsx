"use client";

import { GeneralNavbar } from "@/components/general-navbar";
import { Button } from "@/components/ui/button";
import { useListFileExtractions } from "@/features/extractions/api/list-file-extractions";
import CreateExtractionBar from "@/features/extractions/components/CreateExtractionBar";
import ExtractionDetailsSheet from "@/features/extractions/components/ExtractionDetailsSheet";
import ExtractionsList from "@/features/extractions/components/ExtractionsList";
import { useGetFile } from "@/features/files/api/get-file";
import FileHeader from "@/features/files/components/FileHeader";
import { RotateCw } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  fileId: string;
};

export function FileIdContainer({ fileId }: Props) {
  const { data: file } = useGetFile(fileId);
  const {
    data: extractions = [],
    isLoading,
    isFetching,
    refetch,
  } = useListFileExtractions(fileId);
  const [selectedExtractionId, setSelectedExtractionId] = useState<
    string | null
  >(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const selectedId = useMemo(
    () => selectedExtractionId ?? "",
    [selectedExtractionId]
  );

  return (
    <div className="h-full flex flex-col">
      <GeneralNavbar
        breadcrumbConfig={[
          { label: "Files", href: "/files" },
          { label: file?.filename || "File" },
        ]}
      />

      <div className="p-6 space-y-6">
        {file && <FileHeader filename={file.filename} status={file.status} />}
        <ExtractionsList
          items={extractions}
          isLoading={isLoading}
          headerAction={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isFetching}
              >
                <RotateCw
                  className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching ? "Reloading..." : "Reload"}
              </Button>
              <CreateExtractionBar
                fileId={fileId}
                onCreated={() => refetch()}
              />
            </div>
          }
          onShowDetails={(id) => {
            setSelectedExtractionId(id);
            setIsSheetOpen(true);
          }}
        />
      </div>

      <ExtractionDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        extractionId={selectedId}
      />
    </div>
  );
}

export default FileIdContainer;
