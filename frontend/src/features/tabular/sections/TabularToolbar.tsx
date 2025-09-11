import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { FilePlus, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetView, useListExtractions, useRunAllExtractions } from "../api";
import { AddColumnDialog } from "../components/AddColumnDialog";

type Props = {
  tabularId: string;
};

export const TabularToolbar = ({ tabularId }: Props) => {
  const { data: tabularView } = useGetView(tabularId);
  const runAllExtractionsMutation = useRunAllExtractions();
  const { refetch: refetchExtractions } = useListExtractions(tabularId);
  const [isRunningExtractions, setIsRunningExtractions] = useState(false);

  const handleAddDocument = () => {
    console.log("Add Document");
  };

  const handleRunAll = async () => {
    if (!tabularView?.dataModelId) {
      toast.error("Please add a data model first");
      return;
    }

    setIsRunningExtractions(true);
    try {
      const result = await runAllExtractionsMutation.mutateAsync(tabularId);
      toast.success(`Enqueued ${result.enqueued} files for extraction`);
      // Refresh the extractions data after running extractions
      await refetchExtractions();
    } catch (error) {
      console.error("Failed to run extractions:", error);
      toast.error("Failed to run extractions. Please try again.");
    } finally {
      setIsRunningExtractions(false);
    }
  };

  const handleRefresh = async () => {
    await refetchExtractions();
    toast.success("Data refreshed");
  };

  return (
    <div className="flex flex-row w-full justify-between items-center">
      {/* LEFT TOOLS */}
      <div className="flex flex-row gap-2">
        <Button variant="outline" size="sm" onClick={handleAddDocument}>
          <FilePlus />
          Add document
        </Button>
        {tabularView?.dataModelId && (
          <AddColumnDialog dataModelId={tabularView.dataModelId} />
        )}
      </div>

      {/* RIGHT TOOLS */}
      <div className="flex flex-row gap-2">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRunAll}
          disabled={
            isRunningExtractions ||
            !tabularView?.dataModelId ||
            runAllExtractionsMutation.isPending
          }
        >
          <Play />
          {isRunningExtractions || runAllExtractionsMutation.isPending ? (
            <Loader />
          ) : (
            "Run all"
          )}
        </Button>
      </div>
    </div>
  );
};
