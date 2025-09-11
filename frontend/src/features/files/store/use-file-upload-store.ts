import { create } from "zustand";
import { FileUpload } from "../types";

type FileUploadState = {
  uploads: FileUpload[];
  isModalOpen: boolean;
  queueFiles: (files: File[]) => void;
  updateItem: (clientId: string, update: Partial<FileUpload>) => void;
  clear: () => void;
  openModal: () => void;
  closeModal: () => void;
};

export const useFileUploadStore = create<FileUploadState>((set) => ({
  uploads: [],
  isModalOpen: false,
  queueFiles: (files: File[]) => {
    const items: FileUpload[] = files.map((file) => ({
      clientId: crypto.randomUUID(),
      file,
      status: "idle",
      progress: 0,
    }));
    set((state) => ({ uploads: [...state.uploads, ...items], isModalOpen: true }));
  },
  updateItem: (clientId: string, update: Partial<FileUpload>) => {
    set((state) => ({
      uploads: state.uploads.map((u) => (u.clientId === clientId ? { ...u, ...update } : u)),
    }));
  },
  clear: () => set({ uploads: [] }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));


