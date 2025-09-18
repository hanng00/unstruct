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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Columns3, Play, PlusIcon, Workflow, WrapText } from "lucide-react";
import { toast } from "sonner";
import { useRunWorkspaceExtractions } from "../api/run-workspace-extractions";
import { useUpdateWorkspaceExtraction } from "../api/update-workspace-extraction";
import { useWorkspaceEditBuffer } from "../store/use-workspace-edit-buffer";
import { useWorkspaceTableSettings } from "../store/use-workspace-table-settings";
import { AddColumnsDialog } from "./AddColumnsDialog";
import { AddFilesToWorkspaceDialog } from "./AddFilesToWorkspaceDialog";

type Props = {
  workspaceId: string;
  selectedFileIds?: string[];
  selectedDataModelId?: string;
};

export const WorkspaceActions = ({
  workspaceId,
  selectedFileIds = [],
  selectedDataModelId,
}: Props) => {
  const qc = useQueryClient();
  const getEdits = useWorkspaceEditBuffer((s) => s.getEdits);
  const clearEdits = useWorkspaceEditBuffer((s) => s.clearEdits);
  const editsByFileId = useWorkspaceEditBuffer((s) => s.editsByFileId);
  const rerunMutation = useRunWorkspaceExtractions();
  const updateMutation = useUpdateWorkspaceExtraction();
  const { data: dataModel } = useGetDataModel(selectedDataModelId || "");
  const pivotableFields = Object.keys(dataModel?.schemaJson.properties || {});
  const pivotOn = useWorkspaceTableSettings((s) => s.pivotOn);
  const setPivotOn = useWorkspaceTableSettings((s) => s.setPivotOn);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = selectedFileIds.map(async (fileId) => {
        const edits = getEdits(fileId);
        if (Object.keys(edits).length === 0) return;
        await updateMutation.mutateAsync({
          workspaceId,
          fileId,
          updates: {
            overrides: edits,
          },
        });
        clearEdits(fileId);
      });
      await Promise.all(promises);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workspace-rows", workspaceId] });
      toast.success("Saved edits");
    },
    onError: () => {
      toast.error("Failed to save edits");
    },
  });

  const handleRun = async () => {
    try {
      await rerunMutation.mutateAsync({
        workspaceId,
        fileIds: selectedFileIds,
        pivotOn,
      });
      toast.success("Extractions started");
    } catch {
      toast.error("Failed to start extractions");
    }
  };

  const editCount = selectedFileIds.reduce(
    (acc, fileId) => acc + Object.keys(editsByFileId[fileId] || {}).length,
    0
  );

  return (
    <div className="border-b px-4 py-2 flex items-center gap-2">
      <AddFilesToWorkspaceDialog workspaceId={workspaceId}>
        <Button size="sm" variant="outline">
          <PlusIcon />
          Add files
        </Button>
      </AddFilesToWorkspaceDialog>

      {!!selectedDataModelId && (
        <AddColumnsDialog dataModelId={selectedDataModelId}>
          <Button size="sm" variant="outline">
            <Columns3 />
            Add columns
          </Button>
        </AddColumnsDialog>
      )}

      {pivotableFields.length > 0 && (
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
                  {pivotableFields.map((field) => (
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
          disabled={selectedFileIds.length === 0 || rerunMutation.isPending}
        >
          <Play />
          {rerunMutation.isPending ? "Running…" : "Run all extractions"}
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => saveMutation.mutate()}
          disabled={
            editCount === 0 ||
            saveMutation.isPending ||
            updateMutation.isPending
          }
        >
          {updateMutation.isPending && "Saving…"}
          {!updateMutation.isPending &&
            `Save edits ${editCount > 0 ? `(${editCount})` : ""}`}
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
