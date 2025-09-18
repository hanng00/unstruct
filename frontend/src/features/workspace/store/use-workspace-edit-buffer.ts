import { create } from "zustand";

type EditBufferState = {
  editsByFileId: Record<string, Record<string, unknown>>;
  setEdit: (fileId: string, field: string, value: unknown) => void;
  getEdits: (fileId: string) => Record<string, unknown>;
  clearEdits: (fileId: string) => void;
  hasEdits: (fileId: string) => boolean;
};

export const useWorkspaceEditBuffer = create<EditBufferState>((set, get) => ({
  editsByFileId: {},
  setEdit: (fileId, field, value) =>
    set((state) => ({
      editsByFileId: {
        ...state.editsByFileId,
        [fileId]: { ...(state.editsByFileId[fileId] || {}), [field]: value },
      },
    })),
  getEdits: (fileId) => get().editsByFileId[fileId] || {},
  clearEdits: (fileId) =>
    set((state) => {
      const next = { ...state.editsByFileId };
      delete next[fileId];
      return { editsByFileId: next } as const;
    }),
  hasEdits: (fileId) => Boolean(Object.keys(get().editsByFileId[fileId] || {}).length),
}));


