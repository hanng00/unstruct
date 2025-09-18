import { create } from "zustand";

type WorkspacePreviewState = {
  previewFileId: string | null;
  open: boolean;
  openPreview: (fileId: string) => void;
  closePreview: () => void;
  setOpen: (open: boolean) => void;
};

export const useWorkspacePreview = create<WorkspacePreviewState>((set) => ({
  previewFileId: null,
  open: false,
  openPreview: (fileId) => set({ previewFileId: fileId, open: true }),
  closePreview: () => set({ previewFileId: null, open: false }),
  setOpen: (isOpen) => set((state) => ({ open: isOpen, previewFileId: isOpen ? state.previewFileId : null })),
}));


