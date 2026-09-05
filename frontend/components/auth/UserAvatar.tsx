"use client";

import { cn } from "@/lib/utils";
import { resolveAvatarUrl, userInitials } from "@/lib/auth";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  previewUrl?: string | null;
  size?: "sm" | "lg";
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  previewUrl,
  size = "sm",
  className,
}: UserAvatarProps) {
  const src = previewUrl || resolveAvatarUrl(avatarUrl);
  const initials = userInitials(name);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border-2 border-brand-gold/80 bg-brand-navy text-brand-gold shadow-sm",
        size === "lg" ? "h-24 w-24 text-xl" : "h-10 w-10 text-xs",
        className,
      )}
      aria-label={`${name} profile photo`}
      role="img"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-heading font-semibold tracking-wide"
          aria-hidden
        >
          {initials}
        </span>
      )}
    </div>
  );
}
