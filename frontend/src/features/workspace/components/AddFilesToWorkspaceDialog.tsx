"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListFiles } from "@/features/files/api/list-files";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { useAddFilesToWorkspace } from "../api/add-files-to-workspace";

type Props = { workspaceId: string; children?: React.ReactNode };

export const AddFilesToWorkspaceDialog = ({ workspaceId, children }: Props) => {
  const { data: files } = useListFiles();
  const addFiles = useAddFilesToWorkspace(workspaceId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = (files || []).filter((f) =>
    (f.filename || "").toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string, checked: boolean | string) => {
    setSelected((s) => ({ ...s, [id]: Boolean(checked) }));
  };

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const handleAdd = async () => {
    await addFiles.mutateAsync(selectedIds);
    setOpen(false);
    setSelected({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" variant="outline">
            <FileUp />
            Add files
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add files to workspace</DialogTitle>
          <DialogDescription>
            Select existing files to link to this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search by filename"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ScrollArea className="h-72 w-full  border rounded-md">
            <div className="p-3 space-y-2">
              {filtered.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-3 text-sm min-w-0"
                >
                  <Checkbox
                    checked={Boolean(selected[f.id])}
                    onCheckedChange={(c) => toggle(f.id, c)}
                  />
                  <span className="truncate flex-1">{f.filename}</span>
                  <span className="ml-2 text-xs text-muted-foreground flex-shrink-0">
                    {(f.size ?? 0).toLocaleString()} bytes
                  </span>
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No files found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || addFiles.isPending}
          >
            {addFiles.isPending
              ? "Adding…"
              : `Add ${selectedIds.length} file${
                  selectedIds.length === 1 ? "" : "s"
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
