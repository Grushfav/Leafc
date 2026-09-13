import { cn } from "@/lib/utils";

interface LogoLoaderProps {
  label?: string;
  size?: number;
  className?: string;
}

export function LogoLoader({
  label,
  size = 80,
  className,
}: LogoLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      {/* CSS animations live inside the SVG; next/image can flatten them. */}
      <img
        src="/Logo_loader.svg"
        alt=""
        width={size}
        height={size}
        className="h-auto"
      />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <LogoLoader label={label} size={96} />
    </div>
  );
}
