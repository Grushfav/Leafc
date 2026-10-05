import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, MouseEventHandler } from "react";

const variants = {
  primary:
    "bg-accent text-accent-foreground hover:bg-brand-orange-light shadow-sm hover:shadow-glow",
  secondary:
    "bg-charcoal text-white hover:bg-charcoal-light shadow-sm hover:shadow-md",
  outline:
    "border-2 border-charcoal bg-transparent text-charcoal hover:bg-charcoal hover:text-white",
  accent:
    "bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold shadow-sm hover:shadow-glow hover:brightness-105",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-heading font-semibold",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  href,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const classes = buttonClassName(variant, size, className);

  if (href) {
    return (
      <Link
        href={href}
        className={cn(classes, disabled && "pointer-events-none opacity-50")}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
