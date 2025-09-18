import { useCreateDataModel } from "@/features/data-model/api/create-data-model";
import { useCreateWorkspace } from "@/features/workspace/api/create-workspace";
import { z } from "zod";

const emptySchema = z.object({});

type Params = {
  name: string;
  dataModelId?: string | null;
  createEmptyIfMissing?: boolean;
};

export const useCreateWorkspaceWithOptionalDataModel = () => {
  const createWorkspace = useCreateWorkspace();
  const createDataModel = useCreateDataModel();

  const mutateAsync = async ({
    name,
    dataModelId,
    createEmptyIfMissing = true,
  }: Params) => {
    let dmId = dataModelId || null;
    if (!dmId && createEmptyIfMissing) {
      const model = await createDataModel.mutateAsync({
        name: `${name} model`,
        schemaJson: z.toJSONSchema(emptySchema),
      });
      dmId = model.id;
    }
    if (!dmId)
      throw new Error(
        "dataModelId is required or createEmptyIfMissing must be true"
      );
    return await createWorkspace.mutateAsync({ name, dataModelId: dmId });
  };

  const isPending = createWorkspace.isPending || createDataModel.isPending;

  return { mutateAsync, isPending };
};
