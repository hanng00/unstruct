// components/WorkspaceTableContainer.tsx
"use client";

import { useGetDataModel } from "@/features/data-model/api/get-data-model";
import { Extraction } from "@/features/extractions/models/extraction";
import { useListWorkspaceRows } from "@/features/workspace/api/list-workspace-rows";
import {
  CellParams,
  Column,
  WorkspaceTableRenderer,
} from "@/features/workspace/components/WorkspaceTableRenderer";
import { EvidenceCell } from "@/features/workspace/components/cellRenders/EvidenceCell";
import { useGetWorkspace } from "../api/get-workspace";
import { useRemoveFileFromWorkspace } from "../api/remove-file-from-workspace";
import { useExpandableRows } from "../hooks/use-expandable-rows";
import { useMappedWorkspaceRows } from "../hooks/use-mapped-workspace-rows";
import { useWorkspacePreview } from "../store/use-workspace-preview";
import { useWorkspaceTableSettings } from "../store/use-workspace-table-settings";
import { WorkspaceRowData } from "../types/workspace-row-data";
import { FileWithToggle } from "./cellRenders/FileWithToggle";
import { StatusCell } from "./cellRenders/StatusCell";

type Props = { workspaceId: string };

export const WorkspaceTableContainer = ({ workspaceId }: Props) => {
  const { data: workspace } = useGetWorkspace(workspaceId);
  const { data: model } = useGetDataModel(workspace?.dataModelId);
  const { data: rows } = useListWorkspaceRows(workspaceId);

  const wrapCells = useWorkspaceTableSettings((s) => s.wrapCells);
  const openPreview = useWorkspacePreview((s) => s.openPreview);
  const mutationRemoveFile = useRemoveFileFromWorkspace(workspaceId);

  const { mapRowsToDataRows } = useMappedWorkspaceRows();
  const dataRows = mapRowsToDataRows(rows || []);
  const { visibleRows, toggleExpanded, expandedRows, parentsWithChildren } =
    useExpandableRows(dataRows);

  const columnsRaw: Column<WorkspaceRowData>[] = (model?.fields || []).map(
    (field) => ({
      field: field.id as keyof WorkspaceRowData,
      headerName: field.name,
      cellRenderer: (params: CellParams<WorkspaceRowData>) => (
        <EvidenceCell value={params.data?.fields?.[field.id]} />
      ),
      cellEditorParams: (params: CellParams<WorkspaceRowData>) => ({
        value: params.data?.fields?.[field.id],
      }),
      wrapText: wrapCells,
      autoHeight: wrapCells,
      editable: true,
    })
  );

  const columns: Column<WorkspaceRowData>[] = [
    {
      field: "file",
      headerName: "File",
      pinned: "left",
      cellRenderer: (params: CellParams<WorkspaceRowData>) =>
        params.data ? (
          <FileWithToggle
            data={params.data}
            toggleExpanded={toggleExpanded}
            isExpanded={expandedRows[params.data.file.fileId] ?? false}
            openPreview={openPreview}
            mutationRemoveFile={mutationRemoveFile}
            workspaceId={workspaceId}
            hasChildren={parentsWithChildren.has(params.data.file.fileId)}
          />
        ) : null,
    },
    {
      field: "extraction",
      headerName: "Status",
      cellRenderer: (params: CellParams<WorkspaceRowData>) =>
        params.data?.file.isActual ? (
          <StatusCell
            status={params.data.extraction.status as Extraction["status"]}
            updatedAt={params.data.extraction.updatedAt}
          />
        ) : null,
    },
    ...columnsRaw,
  ];

  return <WorkspaceTableRenderer columns={columns} rows={visibleRows} />;
};
