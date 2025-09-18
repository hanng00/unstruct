import { GeneralNavbar } from "@/components/general-navbar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useListFiles } from "../api/list-files";
import { useFileUploadStore } from "../store/use-file-upload-store";
import { FilesFeed } from "./FilesFeed";

export const FilesContainer = () => {
  const { data: files, isLoading, error } = useListFiles();
  const { openModal } = useFileUploadStore();

  return (
    <div className="bg-background h-full">
      <GeneralNavbar
        breadcrumbConfig={[{ label: "Files", href: "/files" }]}
        actions={
          <Button variant="outline" size="sm" onClick={openModal}>
            <Upload className="size-4 mr-2" />
            Upload
          </Button>
        }
      />
      <FilesFeed files={files} isLoading={isLoading} error={error} />
    </div>
  );
};
