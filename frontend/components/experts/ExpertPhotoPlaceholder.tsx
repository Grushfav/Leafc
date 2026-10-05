import Image from "next/image";
import { cn } from "@/lib/utils";

type ExpertPhotoPlaceholderProps = {
  name: string;
  portrait: "male" | "female";
  photoSrc?: string;
  className?: string;
};

function MaleHeadshot() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[58%] w-[58%] text-warm-cream"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4.25" />
      <path d="M12 13.25c-4.4 0-8 2.55-8 5.85 0 .5.4.9.9.9h14.2c.5 0 .9-.4.9-.9 0-3.3-3.6-5.85-8-5.85Z" />
    </svg>
  );
}

function FemaleHeadshot() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[58%] w-[58%] text-warm-cream"
      aria-hidden
    >
      <ellipse cx="12" cy="8.25" rx="5.1" ry="5" />
      <path d="M12 13.25c-4.4 0-8 2.55-8 5.85 0 .5.4.9.9.9h14.2c.5 0 .9-.4.9-.9 0-3.3-3.6-5.85-8-5.85Z" />
    </svg>
  );
}

export function ExpertPhotoPlaceholder({
  name,
  portrait,
  photoSrc,
  className,
}: ExpertPhotoPlaceholderProps) {
  if (photoSrc) {
    return (
      <div
        className={cn(
          "relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-warm-cream ring-1 ring-brand-navy/10",
          className,
        )}
      >
        <Image
          src={photoSrc}
          alt={name}
          fill
          className="object-cover object-[center_18%]"
          sizes="208px"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${name}, photograph to follow`}
      className={cn(
        "flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy",
        className,
      )}
    >
      {portrait === "female" ? <FemaleHeadshot /> : <MaleHeadshot />}
    </div>
  );
}
