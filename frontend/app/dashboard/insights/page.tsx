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
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/LogoLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminRole, isStaffRole, type AuthError } from "@/lib/auth";
import {
  createInsight,
  deleteInsight,
  fetchAdminInsights,
  updateInsight,
  type AdminInsight,
} from "@/lib/content";
import { INSIGHT_CATEGORIES } from "@/lib/insights";

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  description: "",
  body: "",
  takeaways: "",
  relatedHref: "/get-started",
  relatedLabel: "Get Started",
  published: true,
};

export default function DashboardInsightsPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [articles, setArticles] = useState<AdminInsight[]>([]);
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
    fetchAdminInsights(token)
      .then(setArticles)
      .catch((error: AuthError) => {
        setLoadError(error.error ?? "Unable to load insights.");
      });
  }, [token, isAdmin]);

  function startEdit(article: AdminInsight) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      description: article.description,
      body: article.body,
      takeaways: article.takeaways.join("\n"),
      relatedHref: article.relatedHref ?? "/get-started",
      relatedLabel: article.relatedLabel ?? "Get Started",
      published: article.published,
    });
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.category) nextErrors.category = "Select a category.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.body.trim()) nextErrors.body = "Article body is required.";
    if (!form.takeaways.trim()) nextErrors.takeaways = "Add at least one takeaway.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category,
      description: form.description.trim(),
      body: form.body,
      takeaways: form.takeaways,
      relatedHref: form.relatedHref.trim() || "/get-started",
      relatedLabel: form.relatedLabel.trim() || "Get Started",
      published: form.published,
    };

    try {
      if (editingId) {
        const updated = await updateInsight(token, editingId, payload);
        setArticles((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createInsight(token, payload);
        setArticles((current) => [created, ...current]);
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to save the article.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    try {
      await deleteInsight(token, id);
      setArticles((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      setSubmitError((error as AuthError).error ?? "Unable to delete the article.");
    }
  }

  if (!isReady || !user || !isAdmin) {
    return <PageLoader label="Loading insights…" />;
  }

  return (
    <DashboardShell
      title="Insights"
      description="Publish articles that appear on the public Insights pages."
    >
      <Card variant="featured">
        <CardHeader>
          <CardTitle>{editingId ? "Edit article" : "Create an article"}</CardTitle>
          <CardDescription>
            Use a heading line starting with ## to split sections. Put one
            takeaway on each line. Published articles appear on the website
            immediately.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Title"
              name="title"
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              error={errors.title}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                error={errors.slug}
                hint="Optional. Generated from the title if left blank."
              />
              <Select
                label="Category"
                name="category"
                required
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                options={INSIGHT_CATEGORIES.map((category) => ({
                  value: category.id,
                  label: category.label,
                }))}
                placeholder="Select category"
                error={errors.category}
              />
            </div>
            <Textarea
              label="Short description"
              name="description"
              required
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              error={errors.description}
            />
            <Textarea
              label="Article body"
              name="body"
              required
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              error={errors.body}
              hint="Optional: start a section with ## Heading"
            />
            <Textarea
              label="Key takeaways"
              name="takeaways"
              required
              value={form.takeaways}
              onChange={(event) =>
                setForm((current) => ({ ...current, takeaways: event.target.value }))
              }
              error={errors.takeaways}
              hint="One takeaway per line"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Related page"
                name="relatedHref"
                value={form.relatedHref}
                onChange={(event) =>
                  setForm((current) => ({ ...current, relatedHref: event.target.value }))
                }
              />
              <Input
                label="Related label"
                name="relatedLabel"
                value={form.relatedLabel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, relatedLabel: event.target.value }))
                }
              />
            </div>
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
                    ? "Update article"
                    : "Publish article"}
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
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            Drafts stay off the public site until you publish them.
          </CardDescription>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {articles.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              No insights created yet.
            </p>
          ) : (
            <table className="table-styled w-full text-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <span className="font-medium text-heading">{article.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {article.slug}
                      </span>
                    </td>
                    <td>{article.category}</td>
                    <td>
                      <Badge variant={article.published ? "success" : "muted"}>
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(article)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                        >
                          Delete
                        </Button>
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
