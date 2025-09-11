"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddFilesToView } from "@/features/tabular/api";
import { useListFileReferences } from "../api/list-files";

type Props = { activeViewId?: string };

export function FileListSimple({ activeViewId }: Props) {
  const { data: files, isLoading, error } = useListFileReferences();
  const add = useAddFilesToView(activeViewId || "");

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error) return <div className="text-sm text-red-600">Failed to load files</div>;

  return (
    <div className="space-y-2">
      {(files || []).map((f) => (
        <div key={f.id} className="flex items-center justify-between rounded border px-3 py-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{f.filename}</div>
            <div className="text-xs text-muted-foreground truncate">{(f.size ?? 0).toLocaleString()} bytes</div>
          </div>
          <Button size="sm" variant="secondary" disabled={!activeViewId} onClick={() => add.mutate([f.id])}>Add</Button>
        </div>
      ))}
    </div>
  );
}


