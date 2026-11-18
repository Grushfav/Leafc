"use client";

import { useCmsResource } from "@/components/cms/useCmsResource";
import { Button } from "@/components/ui/Button";
import {
  FALLBACK_ACADEMY_COURSES,
  type AcademyCourse,
} from "@/lib/academy";
import { fetchPublishedAcademyCourses } from "@/lib/content";

function CourseMeta({
  dates,
  duration,
  format,
  comingSoon = false,
}: {
  dates: string;
  duration: string;
  format: string;
  comingSoon?: boolean;
}) {
  const datesLabel = comingSoon
    ? dates.trim() || "Coming soon"
    : dates;
  const showDuration = Boolean(duration.trim());
  const showFormat = Boolean(format.trim());

  return (
    <dl className="grid gap-2.5 border-t border-brand-navy/10 pt-3">
      <div>
        <dt className="font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-navy/55">
          Dates
        </dt>
        <dd className="mt-0.5 text-sm font-medium leading-snug text-brand-navy">
          {datesLabel}
        </dd>
      </div>
      {showDuration || showFormat ? (
        <div className="grid grid-cols-2 gap-3">
          {showDuration ? (
            <div>
              <dt className="font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-navy/55">
                Duration
              </dt>
              <dd className="mt-0.5 text-sm font-medium leading-snug text-brand-navy">
                {duration}
              </dd>
            </div>
          ) : null}
          {showFormat ? (
            <div>
              <dt className="font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-navy/55">
                Format
              </dt>
              <dd className="mt-0.5 text-sm font-medium leading-snug text-brand-navy">
                {format}
              </dd>
            </div>
          ) : null}
        </div>
      ) : null}
    </dl>
  );
}

const HOME_COURSE_LIMIT = 6;

function limitCoursesForVariant(
  courses: AcademyCourse[],
  variant: "home" | "training",
): AcademyCourse[] {
  if (variant !== "home") return courses;
  return courses.slice(-HOME_COURSE_LIMIT);
}

export function AcademyCourseGrid({
  variant = "home",
}: {
  variant?: "home" | "training";
}) {
  const { data, status } = useCmsResource<AcademyCourse[]>(
    "academy-courses",
    fetchPublishedAcademyCourses,
  );

  // Hold (no built-in courses) until published courses arrive or the API is slow.
  if (status === "loading") {
    return (
      <div
        className={variant === "training" ? "mt-8 min-h-[320px]" : "mt-12 min-h-[420px]"}
        role="status"
        aria-busy="true"
        aria-label="Loading courses"
      />
    );
  }

  const source = data && data.length > 0 ? data : FALLBACK_ACADEMY_COURSES;
  const courses = limitCoursesForVariant(source, variant);

  if (variant === "training") {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <article
            key={course.code}
            className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] font-semibold tracking-wide text-brand-orange">
                {course.code}
              </p>
              <span className="rounded-full bg-brand-navy/8 px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-brand-navy">
                {course.level}
              </span>
            </div>
            <h3 className="mt-3 font-heading text-base font-bold leading-snug text-brand-navy">
              {course.title}
            </h3>
            {course.description?.trim() ? (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {course.description.trim()}
              </p>
            ) : null}
            <div className="mt-auto pt-4">
              <CourseMeta
                dates={course.dates}
                duration={course.duration}
                format={course.format}
                comingSoon={course.comingSoon === true}
              />
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <article
          key={course.code}
          className="flex h-full flex-col rounded-2xl border border-white/15 bg-warm-white p-5 text-brand-navy shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] font-semibold tracking-wide text-brand-orange">
              {course.code}
            </p>
            <span className="rounded-full bg-brand-navy/8 px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-brand-navy">
              {course.level}
            </span>
          </div>

          <h3 className="mt-3 font-heading text-lg font-bold leading-snug tracking-tight">
            {course.title}
          </h3>

          {course.description?.trim() ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-navy/65">
              {course.description.trim()}
            </p>
          ) : null}

          <div className="mt-auto flex flex-col gap-4 pt-5">
            <CourseMeta
              dates={course.dates}
              duration={course.duration}
              format={course.format}
              comingSoon={course.comingSoon === true}
            />
            <Button href="/get-started" variant="outline" size="sm" className="w-full">
              Register interest
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
