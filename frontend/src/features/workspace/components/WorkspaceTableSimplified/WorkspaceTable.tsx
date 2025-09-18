import {
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export type Column<TData> = ColDef<TData>;
export type CellParams<TData> = ICellRendererParams<TData>;
export type TableData<TData> = {
  columns: Column<TData>[];
  rows: TData[];
};

export type DataTableProps<TData extends object> = TableData<TData>;

export const WorkspaceTableSimplified = <TData extends object>({
  columns,
  rows,
}: DataTableProps<TData>) => {
  const defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-quartz w-full h-full">
      <AgGridReact
        rowData={rows}
        columnDefs={columns}
        theme={themeQuartz}
        defaultColDef={defaultColDef}
        detailRowAutoHeight={true}
        animateRows={true}
        getRowId={(params) => params.data.id}
      />
    </div>
  );
};
