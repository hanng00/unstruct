import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { TabularViewNavbar } from "../components/TabularNavbar";

type Props = {
  tabularId: string;
};
export const TabularHeader = ({ tabularId }: Props) => {
  const router = useRouter();

  const handleTabularViewChange = (tabularId: string) => {
    router.push(`/tabular/${tabularId}`);
  };

  return (
    <div className="flex flex-row w-full justify-between items-center">
      <TabularViewNavbar
        tabularId={tabularId}
        onTabularViewChange={handleTabularViewChange}
      />

      <Button variant="secondary" size="sm">
        <Download />
        Download
      </Button>
    </div>
  );
};
