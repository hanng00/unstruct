"use client";

import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useGetExtraction } from "@/features/extractions/api/get-extraction";
import { useMemo, useState } from "react";
import ExtractionDataTable from "./ExtractionDataTable";
import ExtractionJson from "./ExtractionJson";
import ExtractionMeta from "./ExtractionMeta";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extractionId?: string | null;
};

export function ExtractionDetailsSheet({
  open,
  onOpenChange,
  extractionId,
}: Props) {
  const [tableView, setTableView] = useState(true);
  const id = useMemo(() => extractionId ?? "", [extractionId]);
  const { data: extraction, isLoading } = useGetExtraction(id);

  const data = extraction?.data || {};

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Extraction details</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : !extraction ? (
            <div className="text-sm text-muted-foreground">No data.</div>
          ) : (
            <div className="space-y-3">
              <ExtractionMeta id={extraction.id} status={extraction.status} createdAt={extraction.createdAt} />
              <div className="flex items-center justify-between mt-2 sticky top-0 z-10 bg-background">
                <div className="text-xs uppercase text-muted-foreground">
                  Data
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="table-view"
                    className="text-xs text-muted-foreground"
                  >
                    Table view
                  </Label>
                  <Switch
                    id="table-view"
                    checked={tableView}
                    onCheckedChange={setTableView}
                  />
                </div>
              </div>
              {tableView ? (
                <ExtractionDataTable data={data} />
              ) : (
                <ExtractionJson data={data} />
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ExtractionDetailsSheet;
