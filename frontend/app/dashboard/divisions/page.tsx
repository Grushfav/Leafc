"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
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
import { fetchAdminDivisions, saveDivisionPage } from "@/lib/content";
import {
  DIVISION_PAGES,
  DIVISION_PAGE_LABELS,
  DIVISION_SLUGS,
  mergeDivisionContent,
  type DivisionEntry,
  type DivisionPageContent,
  type DivisionSlug,
} from "@/lib/division-pages";

export default function DashboardDivisionsPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [slug, setSlug] = useState<DivisionSlug>("consultancy");
  const [form, setForm] = useState<DivisionPageContent>(DIVISION_PAGES.consultancy);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    let cancelled = false;
    setIsLoading(true);
    fetchAdminDivisions(token)
      .then((pages) => {
        if (cancelled) return;
        const saved = pages.find((page) => page.slug === slug);
        setForm(mergeDivisionContent(DIVISION_PAGES[slug], saved?.content));
        setSavedAt(saved?.updatedAt ?? null);
        setLoadError(null);
      })
      .catch((error: AuthError) => {
        if (cancelled) return;
        setLoadError(error.error ?? "Unable to load division pages.");
        setForm(DIVISION_PAGES[slug]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin, slug]);

  function setField<K extends keyof DivisionPageContent>(key: K, value: DivisionPageContent[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setErrors({});
    setStatus(null);
    try {
      const saved = await saveDivisionPage(token, slug, form);
      setForm(mergeDivisionContent(DIVISION_PAGES[slug], saved));
      setSavedAt(new Date().toISOString());
      setStatus("Saved. The public page will show this copy.");
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setStatus(apiError.error ?? "Unable to save this page.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady || !isAdmin) return <PageLoader />;

  const showPolygraph = slug === "polygraph";
  const showList = slug !== "training";

  return (
    <DashboardShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-heading">Division pages</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Edit the words on Consultancy, Operations, Training, and Polygraph.
              Photos, the inquiry form, and Academy courses stay where they are.
            </p>
          </div>
          <Button type="submit" variant="accent" disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Saving…" : "Save page"}
          </Button>
        </div>

        {loadError && <p className="text-sm text-error">{loadError}</p>}
        {status && <p className="text-sm text-muted-foreground">{status}</p>}

        <div className="flex flex-wrap gap-2">
          {DIVISION_SLUGS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={option === slug ? "accent" : "outline"}
              size="sm"
              onClick={() => {
                setSlug(option);
                setStatus(null);
                setErrors({});
              }}
            >
              {DIVISION_PAGE_LABELS[option]}
            </Button>
          ))}
        </div>

        {savedAt && (
          <p className="text-xs text-muted-foreground">
            Last saved {new Date(savedAt).toLocaleString()}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Page introduction</CardTitle>
            <CardDescription>The heading visitors see first.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Badge" value={form.heroBadge} error={errors.heroBadge} onChange={(event) => setField("heroBadge", event.target.value)} />
            <Input label="Title" value={form.heroTitle} error={errors.heroTitle} onChange={(event) => setField("heroTitle", event.target.value)} />
            <Textarea label="Introduction" value={form.heroIntro} error={errors.heroIntro} onChange={(event) => setField("heroIntro", event.target.value)} />
            {slug === "training" && (
              <LineEditor
                label="Highlight chips"
                values={form.highlights}
                onChange={(highlights) => setField("highlights", highlights)}
              />
            )}
            {showPolygraph && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Certified examiners heading" value={form.certifiedTitle} onChange={(event) => setField("certifiedTitle", event.target.value)} />
                <Input label="Certified examiners detail" value={form.certifiedBody} onChange={(event) => setField("certifiedBody", event.target.value)} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Main copy</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Section title" value={form.introTitle} error={errors.introTitle} onChange={(event) => setField("introTitle", event.target.value)} />
            <LineEditor
              label="Paragraphs"
              values={form.paragraphs}
              multiline
              onChange={(paragraphs) => setField("paragraphs", paragraphs)}
            />
            {errors.paragraphs && <p className="text-sm text-error">{errors.paragraphs}</p>}
            <EntryEditor
              label="Steps"
              entries={form.steps}
              titleLabel="Step"
              bodyLabel="Detail"
              onChange={(steps) => setField("steps", steps)}
            />
            {showPolygraph && (
              <EntryEditor
                label="Figures"
                entries={form.stats}
                titleLabel="Figure"
                bodyLabel="Label"
                onChange={(stats) => setField("stats", stats)}
              />
            )}
          </CardBody>
        </Card>

        {showList && (
          <Card>
            <CardHeader>
              <CardTitle>{slug === "operations" ? "Capabilities" : "Service list"}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {slug !== "operations" && (
                <Input label="List title" value={form.listTitle} error={errors.listTitle} onChange={(event) => setField("listTitle", event.target.value)} />
              )}
              <EntryEditor
                label="Items"
                entries={form.items}
                titleLabel="Title"
                bodyLabel="Description"
                bodyOptional={slug !== "polygraph"}
                onChange={(items) => setField("items", items)}
              />
              {errors.items && <p className="text-sm text-error">{errors.items}</p>}
            </CardBody>
          </Card>
        )}

        {showPolygraph && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Photograph and witness</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <LineEditor label="Photo tags" values={form.photoTags} onChange={(photoTags) => setField("photoTags", photoTags)} />
                <Input label="Photo caption" value={form.photoCaption} onChange={(event) => setField("photoCaption", event.target.value)} />
                <Input label="Witness heading" value={form.witnessTitle} onChange={(event) => setField("witnessTitle", event.target.value)} />
                <LineEditor label="Witness paragraphs" values={form.witnessParagraphs} multiline onChange={(witnessParagraphs) => setField("witnessParagraphs", witnessParagraphs)} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>When an examination is useful</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Heading" value={form.suitableTitle} onChange={(event) => setField("suitableTitle", event.target.value)} />
                <EntryEditor label="Uses" entries={form.suitable} titleLabel="Title" bodyLabel="Detail" onChange={(suitable) => setField("suitable", suitable)} />
                <Input label="Caution heading" value={form.cautionTitle} onChange={(event) => setField("cautionTitle", event.target.value)} />
                <Textarea label="Caution introduction" value={form.cautionIntro} onChange={(event) => setField("cautionIntro", event.target.value)} />
                <LineEditor label="Caution points" values={form.cautionItems} onChange={(cautionItems) => setField("cautionItems", cautionItems)} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Protocol and guidance</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Protocol heading" value={form.protocolTitle} onChange={(event) => setField("protocolTitle", event.target.value)} />
                <LineEditor label="Protocol points" values={form.protocols} onChange={(protocols) => setField("protocols", protocols)} />
                <Textarea label="Credentials line" value={form.credentials} onChange={(event) => setField("credentials", event.target.value)} />
                <Input label="Guidance heading" value={form.guideTitle} onChange={(event) => setField("guideTitle", event.target.value)} />
                <Textarea label="Guidance text" value={form.guideBody} onChange={(event) => setField("guideBody", event.target.value)} />
                <Input label="Guidance button" value={form.guideLabel} onChange={(event) => setField("guideLabel", event.target.value)} />
              </CardBody>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Inquiry and aside</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Inquiry heading" value={form.inquiryTitle} error={errors.inquiryTitle} onChange={(event) => setField("inquiryTitle", event.target.value)} />
            <Textarea label="Inquiry description" value={form.inquiryDescription} error={errors.inquiryDescription} onChange={(event) => setField("inquiryDescription", event.target.value)} />
            <Input label="Aside heading" value={form.asideTitle} error={errors.asideTitle} onChange={(event) => setField("asideTitle", event.target.value)} />
            <Textarea label="Aside text" value={form.asideBody} error={errors.asideBody} onChange={(event) => setField("asideBody", event.target.value)} />
            {slug === "training" && (
              <LineEditor label="Certification badges" values={form.badges} onChange={(badges) => setField("badges", badges)} />
            )}
            <Input label="Link label" value={form.linkLabel} error={errors.linkLabel} onChange={(event) => setField("linkLabel", event.target.value)} />
          </CardBody>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="accent" disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Saving…" : "Save page"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(DIVISION_PAGES[slug]);
              setStatus("Built-in copy loaded. Save to publish it.");
            }}
          >
            Load built-in copy
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}

function LineEditor({
  label,
  values,
  multiline,
  onChange,
}: {
  label: string;
  values: string[];
  multiline?: boolean;
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-heading text-sm font-medium text-heading">{label}</p>
      {values.map((value, index) => (
        <div key={`${label}-${index}`} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {multiline ? (
              <Textarea
                className="w-full resize"
                value={value}
                onChange={(event) =>
                  onChange(values.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))
                }
              />
            ) : (
              <Input
                value={value}
                onChange={(event) =>
                  onChange(values.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))
                }
              />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => onChange(values.filter((_, entryIndex) => entryIndex !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...values, ""])}>
        Add
      </Button>
    </div>
  );
}

function EntryEditor({
  label,
  entries,
  titleLabel,
  bodyLabel,
  bodyOptional,
  onChange,
}: {
  label: string;
  entries: DivisionEntry[];
  titleLabel: string;
  bodyLabel: string;
  bodyOptional?: boolean;
  onChange: (entries: DivisionEntry[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="font-heading text-sm font-medium text-heading">{label}</p>
      {entries.map((entry, index) => (
        <div key={`${label}-${index}`} className="grid gap-2 rounded-xl border border-border-subtle p-3 sm:grid-cols-[1fr_1.4fr_auto]">
          <Input
            label={titleLabel}
            value={entry.title}
            onChange={(event) =>
              onChange(entries.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)))
            }
          />
          <Textarea
            label={bodyOptional ? `${bodyLabel} (optional)` : bodyLabel}
            value={entry.body}
            onChange={(event) =>
              onChange(entries.map((item, itemIndex) => (itemIndex === index ? { ...item, body: event.target.value } : item)))
            }
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="sm:mt-7"
            onClick={() => onChange(entries.filter((_, itemIndex) => itemIndex !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...entries, { title: "", body: "" }])}>
        Add
      </Button>
    </div>
  );
}
