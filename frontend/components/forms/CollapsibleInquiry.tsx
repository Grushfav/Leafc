"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type CollapsibleInquiryProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  collapsedByDefault?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
};

export function CollapsibleInquiry({
  title,
  description,
  children,
  className,
  collapsedByDefault = true,
  expandLabel = "Open form",
  collapseLabel = "Close form",
}: CollapsibleInquiryProps) {
  const [open, setOpen] = useState(!collapsedByDefault);
  const panelId = useId();

  return (
    <Card variant="featured" className={className}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button
          type="button"
          variant={open ? "outline" : "accent"}
          size="sm"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="shrink-0 self-start"
        >
          {open ? collapseLabel : expandLabel}
          <span
            aria-hidden
            className={cn(
              "inline-block text-xs transition-transform duration-200",
              open && "rotate-180",
            )}
          >
            ▾
          </span>
        </Button>
      </CardHeader>
      <CardBody
        id={panelId}
        hidden={!open}
        role="region"
        aria-label={title}
        className={cn(!open && "hidden")}
      >
        {open ? children : null}
      </CardBody>
    </Card>
  );
}
