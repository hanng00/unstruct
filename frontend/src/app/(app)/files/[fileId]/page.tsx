"use client";

import FileIdContainer from "@/features/files/components/FileIdContainer";
import { use } from "react";

type Props = {
  params: Promise<{
    fileId: string;
  }>;
};
export const FileIdPage = ({ params }: Props) => {
  const { fileId } = use(params);

  return <FileIdContainer fileId={fileId} />;
};

export default FileIdPage;
