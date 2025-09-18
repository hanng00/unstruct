"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Papa from "papaparse";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { url: string };

export function CsvViewer({ url }: Props) {
  const [markdown, setMarkdown] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
        if (parsed.errors?.length) {
          throw new Error(parsed.errors[0].message || "CSV parse error");
        }
        const rows = parsed.data as string[][];
        const table = toMarkdownTable(rows);
        if (!cancelled) setMarkdown(table);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to parse CSV");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return <div className="p-4 text-sm text-destructive">{error}</div>;
  }
  if (markdown == null) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 prose prose-sm dark:prose-invert max-w-none overflow-auto h-[80vh]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

function toMarkdownTable(rows: string[][]): string {
  if (!rows.length) return "";
  const header = rows[0] || [];
  const body = rows.slice(1);
  const headerLine = `| ${header.map(escapeCell).join(" | ")} |`;
  const separatorLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map((r) => `| ${r.map(escapeCell).join(" | ")} |`);
  return [headerLine, separatorLine, ...bodyLines].join("\n");
}

function escapeCell(s: string): string {
  return String(s ?? "").replace(/\|/g, "\\|");
}

export default CsvViewer;


