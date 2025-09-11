"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useListViews } from "@/features/tabular/api/list-tabular-views";
import { formatDistanceToNow } from "date-fns";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export const TabularViewList = () => {
  const { data: views, isLoading, error } = useListViews();

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error)
    return <div className="text-sm text-red-600">Failed to load views</div>;
  if (!views) return <div className="text-sm text-red-600">No views found</div>;

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[20vh]">
        <div className="gap-4 flex flex-col">
          {views.map((view) => (
            <div className="flex items-center justify-between" key={view.id}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate">{view.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(view.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <Button asChild size="sm" variant="outline" className="ml-2">
                <Link href={`/tabular/${view.id}`}>Open</Link>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
