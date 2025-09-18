"use client";

type Props = {
  id: string;
  status: string;
  createdAt: string | number | Date;
};

export function ExtractionMeta({ id, status, createdAt }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs uppercase text-muted-foreground">Extraction ID</div>
        <div className="font-mono text-sm break-all">{id}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase text-muted-foreground">Status</div>
          <div>{status}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground">Created</div>
          <div>{new Date(createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default ExtractionMeta;


