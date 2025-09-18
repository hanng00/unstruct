"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { DataModelSchemaJson } from "../schemas/datamodel";

export type DataModel = {
  id: string;
  userId: string;
  name: string;
  version: number;
  schemaJson: unknown;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  dataModel: DataModel;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (id: string, schemaJson: DataModelSchemaJson) => void;
  isUpdating?: boolean;
};

export function DataModelCard({
  dataModel,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  isUpdating,
}: Props) {
  const [schemaJsonText, setSchemaJsonText] = useState(
    JSON.stringify(dataModel.schemaJson, null, 2)
  );

  const handleSave = () => {
    try {
      const parsed = JSON.parse(schemaJsonText);
      onUpdate(dataModel.id, parsed);
    } catch (e) {
      console.error("Invalid JSON", e);
    }
  };

  return (
    <Card className="w-full max-w-screen-lg overflow-auto mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{dataModel.name}</CardTitle>
            <Badge variant="secondary">v{dataModel.version}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {formatDate(dataModel.createdAt)}
            </span>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Schema JSON</label>
              <Textarea
                value={schemaJsonText}
                onChange={(e) => setSchemaJsonText(e.target.value)}
                rows={8}
                className="font-mono text-sm max-h-[400px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!!isUpdating} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        {!isEditing && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Last updated: {formatDate(dataModel.updatedAt)}
            </div>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-[400px]">
              {JSON.stringify(dataModel.schemaJson, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

export default DataModelCard;
