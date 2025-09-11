"use client";

import { TabularViewContainer } from "@/features/tabular/sections/TabularViewContainer";
import { use } from "react";

type Props = {
  params: Promise<{
    tabularId: string;
  }>;
};

export default function TabularIdPage({ params }: Props) {
  const { tabularId } = use(params);
  return <TabularViewContainer selectedTabularId={tabularId} />;
}
