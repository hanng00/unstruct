"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Props = {
  status?: "queued" | "processing" | "completed" | "failed";
};

export const ExtractionStatusBadge = ({ status }: Props) => {
  if (!status) return null;
  const common = "h-5 px-2 text-xs gap-1 inline-flex items-center";
  if (status === "queued") {
    return (
      <Badge variant="secondary" className={common}>
        <Loader2 className="h-3 w-3 animate-spin" /> queued
      </Badge>
    );
  }
  if (status === "processing") {
    return (
      <Badge variant="secondary" className={common}>
        <Loader2 className="h-3 w-3 animate-spin" /> processing
      </Badge>
    );
  }
  if (status === "completed") {
    return (
      <Badge variant="outline" className={common}>completed</Badge>
    );
  }
  return (
    <Badge variant="destructive" className={common}>failed</Badge>
  );
};


