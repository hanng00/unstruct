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
import {
  Form,
  FormControl,
  FormDescription,
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
import { useGetDataModel } from "@/features/data-model/api/get-data-model";
import { useUpdateDataModel } from "@/features/data-model/api/update-data-model";
import { addFieldToDataModel } from "@/features/data-model/lib/add-field-to-datamodel";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  dataModelId?: string;
  children?: React.ReactNode;
};

export const AddColumnsDialog = ({ dataModelId, children }: Props) => {
  const [open, setOpen] = React.useState(false);

  const { data: model } = useGetDataModel(dataModelId || "");
  const updateModel = useUpdateDataModel();

  const toColumnId = (raw: string): string => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Column name is required" }),
    description: z
      .string()
      .trim()
      .min(1, { message: "Column description is required" }),
    type: z.enum(["string", "number", "boolean"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "string",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const columnId = toColumnId(values.name);
    if (!dataModelId) {
      toast.error("Select a data model first");
      return;
    }

    if (!model?.schemaJson) throw new Error("Data model not found");

    try {
      const nextSchema = addFieldToDataModel(model.schemaJson, {
        fieldId: columnId,
        description: values.description,
        type: values.type,
      });

      await updateModel.mutateAsync({
        id: dataModelId,
        schemaJson: nextSchema,
      });
      toast.success(`Added column ${columnId}`);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add column", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add column</DialogTitle>
          <DialogDescription>
            Define a new nullable field to add to this data model.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input id="col-name" placeholder="e.g. weight" {...field} />
                  </FormControl>
                  <FormDescription>
                    Column id: {toColumnId(field.value || "") || "—"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      id="col-desc"
                      placeholder="What does this field represent?"
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="string">string</SelectItem>
                      <SelectItem value="number">number</SelectItem>
                      <SelectItem value="boolean">boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Field will be nullable (anyOf [type, null]).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!dataModelId || updateModel.isPending}
              >
                {updateModel.isPending ? "Adding…" : "Add column"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
