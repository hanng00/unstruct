import { ChevronDownIcon, File, SlashIcon } from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useGetView, useListViews } from "../api";

interface Props {
  tabularId: string;
  onTabularViewChange: (tabularId: string) => void;
}
export const TabularViewNavbar = ({
  tabularId,
  onTabularViewChange,
}: Props) => {
  const { data: tabularViews } = useListViews();
  const { data: selectedTabularView } = useGetView(tabularId);
  
  if (!selectedTabularView) return null;

  const sortedTabularViews = tabularViews?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/tabular">Tabular Review</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
              {selectedTabularView.name}
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {sortedTabularViews?.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => onTabularViewChange(view.id)}
                >
                  <div className="flex flex-row gap-3 items-center px-2 py-1 min-w-sm">
                    <File className="size-4 text-muted-foreground" />
                    <div className="rounded-md flex flex-col">
                      <h2 className="text-sm font-medium capitalize">
                        {view.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(view.createdAt))}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
