"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useUpdateExtraction } from "../api/update-extraction";

interface EditableCellProps {
  value: unknown;
  fieldName: string;
  tabularViewId: string;
  fileId: string;
  extractionData: Record<string, unknown>;
}

export const EditableCell = ({
  value,
  fieldName,
  tabularViewId,
  fileId,
  extractionData,
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(value || ""));
  const inputRef = useRef<HTMLInputElement>(null);

  const updateExtractionMutation = useUpdateExtraction();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const updatedData = {
        ...extractionData,
        [fieldName]: editValue || null,
      };

      await updateExtractionMutation.mutateAsync({
        tabularViewId,
        fileId,
        input: { data: updatedData },
      });

      setIsEditing(false);
      toast.success("Updated");
    } catch (error) {
      console.error("Failed to update cell:", error);
      toast.error("Update failed");
    }
  };

  const handleCancel = () => {
    setEditValue(String(value || ""));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 text-sm rounded-none focus-visible:ring-0"
      />
    );
  }

  return (
    <div
      className="text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 min-h-[24px] flex items-center"
      onClick={() => setIsEditing(true)}
    >
      {value === null || value === undefined ? "—" : String(value)}
    </div>
  );
};