"use client";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListDataModels } from "@/features/data-model/api/list-data-models";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateWorkspace } from "../api/create-workspace";
import { useCreateWorkspaceWithOptionalDataModel } from "../hooks/use-create-workspace-with-optional-datamodel";

export const CreateWorkspaceDialog = () => {
  const router = useRouter();
  const { data: models } = useListDataModels();
  const mutation = useCreateWorkspace();
  const createWithOptional = useCreateWorkspaceWithOptionalDataModel();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dataModelId, setDataModelId] = useState("__new__");

  const canSubmit = Boolean(name) && !createWithOptional.isPending;

  const handleCreate = async () => {
    const ws = await createWithOptional.mutateAsync({
      name,
      dataModelId: dataModelId === "__new__" ? undefined : dataModelId,
      createEmptyIfMissing: true,
    });
    setOpen(false);
    setName("");
    setDataModelId("__new__");
    router.push(`/workspaces/${ws.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          New workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Pick a name and a data model. You can add files later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Product Review"
            />
          </div>
          <div className="space-y-2">
            <Label>Data model</Label>
            <Select value={dataModelId} onValueChange={setDataModelId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a data model" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-auto">
                <SelectItem value="__new__">
                  New empty data model (default)
                </SelectItem>
                {(models || []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit}>
            {createWithOptional.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
