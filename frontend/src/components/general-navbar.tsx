import { SlashIcon } from "lucide-react";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

type BreadcrumbConfig = {
  label: string;
  href?: string;
};

type Props = {
  breadcrumbConfig: BreadcrumbConfig[];
  actions?: React.ReactNode;
};
export const GeneralNavbar = ({ breadcrumbConfig, actions }: Props) => {
  return (
    <div className="border-b p-4 flex items-center gap-3 justify-between">
      {/* LEFT */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbConfig.map((breadcrumb, idx) => (
            <React.Fragment key={idx}>
              <BreadcrumbItem>
                {breadcrumb.href && (
                  <BreadcrumbLink href={breadcrumb.href}>
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
                {!breadcrumb.href && <span>{breadcrumb.label}</span>}
              </BreadcrumbItem>
              {idx < breadcrumbConfig.length - 1 && (
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* RIGHT */}
      {actions && actions}
    </div>
  );
};
