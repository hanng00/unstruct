"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

type Props = {
  data: Record<string, unknown>;
};

export function ExtractionDataTable({ data }: Props) {
  const rowsCandidate = (data as Record<string, unknown>)?.rows as unknown;
  const rowArray = Array.isArray(rowsCandidate)
    ? (rowsCandidate as Record<string, unknown>[])
    : null;
  const hasRowsKey = Object.prototype.hasOwnProperty.call(data, "rows");

  const rowColumns = React.useMemo(() => {
    if (!rowArray || rowArray.length === 0) return [] as string[];
    const orderedUniqueKeys: string[] = [];
    for (const row of rowArray) {
      for (const key of Object.keys(row)) {
        if (!orderedUniqueKeys.includes(key)) orderedUniqueKeys.push(key);
      }
    }
    return orderedUniqueKeys;
  }, [rowArray]);

  return (
    <div className="mt-1 rounded-md border bg-muted/30 p-2 max-h-[60vh] overflow-auto">
      {hasRowsKey ? (
        rowArray && rowArray.length > 0 ? (
          <div className="w-full overflow-auto">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  {rowColumns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowArray.map((row, idx) => (
                  <TableRow key={idx}>
                    {rowColumns.map((col) => (
                      <TableCell key={col} className="font-mono text-xs whitespace-pre-wrap break-words">
                        {(() => {
                          const value = (row as Record<string, unknown>)[col];
                          return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
                            ? String(value)
                            : value == null
                            ? ""
                            : JSON.stringify(value, null, 2);
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-2">No rows.</div>
        )
      ) : (
        <div className="w-full overflow-auto">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 whitespace-nowrap">Field</TableHead>
                <TableHead className="whitespace-nowrap">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data || {}).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium whitespace-nowrap">{key}</TableCell>
                  <TableCell className="font-mono text-xs whitespace-pre-wrap break-words">
                    {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ExtractionDataTable;


