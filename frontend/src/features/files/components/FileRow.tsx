"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

type Props = {
  id: string;
  filename: string;
  mimeType: string;
  status: "pending" | "completed";
  userId: string;
  createdAt: string;
  selected: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  disableAdd?: boolean;
};

export function FileRow({ filename, mimeType, status, userId, createdAt, selected, onToggle, onAdd, disableAdd }: Props) {
  return (
    <TableRow onClick={onToggle} className={selected ? "bg-muted/50" : undefined}>
      <TableCell>
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label="Select file" />
      </TableCell>
      <TableCell className="font-medium">{filename}</TableCell>
      <TableCell>{mimeType}</TableCell>
      <TableCell>
        <Badge variant={status === "completed" ? "default" : "secondary"}>{status}</Badge>
      </TableCell>
      <TableCell className="font-mono text-xs">{userId}</TableCell>
      <TableCell>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</TableCell>
      <TableCell>
        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onAdd?.(); }} disabled={disableAdd}>
          Add
        </Button>
      </TableCell>
    </TableRow>
  );
}


