import { LoaderCircle } from "lucide-react";

export function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <LoaderCircle className="size-4 animate-spin" />
    </div>
  );
}
