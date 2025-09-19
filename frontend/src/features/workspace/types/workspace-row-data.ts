export type WorkspaceRowData = {
  id: string;
  file: { fileId: string; name: string; isActual: boolean };
  extraction: { status: string; updatedAt: string };
  rowNumber?: number;
  pivotKey?: string;
  fields?: Record<string, unknown>;
  approved?: boolean;
  _isPivot?: boolean;
  _parentFileId?: string;
};
