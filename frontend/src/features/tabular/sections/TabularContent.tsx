import { TabularEmpty } from "../components/TabularEmpty";
import { TabularError } from "../components/TabularError";
import { TabularLoading } from "../components/TabularLoading";
import { TabularTable } from "../components/TabularTable";
import { useSchemaFields } from "../hooks/use-schema-fields";
import { useTabularColumns } from "../hooks/use-tabular-columns";
import { useTabularData } from "../hooks/use-tabular-data";

type Props = {
  tabularViewId: string;
};

export const TabularContent = ({ tabularViewId }: Props) => {
  const { dataModel, extractionsData, isLoading, error } = useTabularData(tabularViewId);
  const schemaFields = useSchemaFields(dataModel?.schemaJson);
  const columns = useTabularColumns(schemaFields, tabularViewId);

  if (isLoading) {
    return <TabularLoading />;
  }

  if (error) {
    return <TabularError />;
  }

  if (!extractionsData?.extractions || extractionsData.extractions.length === 0) {
    return <TabularEmpty />;
  }

  return (
    <div className="flex flex-col grow">
      <TabularTable data={extractionsData.extractions} columns={columns} />
    </div>
  );
};
