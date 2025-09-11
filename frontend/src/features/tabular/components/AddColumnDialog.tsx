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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { useGetDataModel, useUpdateDataModel } from "../api";
import { useSchemaFields } from "../hooks/use-schema-fields";

interface AddColumnDialogProps {
  dataModelId: string;
}

const FIELD_TYPES = [
  { value: "string", label: "Text", schema: z.string() },
  { value: "number", label: "Number", schema: z.number() },
  { value: "date", label: "Date", schema: z.string().datetime() },
  { value: "boolean", label: "Boolean", schema: z.boolean() },
  { value: "array", label: "List", schema: z.array(z.string()) },
];

export const AddColumnDialog = ({ dataModelId }: AddColumnDialogProps) => {
  const [open, setOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("string");
  const [fieldDescription, setFieldDescription] = useState("");

  const { data: dataModel } = useGetDataModel(dataModelId);
  const updateDataModel = useUpdateDataModel();
  const currentFields = useSchemaFields(dataModel?.schemaJson);

  const handleAddColumn = async () => {
    if (!fieldName.trim() || !dataModel) return;

    // Check if field name already exists
    if (currentFields.some(field => field.name === fieldName)) {
      alert("A column with this name already exists");
      return;
    }

    // Get the selected field type schema
    const selectedFieldType = FIELD_TYPES.find(type => type.value === fieldType);
    if (!selectedFieldType) return;

    // Create a Zod schema for the new field
    let fieldSchema = selectedFieldType.schema;
    if (fieldDescription) {
      fieldSchema = fieldSchema.describe(fieldDescription);
    }

    // Convert the field schema to JSON Schema
    const fieldJsonSchema = zodToJsonSchema(fieldSchema);

    // Create new schema with added field
    const currentSchema = dataModel.schemaJson as Record<string, unknown>;
    const newSchema = {
      ...currentSchema,
      properties: {
        ...(currentSchema.properties as Record<string, unknown> || {}),
        [fieldName]: fieldJsonSchema,
      },
    };

    try {
      await updateDataModel.mutateAsync({
        id: dataModelId,
        input: { schemaJson: newSchema },
      });

      // Reset form
      setFieldName("");
      setFieldType("string");
      setFieldDescription("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
          <DialogDescription>
            Add a new column to your data model. This will be available for all files in this view.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="field-name">Column Name</Label>
            <Input
              id="field-name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., amount, category, status"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="field-type">Data Type</Label>
            <Select value={fieldType} onValueChange={setFieldType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="field-description">Description (Optional)</Label>
            <Textarea
              id="field-description"
              value={fieldDescription}
              onChange={(e) => setFieldDescription(e.target.value)}
              placeholder="Describe what this column represents..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddColumn} 
            disabled={!fieldName.trim() || updateDataModel.isPending}
          >
            {updateDataModel.isPending ? "Adding..." : "Add Column"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
