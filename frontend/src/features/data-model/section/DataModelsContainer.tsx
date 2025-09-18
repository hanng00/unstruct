"use client";

import { GeneralNavbar } from "@/components/general-navbar";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCreateDataModel } from "../api/create-data-model";
import { useListDataModels } from "../api/list-data-models";
import { useUpdateDataModel } from "../api/update-data-model";
import { CreateDataModelCard } from "../components/CreateDataModelCard";
import { DataModelCard } from "../components/DataModelCard";
import { DataModelSchemaJson } from "../schemas/datamodel";

export default function DataModelsContainer() {
  const { data: dataModels = [], isLoading } = useListDataModels();
  const createMutation = useCreateDataModel();
  const updateMutation = useUpdateDataModel();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (input: {
    name: string;
    schemaJson: DataModelSchemaJson;
  }) => {
    try {
      await createMutation.mutateAsync(input);
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create data model:", error);
    }
  };

  const handleUpdate = async (id: string, schemaJson: DataModelSchemaJson) => {
    try {
      await updateMutation.mutateAsync({
        id,
        schemaJson,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update data model:", error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <GeneralNavbar
        breadcrumbConfig={[{ label: "Data Models", href: "/data-models" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
            New Data Model
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {isCreating && (
            <CreateDataModelCard
              isPending={createMutation.isPending}
              onCreate={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          )}

          {/* Data Models List */}
          <div className="grid gap-4">
            {dataModels.map((dataModel) => (
              <DataModelCard
                key={dataModel.id}
                dataModel={dataModel}
                isEditing={editingId === dataModel.id}
                onEdit={() => setEditingId(dataModel.id)}
                onCancel={() => setEditingId(null)}
                onUpdate={handleUpdate}
                isUpdating={updateMutation.isPending}
              />
            ))}
          </div>

          {isLoading && (
            <div className="text-center text-muted-foreground py-8">
              <Loader />
            </div>
          )}

          {!isLoading && dataModels.length === 0 && !isCreating && (
            <div className="text-center text-muted-foreground py-8">
              No data models found. Create your first data model to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
