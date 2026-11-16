"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/LogoLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import { SiteContentNav } from "@/components/cms/SiteContentNav";
import { hasPermission, isStaffRole, type AuthError } from "@/lib/auth";
import type { AcademyCourse } from "@/lib/academy";
import {
  createAcademyCourse,
  deleteAcademyCourse,
  fetchAcademyPageCopy,
  fetchAdminAcademyCourses,
  saveAcademyPageCopy,
  updateAcademyCourse,
  type AcademyPageCopy,
} from "@/lib/content";
import { cn } from "@/lib/utils";

const DEFAULT_LEVELS = ["Foundation", "Intermediate", "Advanced"] as const;
const CUSTOM_LEVEL_VALUE = "__custom__";
const RECURRENCE_OPTIONS = [
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Yearly", label: "Yearly" },
] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const emptyForm = {
  code: "",
  title: "",
  description: "",
  format: "",
  duration: "",
  dateStart: "",
  dateEnd: "",
  recurring: false,
  comingSoon: false,
  frequency: "Weekly",
  level: "",
  published: true,
};

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSingleDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatCourseDates(
  startIso: string,
  endIso: string,
  recurring = false,
  frequency = "Weekly",
): string {
  const start = parseIsoDate(startIso);
  if (!start) return "";
  if (recurring) {
    const freq =
      RECURRENCE_OPTIONS.find((option) => option.value === frequency)?.value ??
      "Weekly";
    const startLabel = formatSingleDate(startIso);
    const end = parseIsoDate(endIso);
    if (end && endIso !== startIso) {
      return `${freq} from ${startLabel} until ${formatSingleDate(endIso)}`;
    }
    return `${freq} from ${startLabel}`;
  }
  const end = parseIsoDate(endIso);
  const startDay = start.getDate();
  const startMonth = MONTHS[start.getMonth()];
  const startYear = start.getFullYear();
  if (!end || startIso === endIso) {
    return `${startDay} ${startMonth} ${startYear}`;
  }
  const endDay = end.getDate();
  const endMonth = MONTHS[end.getMonth()];
  const endYear = end.getFullYear();
  if (startYear === endYear && start.getMonth() === end.getMonth()) {
    return `${startDay}–${endDay} ${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

function parseDisplayDate(label: string): string {
  const single = label.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!single) return "";
  const month = MONTHS.indexOf(single[2] as (typeof MONTHS)[number]);
  if (month < 0) return "";
  return toIsoLocal(new Date(Number(single[3]), month, Number(single[1]), 12));
}

/** Best-effort parse of stored display dates, including recurring labels. */
function parseStoredCourseDates(value: string): {
  start: string;
  end: string;
  recurring: boolean;
  frequency: string;
} {
  const trimmed = value.trim();
  const recurring = trimmed.match(
    /^(Weekly|Monthly|Quarterly|Yearly) from (.+?)(?: until (.+))?$/i,
  );
  if (recurring) {
    const frequency =
      RECURRENCE_OPTIONS.find(
        (option) => option.value.toLowerCase() === recurring[1].toLowerCase(),
      )?.value ?? "Weekly";
    const start = parseDisplayDate(recurring[2]);
    const end = recurring[3] ? parseDisplayDate(recurring[3]) : start;
    return { start, end: end || start, recurring: true, frequency };
  }
  const rangeSameMonth = trimmed.match(
    /^(\d{1,2})–(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/,
  );
  if (rangeSameMonth) {
    const month = MONTHS.indexOf(rangeSameMonth[3] as (typeof MONTHS)[number]);
    if (month >= 0) {
      const year = Number(rangeSameMonth[4]);
      const startDay = Number(rangeSameMonth[1]);
      const endDay = Number(rangeSameMonth[2]);
      const start = new Date(year, month, startDay, 12);
      const end = new Date(year, month, endDay, 12);
      return {
        start: toIsoLocal(start),
        end: toIsoLocal(end),
        recurring: false,
        frequency: "Weekly",
      };
    }
  }
  const single = parseDisplayDate(trimmed);
  if (single) {
    return { start: single, end: single, recurring: false, frequency: "Weekly" };
  }
  return { start: "", end: "", recurring: false, frequency: "Weekly" };
}

const emptyPage: AcademyPageCopy = {
  heroBadge: "Training Division",
  heroTitle: "",
  heroIntro: "",
  introTitle: "",
  paragraphs: "",
  inquiryTitle: "",
  inquiryDescription: "",
  homeLabel: "Training & Capacity Building",
  homeHeading: "LEAF-C Academy",
  homeParagraph: "",
  homeButtonLabel: "View upcoming programmes",
  homeButtonHref: "/training",
};

export default function DashboardAcademyPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState<AcademyPageCopy>(emptyPage);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<string | null>(null);
  const [pageSaving, setPageSaving] = useState(false);
  const [pageEditorOpen, setPageEditorOpen] = useState(false);
  const pageEditorId = useId();
  const [customLevels, setCustomLevels] = useState<string[]>([]);
  const [levelMode, setLevelMode] = useState<"preset" | "custom">("preset");
  const [customLevelDraft, setCustomLevelDraft] = useState("");

  const canManageCourses = Boolean(user && hasPermission(user, "canManageAcademy"));
  const canEditPageHeader = Boolean(user && hasPermission(user, "canEditPages"));
  const canEdit = canManageCourses || canEditPageHeader;

  const levelOptions = [
    ...DEFAULT_LEVELS.map((level) => ({ value: level, label: level })),
    ...customLevels
      .filter((level) => !(DEFAULT_LEVELS as readonly string[]).includes(level))
      .map((level) => ({ value: level, label: level })),
    { value: CUSTOM_LEVEL_VALUE, label: "Add new level…" },
  ];

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
      return;
    }
    if (!hasPermission(user, "canManageAcademy") && !hasPermission(user, "canEditPages")) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (!token || !canEdit) return;
    if (canManageCourses) {
      fetchAdminAcademyCourses(token)
        .then((rows) => {
          setCourses(rows);
          const extras = Array.from(
            new Set(
              rows
                .map((course) => course.level.trim())
                .filter(
                  (level) =>
                    level && !(DEFAULT_LEVELS as readonly string[]).includes(level),
                ),
            ),
          );
          setCustomLevels(extras);
        })
        .catch((error: AuthError) => {
          setLoadError(error.error ?? "Unable to load academy courses.");
        });
    }
    if (!canEditPageHeader) {
      setPageLoaded(true);
      return;
    }
    fetchAcademyPageCopy(token)
      .then((data) => {
        setPage(data);
        setPageLoaded(true);
      })
      .catch((error: AuthError) => {
        setPageError(error.error ?? "Unable to load Academy page copy.");
        setPageLoaded(true);
      });
  }, [token, canEdit, canManageCourses, canEditPageHeader]);

  function startEdit(course: AcademyCourse) {
    if (!course.id) return;
    setEditingId(course.id);
    const level = course.level.trim();
    const isPreset = (DEFAULT_LEVELS as readonly string[]).includes(level);
    if (level && !isPreset) {
      setCustomLevels((current) =>
        current.includes(level) ? current : [...current, level],
      );
    }
    setLevelMode("preset");
    setCustomLevelDraft("");
    const comingSoon = course.comingSoon === true;
    const parsedDates = parseStoredCourseDates(course.dates);
    setForm({
      code: course.code,
      title: course.title,
      description: course.description ?? "",
      format: course.format,
      duration: course.duration,
      dateStart: parsedDates.start,
      dateEnd: parsedDates.end || parsedDates.start,
      recurring: parsedDates.recurring,
      comingSoon,
      frequency: parsedDates.frequency,
      level,
      published: course.published !== false,
    });
    setErrors({});
    setSubmitError(null);
  }

  function handleLevelSelect(value: string) {
    if (value === CUSTOM_LEVEL_VALUE) {
      setLevelMode("custom");
      setCustomLevelDraft("");
      setForm((current) => ({ ...current, level: "" }));
      return;
    }
    setLevelMode("preset");
    setCustomLevelDraft("");
    setForm((current) => ({ ...current, level: value }));
  }

  function commitCustomLevel() {
    const next = customLevelDraft.trim();
    if (!next) return;
    setCustomLevels((current) =>
      current.includes(next) || (DEFAULT_LEVELS as readonly string[]).includes(next)
        ? current
        : [...current, next],
    );
    setForm((current) => ({ ...current, level: next }));
    setLevelMode("preset");
    setCustomLevelDraft("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const levelValue =
      levelMode === "custom" ? customLevelDraft.trim() : form.level.trim();
    const dateStart = form.dateStart.trim();
    const dateEnd = form.dateEnd.trim() || dateStart;
    const nextErrors: Record<string, string> = {};
    for (const field of ["code", "title"] as const) {
      if (!form[field].trim()) nextErrors[field] = "This field is required.";
    }
    if (!form.comingSoon) {
      for (const field of ["format", "duration"] as const) {
        if (!form[field].trim()) nextErrors[field] = "This field is required.";
      }
    }
    if (!levelValue) nextErrors.level = "Select or add a level.";
    if (!form.comingSoon) {
      if (!dateStart) nextErrors.dates = "Start date is required.";
      else if (dateEnd && dateEnd < dateStart) {
        nextErrors.dates = form.recurring
          ? "Until date must be on or after the start date."
          : "End date must be on or after the start date.";
      }
    } else if (dateStart && dateEnd && dateEnd < dateStart) {
      nextErrors.dates = form.recurring
        ? "Until date must be on or after the start date."
        : "End date must be on or after the start date.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    if (
      levelValue &&
      !(DEFAULT_LEVELS as readonly string[]).includes(levelValue)
    ) {
      setCustomLevels((current) =>
        current.includes(levelValue) ? current : [...current, levelValue],
      );
    }

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      format: form.format.trim(),
      duration: form.duration.trim(),
      dates: dateStart
        ? formatCourseDates(
            dateStart,
            dateEnd,
            form.recurring,
            form.frequency,
          )
        : "",
      level: levelValue,
      comingSoon: form.comingSoon,
      published: form.published,
    };

    try {
      if (editingId) {
        const updated = await updateAcademyCourse(token, editingId, payload);
        setCourses((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createAcademyCourse(token, payload);
        setCourses((current) => [...current, created]);
      }
      setForm(emptyForm);
      setEditingId(null);
      setLevelMode("preset");
      setCustomLevelDraft("");
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to save the course.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    try {
      await deleteAcademyCourse(token, id);
      setCourses((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      setSubmitError((error as AuthError).error ?? "Unable to delete the course.");
    }
  }

  async function savePage(makeLive: boolean) {
    if (!token) return;
    if (!page.heroTitle.trim() || !page.homeHeading.trim()) {
      setPageError("Training page title and homepage Academy heading are required.");
      return;
    }
    setPageSaving(true);
    setPageError(null);
    setPageStatus(null);
    try {
      const result = await saveAcademyPageCopy(token, page, makeLive);
      setPage(result.page);
      setPageStatus(
        makeLive
          ? "Training page and homepage Academy section are live."
          : "Page copy saved as draft.",
      );
    } catch (error) {
      setPageError((error as AuthError).error ?? "Unable to save page copy.");
    } finally {
      setPageSaving(false);
    }
  }

  if (!isReady || !user || !canEdit) {
    return <PageLoader label="Loading academy…" />;
  }

  return (
    <DashboardShell
      title="Academy"
      description="Edit Training page copy, homepage Academy section, and courses."
      toolbarPlacement="below"
      toolbar={<SiteContentNav />}
    >
      <div className="space-y-3">
        {canEditPageHeader ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Training page & homepage</CardTitle>
              <CardDescription>
                Layout stays fixed. Edit the text members see on `/training` and Home.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant={pageEditorOpen ? "outline" : "accent"}
              size="sm"
              aria-expanded={pageEditorOpen}
              aria-controls={pageEditorId}
              onClick={() => setPageEditorOpen((current) => !current)}
              className="shrink-0 self-start"
            >
              {pageEditorOpen ? "Hide editor" : "Edit page copy"}
              <span
                aria-hidden
                className={cn(
                  "inline-block text-xs transition-transform duration-200",
                  pageEditorOpen && "rotate-180",
                )}
              >
                ▾
              </span>
            </Button>
          </CardHeader>
          <CardBody
            id={pageEditorId}
            hidden={!pageEditorOpen}
            role="region"
            aria-label="Training page and homepage"
            className={cn("space-y-3 px-4 py-3", !pageEditorOpen && "hidden")}
          >
            {!pageLoaded ? (
              <p className="text-sm text-muted-foreground">Loading page copy…</p>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Training page (`/training`)
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Small label"
                    value={page.heroBadge}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        heroBadge: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Courses section title"
                    value={page.introTitle}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        introTitle: event.target.value,
                      }))
                    }
                  />
                </div>
                <Input
                  label="Page title"
                  value={page.heroTitle}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      heroTitle: event.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Page intro"
                  rows={2}
                  className="min-h-14"
                  value={page.heroIntro}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      heroIntro: event.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Body paragraphs"
                  rows={3}
                  className="min-h-20"
                  value={page.paragraphs}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      paragraphs: event.target.value,
                    }))
                  }
                  hint="Blank line between paragraphs"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Inquiry title"
                    value={page.inquiryTitle}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        inquiryTitle: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Inquiry description"
                    value={page.inquiryDescription}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        inquiryDescription: event.target.value,
                      }))
                    }
                  />
                </div>

                <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Homepage Academy section
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Small label"
                    value={page.homeLabel}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        homeLabel: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Button text"
                    value={page.homeButtonLabel}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        homeButtonLabel: event.target.value,
                      }))
                    }
                  />
                </div>
                <Input
                  label="Heading"
                  value={page.homeHeading}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      homeHeading: event.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Supporting text"
                  rows={2}
                  className="min-h-14"
                  value={page.homeParagraph}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      homeParagraph: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Button link"
                  value={page.homeButtonHref}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      homeButtonHref: event.target.value,
                    }))
                  }
                />

                {pageError ? (
                  <p className="text-sm text-error" role="alert">
                    {pageError}
                  </p>
                ) : null}
                {pageStatus ? (
                  <p className="text-sm text-brand-navy">{pageStatus}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pageSaving}
                    onClick={() => void savePage(false)}
                  >
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    disabled={pageSaving}
                    onClick={() => void savePage(true)}
                  >
                    Make live
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
        ) : null}

        {canManageCourses ? (
        <>
        <Card variant="featured">
          <CardHeader className="px-4 py-2.5">
            <CardTitle className="text-base">
              {editingId ? "Edit course" : "Create a course"}
            </CardTitle>
            <CardDescription>
              Published courses replace sample listings on the public site.
            </CardDescription>
          </CardHeader>
          <CardBody className="px-4 py-3">
            <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  label="Course code"
                  name="code"
                  required
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                  error={errors.code}
                  hint="Example: LCA-101"
                />
                <div className="space-y-2">
                  <Select
                    label="Level"
                    name="level"
                    required
                    value={
                      levelMode === "custom"
                        ? CUSTOM_LEVEL_VALUE
                        : form.level || ""
                    }
                    onChange={(event) => handleLevelSelect(event.target.value)}
                    options={levelOptions}
                    placeholder="Select level"
                    error={levelMode === "custom" ? undefined : errors.level}
                  />
                  {levelMode === "custom" ? (
                    <div className="flex gap-2">
                      <Input
                        label="New level"
                        name="customLevel"
                        required
                        value={customLevelDraft}
                        onChange={(event) =>
                          setCustomLevelDraft(event.target.value)
                        }
                        error={errors.level}
                        hint="Saved with this course and added to the list"
                      />
                      <div className="flex items-end pb-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={commitCustomLevel}
                          disabled={!customLevelDraft.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <Input
                label="Title"
                name="title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                error={errors.title}
              />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <label className="flex items-center gap-2 text-sm text-heading">
                    <input
                      type="checkbox"
                      checked={form.recurring}
                      disabled={form.comingSoon}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          recurring: event.target.checked,
                          frequency: current.frequency || "Weekly",
                        }))
                      }
                    />
                    Recurring course
                  </label>
                  <label className="flex items-center gap-2 text-sm text-heading">
                    <input
                      type="checkbox"
                      checked={form.comingSoon}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          comingSoon: event.target.checked,
                          recurring: event.target.checked
                            ? false
                            : current.recurring,
                        }))
                      }
                    />
                    Coming soon
                  </label>
                </div>
                {form.comingSoon ? (
                  <p className="text-xs text-muted-foreground">
                    Dates, duration, and format are optional until the schedule is set.
                  </p>
                ) : null}
                {form.recurring && !form.comingSoon ? (
                  <Select
                    label="Repeats"
                    name="frequency"
                    value={form.frequency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        frequency: event.target.value,
                      }))
                    }
                    options={RECURRENCE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label={form.recurring && !form.comingSoon ? "Starts on" : "Start date"}
                    name="dateStart"
                    type="date"
                    required={!form.comingSoon}
                    value={form.dateStart}
                    onChange={(event) => {
                      const nextStart = event.target.value;
                      setForm((current) => ({
                        ...current,
                        dateStart: nextStart,
                        dateEnd:
                          !current.recurring &&
                          current.dateEnd &&
                          current.dateEnd < nextStart
                            ? nextStart
                            : current.dateEnd || nextStart,
                      }));
                    }}
                    error={errors.dates}
                    hint={form.comingSoon ? "Optional while coming soon" : undefined}
                  />
                  <Input
                    label={
                      form.recurring && !form.comingSoon
                        ? "Until (optional)"
                        : "End date"
                    }
                    name="dateEnd"
                    type="date"
                    required={!form.comingSoon && !form.recurring}
                    value={form.dateEnd}
                    min={form.dateStart || undefined}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dateEnd: event.target.value,
                      }))
                    }
                    hint={
                      form.dateStart
                        ? `Shows as: ${formatCourseDates(
                            form.dateStart,
                            form.dateEnd || form.dateStart,
                            form.recurring,
                            form.frequency,
                          )}`
                        : form.comingSoon
                          ? "Optional while coming soon"
                          : form.recurring
                            ? "Leave blank for ongoing"
                            : "Same as start for a one-day course"
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  label="Duration"
                  name="duration"
                  required={!form.comingSoon}
                  value={form.duration}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      duration: event.target.value,
                    }))
                  }
                  error={errors.duration}
                  hint={form.comingSoon ? "Optional while coming soon" : undefined}
                />
                <Input
                  label="Format"
                  name="format"
                  required={!form.comingSoon}
                  value={form.format}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, format: event.target.value }))
                  }
                  error={errors.format}
                  hint={form.comingSoon ? "Optional while coming soon" : undefined}
                />
              </div>
              <Textarea
                label="Description"
                name="description"
                rows={2}
                className="min-h-14"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                error={errors.description}
                hint="Optional"
              />
              <label className="flex items-center gap-2 text-sm text-heading">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      published: event.target.checked,
                    }))
                  }
                />
                Publish on the website
              </label>
              {submitError ? (
                <p className="text-sm text-error" role="alert">
                  {submitError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="accent" size="sm" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : editingId
                      ? "Update course"
                      : "Create course"}
                </Button>
                {editingId || levelMode === "custom" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setLevelMode("preset");
                      setCustomLevelDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardBody>
        </Card>

        {loadError ? (
          <p className="text-sm text-error" role="alert">
            {loadError}
          </p>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader className="px-4 py-2.5">
            <CardTitle className="text-base">Courses</CardTitle>
            <CardDescription>
              Published courses appear on homepage Academy and /training.
            </CardDescription>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            {courses.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                No academy courses yet. The public site keeps fallback listings until
                you publish one.
              </p>
            ) : (
              <table className="table-styled w-full text-sm">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id ?? course.code}>
                      <td>
                        <span className="font-medium text-heading">{course.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {course.code} · {course.level}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">
                        {course.comingSoon ? "Coming soon" : course.dates}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          {course.comingSoon ? (
                            <Badge variant="muted">Coming soon</Badge>
                          ) : null}
                          <Badge variant={course.published === false ? "muted" : "success"}>
                            {course.published === false ? "Draft" : "Published"}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(course)}
                          >
                            Edit
                          </Button>
                          {course.id ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(course.id!)}
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
        </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
