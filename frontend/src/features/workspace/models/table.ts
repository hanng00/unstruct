import { Extraction } from "@/features/extractions/models/extraction";

export type FieldDef = {
  name: string;
  label: string;
  type?: string;
  format?: string;
  nullable?: boolean;
  description?: string;
};

export type WorkspaceProductRow = {
  kind: "product";
  id: string; // `${extractionId}:${index}`
  fileId: string;
  extractionId: string;
  productIndex: number;
  values: Record<string, unknown>;
  status?: Extraction["status"];
  approved?: boolean;
};

export type WorkspaceFileRow = {
  kind: "file";
  id: string; // fileId
  file: { id: string; filename: string };
  status: Extraction["status"];
  extractionId?: string;
  extractionStatus?: Extraction["status"];
  approved?: boolean;
  subRows: WorkspaceProductRow[];
};

export type WorkspaceTableModel = {
  fields: FieldDef[];
  rows: WorkspaceFileRow[];
};


