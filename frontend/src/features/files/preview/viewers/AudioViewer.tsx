"use client";

type Props = { url: string };

export function AudioViewer({ url }: Props) {
  return (
    <div className="p-4">
      <audio controls src={url} className="w-full" />
    </div>
  );
}

export default AudioViewer;


