"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, FieldSchema } from "../schemas/field";

const fieldFormSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  description: z.string().optional(),
  type: z.enum(["string", "number", "date", "enum"]),
  nullable: z.boolean(),
  required: z.boolean(),
  enumValues: z.array(z.string()).optional(),
});

type FieldFormData = z.infer<typeof fieldFormSchema>;

type Props = {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  isReadOnly?: boolean;
};

const deriveFieldId = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
};

export function FieldEditor({ fields, onFieldsChange, isReadOnly = false }: Props) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "string",
      nullable: false,
      required: true,
      enumValues: [],
    },
  });

  const handleAddField = () => {
    setIsAddingField(true);
    setEditingFieldId(null);
    form.reset({
      name: "",
      description: "",
      type: "string",
      nullable: false,
      required: true,
      enumValues: [],
    });
  };

  const handleEditField = (field: Field) => {
    setEditingFieldId(field.id);
    setIsAddingField(false);
    form.reset({
      name: field.name,
      description: field.description || "",
      type: field.type,
      nullable: field.nullable,
      required: field.required,
      enumValues: field.type === "enum" ? field.enumValues : [],
    });
  };

  const handleCancel = () => {
    setIsAddingField(false);
    setEditingFieldId(null);
    form.reset();
  };

  const handleSave = (data: FieldFormData) => {
    try {
      const fieldId = isAddingField ? deriveFieldId(data.name) : editingFieldId!;
      
      // Check for duplicate field IDs when adding a new field
      if (isAddingField && fields.some(f => f.id === fieldId)) {
        form.setError("name", {
          type: "manual",
          message: `A field with ID "${fieldId}" already exists. Please choose a different name.`
        });
        return;
      }
      
      const newField = FieldSchema.parse({
        id: fieldId,
        ...data,
        enumValues: data.type === "enum" ? data.enumValues : undefined,
      });

      if (isAddingField) {
        onFieldsChange([...fields, newField]);
      } else {
        onFieldsChange(
          fields.map((f) => (f.id === editingFieldId ? newField : f))
        );
      }

      handleCancel();
    } catch (error) {
      console.error("Failed to save field:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to save field. Please check your input and try again."
      });
    }
  };

  const handleDeleteField = (fieldId: string) => {
    onFieldsChange(fields.filter((f) => f.id !== fieldId));
  };

  const addEnumValue = () => {
    const currentValues = form.getValues("enumValues") || [];
    form.setValue("enumValues", [...currentValues, ""]);
  };

  const removeEnumValue = (index: number) => {
    const currentValues = form.getValues("enumValues") || [];
    form.setValue("enumValues", currentValues.filter((_, i) => i !== index));
  };

  const updateEnumValue = (index: number, value: string) => {
    const currentValues = form.getValues("enumValues") || [];
    const newValues = [...currentValues];
    newValues[index] = value;
    form.setValue("enumValues", newValues);
  };

  return (
    <div className="space-y-4">
      {/* Field List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Fields ({fields.length})</h3>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-auto">
          {fields.map((field) => (
            <Card key={field.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{field.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {field.type}
                    </span>
                    {field.nullable && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        nullable
                      </span>
                    )}
                    {field.required && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        required
                      </span>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.description}
                    </p>
                  )}
                  {field.type === "enum" && field.enumValues && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Values: {field.enumValues.join(", ")}
                    </p>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditField(field)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Field Form */}
      {(isAddingField || editingFieldId) && !isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {isAddingField ? "Add Field" : "Edit Field"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    const derivedId = field.value ? deriveFieldId(field.value) : "";
                    const isDuplicate = isAddingField && derivedId && fields.some(f => f.id === derivedId);
                    
                    return (
                      <FormItem>
                        <FormLabel>Field Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Product Name" {...field} />
                        </FormControl>
                        <FormMessage />
                        {field.value && (
                          <p className={`text-xs ${isDuplicate ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Field ID: <code className="bg-muted px-1 rounded">{derivedId}</code>
                            {isDuplicate && " (already exists)"}
                          </p>
                        )}
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="enum">Enum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "enum" && (
                  <div className="space-y-2">
                    <FormLabel>Enum Values</FormLabel>
                    {form.watch("enumValues")?.map((value, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={value}
                          onChange={(e) => updateEnumValue(index, e.target.value)}
                          placeholder="Enum value"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEnumValue(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEnumValue}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Value
                    </Button>
                  </div>
                )}

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="nullable"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Nullable</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Required</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.formState.errors.root && (
                  <div className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    {isAddingField ? "Add Field" : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
