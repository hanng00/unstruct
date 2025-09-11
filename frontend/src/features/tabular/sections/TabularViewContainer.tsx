import { Separator } from "@/components/ui/separator";
import { TabularContent } from "./TabularContent";
import { TabularHeader } from "./TabularHeader";
import { TabularToolbar } from "./TabularToolbar";

type Props = {
  selectedTabularId: string;
};
export const TabularViewContainer = ({ selectedTabularId }: Props) => {
  return (
    <div className="flex flex-col bg-background h-full">
      <div className="p-3 flex flex-col gap-3">
        <TabularHeader tabularId={selectedTabularId} />
        <Separator />
        <TabularToolbar tabularId={selectedTabularId} />
      </div>
      <TabularContent tabularViewId={selectedTabularId} />
    </div>
  );
};
