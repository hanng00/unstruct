"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ColumnDef,
  ColumnResizeDirection,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Extraction } from "../hooks/use-tabular-columns";

interface TabularTableProps {
  data: Extraction[];
  columns: ColumnDef<Extraction>[];
}

export const TabularTable = ({ data, columns }: TabularTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange" as ColumnResizeMode,
    columnResizeDirection: "ltr" as ColumnResizeDirection,
    enableColumnResizing: true,
    enableSorting: true,
    enableRowSelection: false,
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
      size: 150, // Default column size
    },
  });

  return (
    <TooltipProvider>
      <div className="border-t">
        <Table style={{ width: table.getCenterTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="border-r last:border-r-0 relative"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="hover:bg-muted rounded p-1"
                            >
                              {{
                                asc: <ArrowUp className="h-3 w-3" />,
                                desc: <ArrowDown className="h-3 w-3" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                        className={`absolute right-0 top-0 h-full w-1 bg-transparent cursor-col-resize select-none touch-none transition-colors duration-200 hover:bg-primary/20 ${
                          header.column.getIsResizing() ? "bg-primary/40" : ""
                        }`}
                        style={{
                          transform: header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === "rtl" ? -1 : 1) *
                                (table.getState().columnSizingInfo.deltaOffset ?? 0)
                              }px)`
                            : "",
                        }}
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="border-r last:border-r-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center border-r last:border-r-0"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
