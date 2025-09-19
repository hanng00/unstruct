import { useCreateDataModel } from "@/features/data-model/api/create-data-model";
import {
  useCreateWorkspace,
  Workspace,
} from "@/features/workspace/api/create-workspace";

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
  }: Params): Promise<Workspace> => {
    if (dataModelId) {
      return await createWorkspace.mutateAsync({ name, dataModelId });
    }

    if (!createEmptyIfMissing) {
      throw new Error(
        "dataModelId is required or createEmptyIfMissing must be true"
      );
    }

    // Create empty data model and immediately create workspace with it
    return await createDataModel
      .mutateAsync({
        name: `${name} model`,
        fields: [],
      })
      .then((model) => model.id)
      .then((dmId) => createWorkspace.mutateAsync({ name, dataModelId: dmId }))
      .then((ws) => ws);
  };

  const isPending = createWorkspace.isPending || createDataModel.isPending;

  return { mutateAsync, isPending };
};
