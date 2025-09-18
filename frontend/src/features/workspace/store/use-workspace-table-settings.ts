import { create } from "zustand";

type WorkspaceTableSettingsState = {
  wrapCells: boolean;
  setWrapCells: (wrap: boolean) => void;
  pivotOn?: string;
  setPivotOn: (field?: string) => void;
};

export const useWorkspaceTableSettings = create<WorkspaceTableSettingsState>((set) => ({
  wrapCells: false,
  setWrapCells: (wrap) => set({ wrapCells: wrap }),
  pivotOn: undefined,
  setPivotOn: (field?: string) => set({ pivotOn: field }),
}));


