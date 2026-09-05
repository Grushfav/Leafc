import Link from "next/link";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { roleLabel, type AuthUser } from "@/lib/auth";

interface OverviewIdentityProps {
  user: AuthUser;
  primaryAction?: {
    href: string;
    label: string;
  };
}

export function OverviewIdentity({ user, primaryAction }: OverviewIdentityProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-heading text-sm font-semibold text-heading">
              {user.name}
            </p>
            <Badge variant="outline-navy">{roleLabel(user.role)}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {user.email}
            {user.organizationName ? ` · ${user.organizationName}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:pl-1">
        <Link
          href="/dashboard/profile"
          className="font-heading text-sm font-semibold text-brand-navy/70 transition-colors hover:text-brand-navy"
        >
          Profile
        </Link>
        {primaryAction ? (
          <Link href={primaryAction.href}>
            <Button variant="accent" size="sm">
              {primaryAction.label}
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
