"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  FALLBACK_ACADEMY_COURSES,
  type AcademyCourse,
} from "@/lib/academy";
import { fetchPublishedAcademyCourses } from "@/lib/content";

export function AcademyCourseGrid({
  variant = "home",
}: {
  variant?: "home" | "training";
}) {
  const [courses, setCourses] = useState<AcademyCourse[]>(FALLBACK_ACADEMY_COURSES);

  useEffect(() => {
    fetchPublishedAcademyCourses()
      .then((remote) => {
        if (remote.length > 0) setCourses(remote);
      })
      .catch(() => {
        setCourses(FALLBACK_ACADEMY_COURSES);
      });
  }, []);

  if (variant === "training") {
    return (
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
          <article
            key={course.code}
            className="flex flex-col rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm"
          >
            <p className="font-heading text-[10px] font-semibold uppercase tracking-wide text-brand-orange">
              {course.level}
            </p>
            <h3 className="mt-1.5 font-heading text-sm font-bold leading-snug text-brand-navy">
              {course.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{course.duration}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {course.code}
            </p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {courses.map((course) => (
        <article
          key={course.code}
          className="flex flex-col rounded-2xl bg-warm-white p-5 text-brand-navy shadow-lg ring-1 ring-white/10"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] font-semibold tracking-wide text-brand-orange">
              {course.code}
            </p>
            <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-brand-navy">
              {course.level}
            </span>
          </div>
          <h3 className="mt-3 font-heading text-base font-bold leading-snug">
            {course.title}
          </h3>
          <dl className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between gap-3">
              <dt>Dates</dt>
              <dd className="font-medium text-brand-navy/80">{course.dates}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Duration</dt>
              <dd className="font-medium text-brand-navy/80">{course.duration}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Format</dt>
              <dd className="text-right font-medium text-brand-navy/80">
                {course.format}
              </dd>
            </div>
          </dl>
          <Button href="/get-started" variant="outline" size="sm" className="mt-5 w-full">
            Register interest
          </Button>
        </article>
      ))}
    </div>
  );
}
