"use client";

type Props = {
  data: unknown;
};

export function ExtractionJson({ data }: Props) {
  return (
    <pre className="mt-1 rounded-md border bg-muted/30 p-3 text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default ExtractionJson;


