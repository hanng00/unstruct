"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { url: string; filename: string; mime: string };

export function TextViewer({ url, filename, mime }: Props) {
  const [content, setContent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load text");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return <div className="p-4 text-sm text-destructive">{error}</div>;
  }
  if (content == null) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  const isMarkdown = /markdown|md|mkdn|mdown|x-markdown/.test(mime) || filename.toLowerCase().endsWith(".md");

  if (isMarkdown) {
    return (
      <div className="p-4 prose prose-sm dark:prose-invert max-w-none overflow-auto h-[80vh]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto h-[80vh]">
      <pre className="text-xs whitespace-pre-wrap break-words">{content}</pre>
    </div>
  );
}

export default TextViewer;


