"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { addFilesToView, useCreateDataModel, useCreateView } from "../api";
import { DefaultDataModelJsonSchema } from "../schemas/data-model";

export const useCreateTabularViewWithFiles = () => {
  const router = useRouter();
  const createView = useCreateView();
  const createDataModel = useCreateDataModel();

  const createViewWithFiles = useCallback(
    async (fileIds: string[], viewName?: string) => {
      try {
        // Create a default data model first
        const dataModel = await createDataModel.mutateAsync({
          name: `${viewName || "Default"} Data Model`,
          schemaJson: DefaultDataModelJsonSchema,
        });

        // Create the tabular view with the data model
        const view = await createView.mutateAsync({
          name: viewName || `View ${new Date().toLocaleDateString()}`,
          dataModelId: dataModel.id,
        });

        // Add files to the view using the imperative function
        if (fileIds.length > 0) {
          await addFilesToView(view.id, fileIds);
        }

        // Redirect to the new view
        router.push(`/tabular/${view.id}`);

        return view;
      } catch (error) {
        console.error("Failed to create tabular view with files:", error);
        throw error;
      }
    },
    [createView, createDataModel, router]
  );

  return {
    createViewWithFiles,
    isPending: createView.isPending || createDataModel.isPending,
    error: createView.error || createDataModel.error,
  };
};
