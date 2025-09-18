"use client";

type Props = { url: string };

export function VideoViewer({ url }: Props) {
  return (
    <div className="p-4">
      <video controls src={url} className="w-full max-h-[70vh]" />
    </div>
  );
}

export default VideoViewer;


