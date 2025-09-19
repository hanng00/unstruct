import { WorkspaceRow } from "../schemas";
import { WorkspaceRowData } from "../types/workspace-row-data";

const mapRowsToDataRows = (rows: WorkspaceRow[]): WorkspaceRowData[] => {
  return rows.flatMap<WorkspaceRowData>((row) => {
    const extraction = row.extraction;
    const metaFields = {
      id: row.fileId,
      file: {
        fileId: row.fileId,
        name: row.file.filename,
        isActual: true,
      },
      extraction: {
        status: extraction?.status || "N/A",
        updatedAt: extraction?.updatedAt || new Date().toISOString(),
      },
    };

    if (!row.records || row.records.length === 0) {
      return [metaFields];
    }

    // Always include the file row (non-pivot) first
    const fileRow = metaFields;
    
    // Then add all the record rows (pivot rows)
    const mappedRecords = row.records.map((record) => ({
      id: record.id,
      file: {
        fileId: record.extractionId, // Always use extractionId for pivot rows
        name: record.pivotKey || record.extractionId,
        isActual: false, // Pivot rows are not actual files
      },
      extraction: metaFields.extraction,
      rowNumber: record.rowNumber,
      pivotKey: record.pivotKey,
      fields: record.fields,
      approved: record.approved,
      _isPivot: !!record.pivotKey,
      _parentFileId: record.pivotKey ? row.fileId : undefined,
    }));
    
    return [fileRow, ...mappedRecords];
  });
};

export const useMappedWorkspaceRows = () => {
  return { mapRowsToDataRows };
};
