"use client";

import Image from "next/image";

type Props = { url: string; alt?: string };

export function ImageViewer({ url, alt }: Props) {
  return (
    <div className="p-4">
      <Image src={url} alt={alt || ""} width={1200} height={800} style={{ height: "auto", width: "100%" }} />
    </div>
  );
}

export default ImageViewer;


