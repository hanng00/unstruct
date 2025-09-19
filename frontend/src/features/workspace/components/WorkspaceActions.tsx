"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetDataModel } from "@/features/data-model/api/get-data-model";
import { prettifyKey } from "@/lib/parse";
import { Columns3, Play, PlusIcon, Workflow, WrapText } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useGetWorkspace } from "../api/get-workspace";
import { useListWorkspaceRows } from "../api/list-workspace-rows";
import { useRunWorkspaceExtractions } from "../api/run-workspace-extractions";
import { useCommitWorkspaceEdits } from "../hooks/use-commit-workspace-edits";
import { useWorkspaceEditBuffer } from "../store/use-workspace-edit-buffer";
import { useWorkspaceTableSettings } from "../store/use-workspace-table-settings";
import { AddColumnsDialog } from "./AddColumnsDialog";
import { AddFilesToWorkspaceDialog } from "./AddFilesToWorkspaceDialog";

type Props = {
  workspaceId: string;
};

export const WorkspaceActions = ({ workspaceId }: Props) => {
  // Data fetching
  const { data: workspace } = useGetWorkspace(workspaceId);
  const { data: rows } = useListWorkspaceRows(workspaceId);
  const { data: dataModel } = useGetDataModel(workspace?.dataModelId);

  // Data mutations
  const mutationRerunExtraction = useRunWorkspaceExtractions();

  const { commitWorkspaceEdits, isPending, error } = useCommitWorkspaceEdits({
    workspaceId,
    onSuccess: () => {
      toast.success("Saved edits");
    },
    onError: () => {
      toast.error(error?.message || "Failed to save edits");
    },
  });

  // Local state
  const getEdits = useWorkspaceEditBuffer((s) => s.getEdits);
  const pivotOn = useWorkspaceTableSettings((s) => s.pivotOn);
  const setPivotOn = useWorkspaceTableSettings((s) => s.setPivotOn);

  const pivotableFields = dataModel?.fields.map((f) => f.id) || [];
  const workspaceFileIds = useMemo(
    () => rows?.map((r) => r.fileId) || [],
    [rows]
  );

  // Handlers
  const handleRun = async () => {
    try {
      await mutationRerunExtraction.mutateAsync({
        workspaceId,
        fileIds: workspaceFileIds,
        pivotOn,
      });
      toast.success("Extractions started");
    } catch {
      toast.error("Failed to start extractions");
    }
  };

  const editCount = useMemo(
    () =>
      workspaceFileIds.reduce(
        (acc, fileId) => acc + Object.keys(getEdits(fileId) || {}).length,
        0
      ),
    [workspaceFileIds, getEdits]
  );

  return (
    <div className="border-b px-4 py-2 flex items-center gap-2">
      <AddFilesToWorkspaceDialog workspaceId={workspaceId}>
        <Button size="sm" variant="outline">
          <PlusIcon />
          Add files
        </Button>
      </AddFilesToWorkspaceDialog>

      {!!workspace?.dataModelId && (
        <AddColumnsDialog dataModelId={workspace.dataModelId}>
          <Button size="sm" variant="outline">
            <Columns3 />
            Add columns
          </Button>
        </AddColumnsDialog>
      )}

      {pivotableFields?.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant={pivotOn ? "secondary" : "outline"}>
              <Workflow />
              Pivot on{pivotOn ? `: ${pivotOn}` : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="flex items-center gap-2">
              <Label htmlFor="pivot-select" className="text-xs">
                Field
              </Label>
              <Select onValueChange={(v) => setPivotOn(v)} value={pivotOn}>
                <SelectTrigger id="pivot-select" className="h-8 w-[200px]">
                  <SelectValue placeholder="Select field (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {pivotableFields?.map((field) => (
                    <SelectItem key={field} value={field}>
                      {prettifyKey(field)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPivotOn(undefined)}
              >
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="ml-auto flex items-center gap-2">
        <CellWrapToggle />

        <Button
          size="sm"
          variant="outline"
          onClick={handleRun}
          disabled={
            workspaceFileIds.length === 0 || mutationRerunExtraction.isPending
          }
        >
          <Play />
          {mutationRerunExtraction.isPending
            ? "Running…"
            : "Run all extractions"}
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => commitWorkspaceEdits()}
          disabled={editCount === 0 || isPending}
        >
          {isPending && "Saving…"}
          {!isPending && `Save edits ${editCount > 0 ? `(${editCount})` : ""}`}
        </Button>
      </div>
    </div>
  );
};

const CellWrapToggle = () => {
  const wrapCells = useWorkspaceTableSettings((s) => s.wrapCells);
  const setWrapCells = useWorkspaceTableSettings((s) => s.setWrapCells);
  return (
    <Button
      size="sm"
      variant={wrapCells ? "secondary" : "outline"}
      onClick={() => setWrapCells(!wrapCells)}
      title={wrapCells ? "Disable wrap" : "Enable wrap"}
    >
      <WrapText className="h-4 w-4" />
      {wrapCells ? "Wrap" : "Truncate"}
    </Button>
  );
};
