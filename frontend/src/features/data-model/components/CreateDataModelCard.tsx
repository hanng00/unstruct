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
// removed Textarea; fields are flat and preview-only now
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fieldsFromZodSchema } from "../lib/fields-from-jsonschema";
import { PimBigSchema } from "../schemas/examples/pim-big";
import { PimEssentialSchema } from "../schemas/examples/pim-essential";
import { Field, FieldSchema } from "../schemas/field";

// Form schema for validation
const createDataModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fields: z.array(FieldSchema).min(1, "Fields are required"),
});

type CreateDataModelFormData = z.input<typeof createDataModelSchema>;

type Props = {
  isPending?: boolean;
  onCreate: (input: { name: string; fields: Field[] }) => Promise<void> | void;
  onCancel: () => void;
};

const exampleSchemas = {
  pimBigSchema: PimBigSchema,
  pimEssentialSchema: PimEssentialSchema,
};

export function CreateDataModelCard({ isPending, onCreate, onCancel }: Props) {
  const form = useForm<CreateDataModelFormData>({
    resolver: zodResolver(createDataModelSchema),
    defaultValues: {
      name: "",
      fields: [],
    },
  });

  const handleExampleSelect = (exampleKey: string) => {
    const example = exampleSchemas[exampleKey as keyof typeof exampleSchemas];
    const derived = fieldsFromZodSchema(example);

    console.log("derived", derived);
    form.setValue("fields", derived, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateDataModelFormData) => {
    const normalized: Field[] = (data.fields ?? []).map((f) => ({
      ...f,
      nullable: Boolean((f as { nullable?: boolean }).nullable),
      required: (f as { required?: boolean }).required ?? true,
    })) as Field[];
    await onCreate({ name: data.name, fields: normalized });
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Data Model</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter data model name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fields"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Fields</FormLabel>
                    <Select onValueChange={handleExampleSelect}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Load example" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(exampleSchemas).map((key) => (
                          <SelectItem key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormControl>
                    <div className="rounded-md border bg-muted/30 p-3 max-h-[300px] overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(field.value ?? [], null, 2)}
                      </pre>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!form.formState.isValid || !!isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Creating..." : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CreateDataModelCard;
