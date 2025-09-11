"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useListFileReferences } from "../api/list-files";
import { FileRow } from "./FileRow";

type Props = { activeViewId?: string };

export const FileReferenceList = ({ activeViewId }: Props) => {
  const { data: fileRefs, isLoading, error } = useListFileReferences();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const itemsPerPage = 10;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">File References</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>MIME Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">File References</h2>
        <p className="text-sm text-muted-foreground">
          Failed to load file references. Please try again.
        </p>
      </div>
    );
  }

  if (!fileRefs || fileRefs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">File References</h2>
        <p className="text-sm text-muted-foreground">
          No file references yet. Drag and drop files to get started.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((fileRefs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = fileRefs?.slice(startIndex, endIndex) || [];

  const isSelected = (id: string) => selectedIds.includes(id);
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onAdd = async (id: string) => {
    if (!activeViewId) return;
    const { addFilesToView } = await import("@/features/tabular/api");
    await addFilesToView(activeViewId, [id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">File References</h2>
        <div className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, fileRefs?.length || 0)} of{" "}
          {fileRefs?.length || 0}
        </div>
      </div>

      <div className="border rounded-md max-h-[600px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-6"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>MIME Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((f) => (
              <FileRow
                key={f.id}
                id={f.id}
                filename={f.filename}
                mimeType={f.mimeType}
                status={f.status}
                userId={f.userId}
                createdAt={f.createdAt}
                selected={isSelected(f.id)}
                onToggle={() => toggleSelected(f.id)}
                onAdd={() => onAdd(f.id)}
                disableAdd={!activeViewId}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
