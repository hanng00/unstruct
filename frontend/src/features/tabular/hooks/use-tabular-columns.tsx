import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  FileType,
  Hash,
  Type,
} from "lucide-react";
import * as React from "react";
import { EditableCell } from "../components/EditableCell";
import { SchemaField } from "./use-schema-fields";

export type Extraction = {
  id: string;
  fileId: string;
  dataModelId: string;
  tabularViewId: string;
  userId: string;
  status: "queued" | "processing" | "completed" | "failed";
  data?: Record<string, unknown>;
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
};

// Helper function to get icon for field type based on actual data type
const getFieldIcon = (fieldType: string) => {
  switch (fieldType.toLowerCase()) {
    case "string":
    case "text":
      return Type;
    case "number":
    case "integer":
    case "float":
      return Hash;
    case "date":
    case "datetime":
    case "timestamp":
      return Calendar;
    case "enum":
    case "select":
    case "choice":
      return FileType;
    case "boolean":
    case "bool":
      return FileSpreadsheet;
    default:
      return Type; // Default to string type
  }
};

export const useTabularColumns = (
  dataFields: SchemaField[],
  tabularViewId: string
): ColumnDef<Extraction>[] => {
  return React.useMemo(() => {
    const columns: ColumnDef<Extraction>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <div className="text-muted-foreground text-sm font-mono">
            {row.index + 1}
          </div>
        ),
        size: 60,
        minSize: 50,
        maxSize: 80,
      },
      {
        id: "document",
        header: "Document",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 bg-muted rounded-md p-2">
            <FileText className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate font-medium">
              {String(
                row.original.data?.fileName || `Document ${row.index + 1}`
              )}
            </span>
          </div>
        ),
        size: 256,
        minSize: 200,
        maxSize: 400,
      },
    ];

    // Add dynamic columns based on data model
    dataFields.forEach((field) => {
      const IconComponent = getFieldIcon(field.type);

      columns.push({
        accessorKey: `data.${field.name}`,
        header: () => (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <IconComponent className="h-3 w-3 text-muted-foreground" />
                <span className="capitalize">
                  {field.name.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{field.description || "Extracted field data"}</p>
            </TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const value = row.original.data?.[field.name];
          return (
            <EditableCell
              value={value}
              fieldName={field.name}
              tabularViewId={tabularViewId}
              fileId={row.original.fileId}
              extractionData={row.original.data || {}}
            />
          );
        },
        enableSorting: true,
        size: 150,
        minSize: 100,
        maxSize: 300,
      });
    });

    // Add a flexible grow column to fill remaining space
    columns.push({
      id: "grow",
      header: "",
      cell: () => <div className="w-full" />,
      size: 0,
      minSize: 0,
      maxSize: 0,
      enableResizing: false,
    });

    return columns;
  }, [dataFields, tabularViewId]);
};
