"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/LogoLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminRole, isStaffRole, type AuthError } from "@/lib/auth";
import type { AcademyCourse } from "@/lib/academy";
import {
  createAcademyCourse,
  deleteAcademyCourse,
  fetchAdminAcademyCourses,
  updateAcademyCourse,
} from "@/lib/content";

const emptyForm = {
  code: "",
  title: "",
  description: "",
  format: "",
  duration: "",
  dates: "",
  level: "",
  published: true,
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

  const isAdmin = Boolean(user && isAdminRole(user.role));

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
      return;
    }
    if (!isAdminRole(user.role)) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    fetchAdminAcademyCourses(token)
      .then(setCourses)
      .catch((error: AuthError) => {
        setLoadError(error.error ?? "Unable to load academy courses.");
      });
  }, [token, isAdmin]);

  function startEdit(course: AcademyCourse) {
    if (!course.id) return;
    setEditingId(course.id);
    setForm({
      code: course.code,
      title: course.title,
      description: course.description ?? "",
      format: course.format,
      duration: course.duration,
      dates: course.dates,
      level: course.level,
      published: course.published !== false,
    });
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const nextErrors: Record<string, string> = {};
    for (const field of ["code", "title", "format", "duration", "dates", "level"] as const) {
      if (!form[field].trim()) nextErrors[field] = "This field is required.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      format: form.format.trim(),
      duration: form.duration.trim(),
      dates: form.dates.trim(),
      level: form.level.trim(),
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

  if (!isReady || !user || !isAdmin) {
    return <PageLoader label="Loading academy…" />;
  }

  return (
    <DashboardShell
      title="Academy"
      description="Create courses that appear in LEAF-C Academy on the homepage and training page."
    >
      <Card variant="featured">
        <CardHeader>
          <CardTitle>{editingId ? "Edit course" : "Create a course"}</CardTitle>
          <CardDescription>
            Published courses replace the sample listings on the public site.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Course code"
                name="code"
                required
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                error={errors.code}
                hint="Example: LCA-101"
              />
              <Input
                label="Level"
                name="level"
                required
                value={form.level}
                onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}
                error={errors.level}
                hint="Foundation, Intermediate, or Advanced"
              />
            </div>
            <Input
              label="Title"
              name="title"
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              error={errors.title}
            />
            <div className="grid gap-5 sm:grid-cols-3">
              <Input
                label="Dates"
                name="dates"
                required
                value={form.dates}
                onChange={(event) => setForm((current) => ({ ...current, dates: event.target.value }))}
                error={errors.dates}
              />
              <Input
                label="Duration"
                name="duration"
                required
                value={form.duration}
                onChange={(event) =>
                  setForm((current) => ({ ...current, duration: event.target.value }))
                }
                error={errors.duration}
              />
              <Input
                label="Format"
                name="format"
                required
                value={form.format}
                onChange={(event) => setForm((current) => ({ ...current, format: event.target.value }))}
                error={errors.format}
              />
            </div>
            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              error={errors.description}
              hint="Optional"
            />
            <label className="flex items-center gap-2 text-sm text-heading">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm((current) => ({ ...current, published: event.target.checked }))
                }
              />
              Publish on the website
            </label>
            {submitError ? (
              <p className="text-sm text-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Update course"
                    : "Create course"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>

      {loadError ? (
        <p className="mt-6 text-sm text-error" role="alert">
          {loadError}
        </p>
      ) : null}

      <Card variant="elevated" className="mt-8 overflow-hidden">
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>
            Published courses appear on the homepage Academy section and /training.
          </CardDescription>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {courses.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              No academy courses yet. The public site will keep showing the
              fallback listings until you publish one.
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
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {course.code} · {course.level}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-muted-foreground">
                      {course.dates}
                    </td>
                    <td>
                      <Badge variant={course.published === false ? "muted" : "success"}>
                        {course.published === false ? "Draft" : "Published"}
                      </Badge>
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
    </DashboardShell>
  );
}
