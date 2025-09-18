"use client";

type Props = { url: string };

export function GoogleViewer({ url }: Props) {
  const src = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  return (
    <div className="h-full">
      <iframe src={src} className="w-full h-[80vh]" />
    </div>
  );
}

export default GoogleViewer;


