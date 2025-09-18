"use client";

import { type FC } from "react";

type Props = {
  filename: string;
  status?: string;
};

const FileHeader: FC<Props> = ({ filename, status }) => {
  return (
    <div className="mt-2 text-sm text-muted-foreground">
      <h1 className="text-2xl">{filename}</h1>
      {status && <div>Status: {status}</div>}
    </div>
  );
};

export default FileHeader;


