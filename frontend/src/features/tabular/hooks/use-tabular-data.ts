import { useGetDataModel, useGetView, useListExtractions } from "../api";

export const useTabularData = (tabularViewId: string) => {
  const { data: tabularView, isLoading: isLoadingView } = useGetView(tabularViewId);
  const { data: dataModel, isLoading: isLoadingModel } = useGetDataModel(
    tabularView?.dataModelId
  );
  const {
    data: extractionsData,
    isLoading: isLoadingExtractions,
    error,
  } = useListExtractions(tabularViewId);

  const isLoading = isLoadingView || isLoadingModel || isLoadingExtractions;

  return {
    tabularView,
    dataModel,
    extractionsData,
    isLoading,
    error,
  };
};
