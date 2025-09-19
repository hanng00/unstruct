import { useCallback, useMemo, useState } from "react";
import { WorkspaceRowData } from "../types/workspace-row-data";

export const useExpandableRows = (rows: WorkspaceRowData[]) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const parentsWithChildren = useMemo(() => {
    const parents = new Set<string>();
    rows.forEach((row) => {
      if (row._isPivot && row._parentFileId) parents.add(row._parentFileId);
    });
    return parents;
  }, [rows]);

  const toggleExpanded = useCallback((fileId: string) => {
    setExpandedRows((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  }, []);

  const visibleRows = useMemo(
    () =>
      rows.filter((row) => {
        if (!row._isPivot) return true;
        // For pivot rows, check if their parent file is expanded
        return expandedRows[row._parentFileId || ""] ?? false;
      }),
    [rows, expandedRows]
  );

  return { visibleRows, toggleExpanded, expandedRows, parentsWithChildren };
};
