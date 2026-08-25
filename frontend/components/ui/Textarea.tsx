import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  className,
  label,
  error,
  hint,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="font-heading text-sm font-medium text-heading"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors duration-150",
          "hover:border-brand-orange/50",
          "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-error focus:border-error focus:ring-error/30",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        {...props}
      />
      {hint && !error && (
        <p id={`${textareaId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${textareaId}-error`}
          className="text-xs text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
