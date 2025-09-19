import { Badge } from "@/components/ui/badge";
import { Extraction } from "@/features/extractions/models/extraction";
import { formatDistanceToNow } from "date-fns";

type Props = {
  status: Extraction["status"];
  updatedAt: string;
};
export const StatusCell = ({ status, updatedAt }: Props) => {
  const parseStatus = (
    status: Extraction["status"]
  ): {
    text: string;
    variant: "secondary" | "default" | "destructive" | "outline";
  } => {
    switch (status) {
      case "queued":
      case "processing":
        return { text: "Queued", variant: "secondary" };
      case "completed":
        return { text: "Completed", variant: "outline" };
      case "failed":
        return { text: "Failed", variant: "destructive" };
    }
  };

  const processedFor = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
  });

  const { text, variant } = parseStatus(status);
  return (
    <Badge variant={variant} className="text-xs">
      {text}
      {status === "processing" && (
        <span className="text-xs text-muted-foreground">{processedFor}</span>
      )}
    </Badge>
  );
};
