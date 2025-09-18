"use client";

type Props = { url: string };

export function PdfViewer({ url }: Props) {
  return (
    <div className="h-full">
      <iframe src={url} className="w-full h-[80vh]" />
    </div>
  );
}

export default PdfViewer;


