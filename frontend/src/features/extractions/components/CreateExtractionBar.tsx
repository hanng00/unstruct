"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListDataModels } from "@/features/data-model/api/list-data-models";
import { useState } from "react";
import { useCreateExtraction } from "../api/create-extraction";

type Props = {
  fileId: string;
  onCreated?: () => void;
};

export function CreateExtractionBar({ fileId, onCreated }: Props) {
  const { data: dataModels = [], isLoading } = useListDataModels();
  const createExtraction = useCreateExtraction();
  const [selectedDataModelId, setSelectedDataModelId] = useState<string>("");

  const onCreate = async () => {
    if (!selectedDataModelId) return;
    await createExtraction.mutateAsync({ fileId, dataModelId: selectedDataModelId });
    setSelectedDataModelId("");
    onCreated?.();
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedDataModelId} onValueChange={setSelectedDataModelId} disabled={isLoading || createExtraction.isPending}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={isLoading ? "Loading data models..." : "Select data model"} />
        </SelectTrigger>
        <SelectContent>
          {dataModels.map((dm) => (
            <SelectItem key={dm.id} value={dm.id}>{dm.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onCreate} disabled={!selectedDataModelId || createExtraction.isPending}>
        {createExtraction.isPending ? "Creating..." : "Create extraction"}
      </Button>
    </div>
  );
}

export default CreateExtractionBar;

