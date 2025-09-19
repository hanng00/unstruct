"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetDataModel } from "@/features/data-model/api/get-data-model";
import {
  useListWorkspaceRows,
  WorkspaceRow,
} from "@/features/workspace/api/list-workspace-rows";
import {
  CellParams,
  Column,
  WorkspaceTableSimplified,
} from "@/features/workspace/components/WorkspaceTableSimplified";
import { EvidenceCell } from "@/features/workspace/components/WorkspaceTableSimplified/renderers/EvidenceCell";
import { FileCellRenderer } from "@/features/workspace/components/WorkspaceTableSimplified/renderers/FileCellRenderer";
import { isEvidence } from "@/features/workspace/lib/evidence";
import { cn } from "@/lib/utils";
import { ICellEditorParams, ValueGetterParams } from "ag-grid-community";
import { ChevronRightIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useGetWorkspace } from "../api/get-workspace";
import { useRemoveFileFromWorkspace } from "../api/remove-file-from-workspace";
import { useWorkspacePreview } from "../store/use-workspace-preview";
import { useWorkspaceTableSettings } from "../store/use-workspace-table-settings";

type Props = {
  workspaceId: string;
};

type WorkspaceRowData = Record<string, unknown> & {
  id: string;
  file: { fileId: string; name: string; isActual: boolean };
  extractionStatus: string;
  _isPivot?: boolean;
  _parentFileId?: string;
};

/** Flatten pivoted data with parent tracking */
const handleRowMapping = (row: WorkspaceRow) => {
  const metaFields = {
    id: row.fileId,
    file: { fileId: row.fileId, name: row.file.filename, isActual: true },
    extractionStatus: row.extraction?.status || "N/A",
  };

  const pivotOn = row.extraction?.pivotOn;
  if (pivotOn) {
    const pivotData = row.extraction?.data as Record<
      string,
      Record<string, string>
    >;

    const pivotedRows = Object.entries(pivotData).map(
      ([pivotKeyValue, extractionData]) => ({
        id: row.fileId + pivotKeyValue,
        file: { fileId: pivotKeyValue, name: pivotKeyValue, isActual: false },
        extractionStatus: metaFields.extractionStatus,
        _isPivot: true,
        _parentFileId: row.fileId,
        ...extractionData,
      })
    );

    return [metaFields, ...pivotedRows];
  }

  return [{ ...metaFields, ...row.extraction?.data }];
};

const mapRowsToDataRows = (rows: WorkspaceRow[]) =>
  rows.flatMap(handleRowMapping);

/** Hook: Manages expansion state and visible rows */
const useExpandableRows = (rows: WorkspaceRowData[]) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Find files that have pivoted children
  const parentsWithChildren = useMemo(() => {
    const parents = new Set<string>();
    rows.forEach((row) => {
      if (row._isPivot && row._parentFileId) {
        parents.add(row._parentFileId);
      }
    });
    return parents;
  }, [rows]);

  const toggleExpanded = useCallback((fileId: string) => {
    setExpandedRows((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  }, []);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (row._isPivot) return expandedRows[row._parentFileId || ""] ?? false;
      return true;
    });
  }, [rows, expandedRows]);

  return { visibleRows, toggleExpanded, expandedRows, parentsWithChildren };
};

/** Component: Renders file + optional chevron toggle */
const FileWithToggle = ({
  data,
  toggleExpanded,
  isExpanded,
  openPreview,
  mutationRemoveFile,
  workspaceId,
  hasChildren, // new prop
}: {
  data: WorkspaceRowData;
  toggleExpanded: (fileId: string) => void;
  isExpanded: boolean;
  openPreview: (fileId: string) => void;
  mutationRemoveFile: { mutate: (fileId: string) => void };
  workspaceId: string;
  hasChildren: boolean;
}) => {
  if (data._isPivot)
    return <p className="text-xs text-foreground/80 ml-4">{data.file.name}</p>;

  return (
    <div className="flex items-center space-x-1">
      {hasChildren && (
        <Button
          className="text-xs w-4 h-4 flex items-center justify-center"
          onClick={() => toggleExpanded(data.file.fileId)}
        >
          <ChevronRightIcon
            className={cn(
              "size-4 transition-transform duration-200 ease-in-out",
              isExpanded ? "rotate-90" : ""
            )}
          />
        </Button>
      )}
      <FileCellRenderer
        file={data.file}
        handleViewFile={() => openPreview(data.file.fileId)}
        handleRemoveFile={() => mutationRemoveFile.mutate(data.file.fileId)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

/** Main container */
export const WorkspaceTableContainer = ({ workspaceId }: Props) => {
  // Data fetching
  const { data: workspace } = useGetWorkspace(workspaceId);
  const { data: model } = useGetDataModel(workspace?.dataModelId);
  const { data: rows } = useListWorkspaceRows(workspaceId);

  // Local state
  const wrapCells = useWorkspaceTableSettings((s) => s.wrapCells);
  const openPreview = useWorkspacePreview((s) => s.openPreview);
  const mutationRemoveFile = useRemoveFileFromWorkspace(workspaceId);

  // Derived state
  const dataRows = mapRowsToDataRows(rows || []);
  const { visibleRows, toggleExpanded, expandedRows, parentsWithChildren } =
    useExpandableRows(dataRows);

  const columnsRaw: Column<WorkspaceRowData>[] = (model?.fields || []).map(
    (field) => ({
      field: field.id,
      headerName: field.name,
      cellEditorParams: (params: ICellEditorParams<WorkspaceRowData>) => ({
        value: isEvidence(params.value) ? params.value.answer : params.value,
      }),
      wrapText: wrapCells,
      autoHeight: wrapCells,
      cellRenderer: (params: CellParams<WorkspaceRowData>) => (
        <EvidenceCell value={params.value} />
      ),
      editable: true,
    })
  );

  const columns: Column<WorkspaceRowData>[] = [
    {
      field: "file",
      headerName: "File",
      pinned: "left",
      valueGetter: (params: ValueGetterParams<WorkspaceRowData>) =>
        params.data?.file.name,
      cellRenderer: (params: CellParams<WorkspaceRowData>) => {
        if (!params.data) return null;
        return (
          <FileWithToggle
            data={params.data}
            toggleExpanded={toggleExpanded}
            isExpanded={expandedRows[params.data.file.fileId] ?? false}
            openPreview={openPreview}
            mutationRemoveFile={mutationRemoveFile}
            workspaceId={workspaceId}
            hasChildren={parentsWithChildren.has(params.data.file.fileId)}
          />
        );
      },
    },
    {
      field: "extractionStatus",
      headerName: "Status",
      cellRenderer: (params: CellParams<WorkspaceRowData>) => {
        if (!params.data?.file.isActual) return null;
        return (
          <Badge variant="outline" className="text-xs">
            {String(params.value)}
          </Badge>
        );
      },
    },
    ...columnsRaw,
  ];

  return <WorkspaceTableSimplified columns={columns} rows={visibleRows} />;
};
