"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { DataModel, Field } from "../schemas/datamodel";
import { FieldEditor } from "./FieldEditor";

type Props = {
  dataModel: DataModel;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (id: string, fields: Field[]) => void;
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
  const [fields, setFields] = useState(dataModel.fields);

  const handleSave = () => {
    onUpdate(dataModel.id, fields);
  };

  const handleFieldsChange = (newFields: Field[]) => {
    setFields(newFields);
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
            <FieldEditor
              fields={fields}
              onFieldsChange={handleFieldsChange}
              isReadOnly={false}
            />
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
            <FieldEditor
              fields={dataModel.fields}
              onFieldsChange={() => {}} // No-op for read-only
              isReadOnly={true}
            />
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
