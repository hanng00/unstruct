"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { DataModelSchemaJson } from "../schemas/datamodel";
import { OrderSchema, ProductSchema, UserSchema } from "../schemas/examples";
import { FoxwayPackagingRecordSchema } from "../schemas/foxway";
import { PimEssentialSchema } from "../schemas/pim-essential";

type Props = {
  isPending?: boolean;
  onCreate: (input: {
    name: string;
    schemaJson: DataModelSchemaJson;
  }) => Promise<void> | void;
  onCancel: () => void;
};

const exampleSchemas = {
  user: UserSchema,
  product: ProductSchema,
  order: OrderSchema,
  foxwaySchema: FoxwayPackagingRecordSchema,
  pimEssentialSchema: PimEssentialSchema,
};

export function CreateDataModelCard({ isPending, onCreate, onCancel }: Props) {
  const [name, setName] = useState("");
  const [schemaJsonText, setSchemaJsonText] = useState("{}");

  const handleExampleSelect = (exampleKey: string) => {
    const example = exampleSchemas[exampleKey as keyof typeof exampleSchemas];
    const jsonSchema = z.toJSONSchema(example);
    setSchemaJsonText(JSON.stringify(jsonSchema, null, 2));
  };

  const handleCreate = async () => {
    try {
      const parsed = JSON.parse(schemaJsonText);
      await onCreate({ name, schemaJson: parsed });
      setName("");
      setSchemaJsonText("{}");
    } catch (e) {
      console.error("Invalid JSON", e);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Data Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter data model name"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Schema JSON</label>
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
          <Textarea
            value={schemaJsonText}
            onChange={(e) => setSchemaJsonText(e.target.value)}
            placeholder="Enter JSON schema"
            rows={8}
            className="font-mono text-sm max-h-[400px] overflow-auto"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} disabled={!name || !!isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Creating..." : "Create"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateDataModelCard;
