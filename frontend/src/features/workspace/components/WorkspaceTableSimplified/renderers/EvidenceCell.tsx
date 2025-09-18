"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { EvidenceData } from "@/features/extractions/models/evidence";
import { isEvidence } from "@/features/workspace/lib/evidence";
import { Eye } from "lucide-react";
import { useState } from "react";

interface EvidenceCellProps {
  value: EvidenceData | unknown;
  className?: string;
}

export function EvidenceCell({ value, className = "" }: EvidenceCellProps) {
  const [open, setOpen] = useState(false);

  // If no value at all, show a skeleton
  if (!value) {
    return (
      <div className={`text-xs ${className}`}>
        <Skeleton className="w-full h-4" />
      </div>
    );
  }

  if (!isEvidence(value)) {
    return (
      <div className={`text-xs ${className}`}>{JSON.stringify(value)}</div>
    );
  }

  const { answer, rationale } = value;

  const typeToRenderer = (
    value: unknown,
    nullFill: string = ""
  ): ((obj: unknown) => string) => {
    if (!value) return () => nullFill;

    // Scalars are returned as is
    if (["string", "number", "boolean"].includes(typeof value)) {
      return (obj: unknown) => String(obj);
    }
    // Objects are stringified
    return (obj: unknown) => JSON.stringify(obj, null, 2);
  };

  const renderer = typeToRenderer(answer);
  const rendererForRationale = typeToRenderer(rationale, "N/A");

  return (
    <div
      className={`group relative flex items-center justify-between w-full h-full text-xs ${className}`}
    >
      <span>{renderer(answer)}</span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="z-10">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Eye /> Open
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Answer
              </h4>
              <div className="text-xs">{rendererForRationale(answer)}</div>
            </div>

            {rationale && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Rationale
                </h4>
                <div className="text-xs  whitespace-pre-wrap">{rationale}</div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
