"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDataModel } from "@/features/data-model/api/get-data-model";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useListWorkspaceFiles } from "../api/list-workspace-files";
import { useListWorkspaces } from "../api/list-workspaces";

export const WorkspaceList = () => {
  const { data: workspaces, isLoading, error } = useListWorkspaces();
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const items = (workspaces || []).filter((w) =>
      w.name.toLowerCase().includes(query.toLowerCase())
    );
    return items.sort((a, b) => {
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [workspaces, query, sortAsc]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (error)
    return (
      <div className="text-sm text-red-600">Failed to load workspaces</div>
    );
  if (!workspaces || workspaces.length === 0)
    return (
      <div className="text-sm text-muted-foreground border rounded-md p-4">
        <div className="font-medium text-foreground mb-1">No reviews yet</div>
        <p className="mb-2">
          Create your first review to organize files and approve extractions.
        </p>
        <p>
          Click <span className="font-medium">New workspace</span> above to get
          started. You can add files later from the Files page.
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Input
          placeholder="Search among your workspaces"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm text-md"
        />
      </div>

      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Name</TableHead>
              <TableHead>
                <button
                  className="inline-flex items-center gap-1 text-foreground/90"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Sort by created date"
                >
                  Created
                  <ArrowUpDown
                    className={`h-3.5 w-3.5 ${sortAsc ? "rotate-180" : ""}`}
                  />
                </button>
              </TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Columns</TableHead>
              <TableHead
                className="text-right"
                aria-label="Actions"
              ></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ws) => (
              <WorkspaceRowItem
                key={ws.id}
                id={ws.id}
                name={ws.name}
                createdAt={ws.createdAt}
                dataModelId={ws.dataModelId}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

type RowProps = {
  id: string;
  name: string;
  createdAt: string;
  dataModelId: string;
};

const WorkspaceRowItem = ({ id, name, createdAt, dataModelId }: RowProps) => {
  const { data: files, isLoading: filesLoading } = useListWorkspaceFiles(id);
  const { data: model, isLoading: modelLoading } = useGetDataModel(dataModelId);

  const docs = files?.length ?? 0;
  const columns = Object.keys(model?.fields || {}).length;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={`/workspaces/${encodeURIComponent(id)}`}
          className="hover:underline"
        >
          {name}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </TableCell>
      <TableCell>
        {filesLoading ? <Skeleton className="h-4 w-8" /> : docs}
      </TableCell>
      <TableCell>
        {modelLoading ? <Skeleton className="h-4 w-8" /> : columns}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild size="icon" variant="ghost" className="h-7 w-7">
          <Link
            href={`/workspaces/${encodeURIComponent(id)}`}
            aria-label="Open"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
};
