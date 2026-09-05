import { SERVICE_INTEREST_OPTIONS } from "@/lib/api";

export function formatCompactDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSessionWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SERVICE_SHORT_LABELS: Record<string, string> = {
  consultancy: "Consultancy",
  operations: "Operations",
  training: "Training",
  polygraph: "Polygraph",
  multiple: "Multiple",
  unsure: "Unsure",
};

export function serviceInterestLabel(value: string) {
  return (
    SERVICE_SHORT_LABELS[value] ??
    SERVICE_INTEREST_OPTIONS.find((option) => option.value === value)?.label ??
    value.replace(/_/g, " ")
  );
}

export function inquiryStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function inquiryStatusBadgeVariant(
  status: string,
): "warning" | "outline-navy" | "accent" | "muted" {
  switch (status) {
    case "new":
      return "warning";
    case "contacted":
      return "outline-navy";
    case "in_progress":
      return "accent";
    default:
      return "muted";
  }
}
