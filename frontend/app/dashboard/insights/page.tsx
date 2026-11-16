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
import { SiteContentNav } from "@/components/cms/SiteContentNav";
import { hasPermission, isStaffRole, type AuthError } from "@/lib/auth";
import {
  createInsight,
  deleteInsight,
  fetchAdminInsights,
  fetchInsightsPageCopy,
  saveInsightsPageCopy,
  updateInsight,
  type AdminInsight,
  type InsightsPageCopy,
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

const emptyPageHeader: InsightsPageCopy = {
  badge: "Insights",
  title: "",
  description: "",
  buttonLabel: "Request a consultation",
  buttonHref: "/get-started",
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

  const [pageHeader, setPageHeader] = useState(emptyPageHeader);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<string | null>(null);
  const [pageSaving, setPageSaving] = useState(false);

  const canManageArticles = Boolean(user && hasPermission(user, "canManageInsights"));
  const canEditPageHeader = Boolean(user && hasPermission(user, "canEditPages"));
  const canEdit = canManageArticles || canEditPageHeader;

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
      return;
    }
    if (!hasPermission(user, "canManageInsights") && !hasPermission(user, "canEditPages")) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (!token || !canEdit) return;
    if (canManageArticles) {
      fetchAdminInsights(token)
        .then(setArticles)
        .catch((error: AuthError) => {
          setLoadError(error.error ?? "Unable to load insights.");
        });
    }
    if (!canEditPageHeader) {
      setPageLoaded(true);
      return;
    }
    fetchInsightsPageCopy(token)
      .then((data) => {
        setPageHeader(data);
        setPageLoaded(true);
      })
      .catch((error: AuthError) => {
        setPageError(error.error ?? "Unable to load Insights page header.");
        setPageLoaded(true);
      });
  }, [token, canEdit, canManageArticles, canEditPageHeader]);

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

  async function savePageHeader(makeLive: boolean) {
    if (!token) return;
    if (!pageHeader.title.trim()) {
      setPageError("Page title is required.");
      return;
    }
    setPageSaving(true);
    setPageError(null);
    setPageStatus(null);
    try {
      const result = await saveInsightsPageCopy(token, pageHeader, makeLive);
      setPageHeader(result.page);
      setPageStatus(
        makeLive
          ? "Page header is live on /insights."
          : "Page header saved as draft.",
      );
    } catch (error) {
      setPageError((error as AuthError).error ?? "Unable to save page header.");
    } finally {
      setPageSaving(false);
    }
  }

  if (!isReady || !user || !canEdit) {
    return <PageLoader label="Loading insights…" />;
  }

  return (
    <DashboardShell
      title="Insights"
      description="Articles for the public Insights pages. Site editors can also update the page header."
      toolbarPlacement="below"
      toolbar={<SiteContentNav />}
    >
      <div className="space-y-4">
        {canEditPageHeader ? (
        <Card>
          <CardHeader className="px-4 py-2.5">
            <CardTitle className="text-base">Insights page header</CardTitle>
            <CardDescription>
              Title and intro on `/insights`. Layout stays fixed.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-2.5 px-4 py-3">
            {!pageLoaded ? (
              <p className="text-sm text-muted-foreground">Loading page header…</p>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Small label"
                    value={pageHeader.badge}
                    onChange={(event) =>
                      setPageHeader((current) => ({
                        ...current,
                        badge: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Button text"
                    value={pageHeader.buttonLabel}
                    onChange={(event) =>
                      setPageHeader((current) => ({
                        ...current,
                        buttonLabel: event.target.value,
                      }))
                    }
                  />
                </div>
                <Input
                  label="Page title"
                  value={pageHeader.title}
                  onChange={(event) =>
                    setPageHeader((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Supporting text"
                  rows={2}
                  className="min-h-14"
                  value={pageHeader.description}
                  onChange={(event) =>
                    setPageHeader((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Button link"
                  value={pageHeader.buttonHref}
                  onChange={(event) =>
                    setPageHeader((current) => ({
                      ...current,
                      buttonHref: event.target.value,
                    }))
                  }
                  hint="Site path or full https:// URL"
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
                    onClick={() => void savePageHeader(false)}
                  >
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    disabled={pageSaving}
                    onClick={() => void savePageHeader(true)}
                  >
                    Make live
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
        ) : null}

        {canManageArticles ? (
        <>
        <Card variant="featured">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-base">
              {editingId ? "Edit article" : "Create an article"}
            </CardTitle>
            <CardDescription>
              ## starts a section. One takeaway per line. Published articles go live
              immediately.
            </CardDescription>
          </CardHeader>
          <CardBody className="px-4 py-4">
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Slug"
                  name="slug"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  error={errors.slug}
                  hint="Optional — from title if blank"
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
                rows={2}
                className="min-h-16"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                error={errors.description}
              />
              <Textarea
                label="Article body"
                name="body"
                required
                rows={6}
                className="min-h-28"
                value={form.body}
                onChange={(event) =>
                  setForm((current) => ({ ...current, body: event.target.value }))
                }
                error={errors.body}
                hint="Optional: ## Heading for a section"
              />
              <Textarea
                label="Key takeaways"
                name="takeaways"
                required
                rows={3}
                className="min-h-20"
                value={form.takeaways}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    takeaways: event.target.value,
                  }))
                }
                error={errors.takeaways}
                hint="One per line"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Related link"
                  name="relatedHref"
                  value={form.relatedHref}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      relatedHref: event.target.value,
                    }))
                  }
                  hint="Site path (/get-started) or full URL (https://…)"
                />
                <Input
                  label="Related button text"
                  name="relatedLabel"
                  value={form.relatedLabel}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      relatedLabel: event.target.value,
                    }))
                  }
                />
              </div>
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
                      ? "Update article"
                      : "Publish article"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
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
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-base">Articles</CardTitle>
            <CardDescription>
              Drafts stay off the public site until published.
            </CardDescription>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            {articles.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
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
                        <span className="mt-0.5 block text-xs text-muted-foreground">
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
        </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
