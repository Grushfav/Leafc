import { IconLinkedIn, IconMail } from "@/components/icons/MonoIcons";
import type { ExpertProfile } from "@/lib/experts";
import { cn } from "@/lib/utils";

const DEFAULT_EMAIL = "support@leafc.net";

export function ExpertContactLinks({
  expert,
  className,
}: {
  expert: ExpertProfile;
  className?: string;
}) {
  const email = expert.email ?? DEFAULT_EMAIL;
  const linkedin = expert.linkedin;

  if (!linkedin && !email) return null;

  return (
    <ul className={cn("flex items-center justify-center gap-2", className)}>
      {linkedin ? (
        <li>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${expert.name} on LinkedIn`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
          >
            <IconLinkedIn className="h-3.5 w-3.5" />
          </a>
        </li>
      ) : null}
      <li>
        <a
          href={`mailto:${email}`}
          aria-label={`Email ${expert.name}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
        >
          <IconMail className="h-3.5 w-3.5" />
        </a>
      </li>
    </ul>
  );
}
