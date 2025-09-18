"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type FC, useEffect, useState } from "react";

type ExtractionListItem = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  items: ExtractionListItem[];
  isLoading?: boolean;
  headerAction?: React.ReactNode;
  onShowDetails?: (extractionId: string) => void;
};

const ExtractionsList: FC<Props> = ({
  items,
  isLoading,
  headerAction,
  onShowDetails,
}) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "queued":
        return <Badge variant="outline">Queued</Badge>;
      case "processing":
        return (
          <Badge>
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
            </span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Extractions</h2>
        {headerAction}
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No extractions yet.</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((ex) => (
            <li key={ex.id} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusBadge(ex.status)}
                  {ex.status === "processing" ? (
                    <span className="text-xs text-muted-foreground">
                      Processing for {formatDuration(now - new Date(ex.updatedAt).getTime())}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {new Date(ex.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowDetails?.(ex.id)}
                    disabled={ex.status !== "completed"}
                  >
                    Show more
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExtractionsList;


