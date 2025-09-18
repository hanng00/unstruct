"use client";

type Props = { url: string };

export function OfficeViewer({ url }: Props) {
  const src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    url
  )}`;
  return (
    <div className="h-full">
      <iframe src={src} className="w-full h-[80vh]" />
    </div>
  );
}

export default OfficeViewer;


