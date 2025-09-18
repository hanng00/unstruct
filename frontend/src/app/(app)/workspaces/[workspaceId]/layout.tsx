"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarInset } from "@/components/ui/sidebar";
import { useGetFile } from "@/features/files/api/get-file";
import { FilePreviewSidebar } from "@/features/files/preview/ui/FilePreviewSidebar";
import { useWorkspacePreview } from "@/features/workspace/store/use-workspace-preview";

type Props = {
  children: React.ReactNode;
};
const WorkspaceIdLayout = ({ children }: Props) => {
  const { previewFileId, open, setOpen } = useWorkspacePreview();
  const { data: file } = useGetFile(previewFileId);

  return (
    <div className="flex w-full flex-row h-full">
      <SidebarInset className="grow">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={open ? 70 : 100} minSize={30} className="h-full">
            {children}
          </ResizablePanel>
          {open && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                <FilePreviewSidebar
                  file={file}
                  onClose={() => setOpen(false)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarInset>
    </div>
  );
};

export default WorkspaceIdLayout;
