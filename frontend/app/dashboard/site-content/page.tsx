"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/components/auth/AuthProvider";
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
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/LogoLoader";
import { useToast } from "@/components/ui/Toast";
import {
  createCmsExpert,
  deleteCmsExpert,
  fetchAdminCmsExperts,
  fetchAdminCmsPage,
  fetchAdminGlobal,
  publishAdminGlobal,
  publishCmsExperts,
  publishCmsPage,
  reorderCmsExperts,
  resolveCmsAssetUrl,
  saveAdminGlobal,
  saveCmsPageDraft,
  updateCmsExpert,
  uploadCmsMedia,
} from "@/lib/cms/api";
import {
  CMS_PAGE_LABELS,
  CMS_PAGE_SLUGS,
  PUBLIC_PATH_BY_SLUG,
  SECTION_TYPES,
  type CmsExpertRecord,
  type CmsPageSlug,
  type ExpertDraft,
  type FooterContent,
  type NavContent,
  type PageContent,
  type Section,
  type SectionType,
  type SiteNoticeContent,
} from "@/lib/cms/types";
import {
  canEditSiteContent,
  hasPermission,
  isStaffRole,
  type AuthError,
} from "@/lib/auth";
import { BlockList } from "@/components/cms/BlockList";
import { CardGridEditor, PhotoCardsEditor } from "@/components/cms/CardSectionEditors";
import { CommonTasks } from "@/components/cms/CommonTasks";
import {
  PreviewPane,
  readPreviewPaneOpen,
  writePreviewPaneOpen,
} from "@/components/cms/PreviewPane";
import { PublishBar, type PublishStatus } from "@/components/cms/PublishBar";
import { SiteContentNav } from "@/components/cms/SiteContentNav";
import {
  sectionDisplayName,
  sectionTypeLabel,
} from "@/lib/cms/sectionLabels";
import { cn } from "@/lib/utils";

type Tab = "pages" | "experts" | "nav" | "footer" | "notice";

const TAB_LABELS: Record<Tab, string> = {
  pages: "Pages",
  experts: "Members",
  nav: "Menus",
  footer: "Footer",
  notice: "Popup notice",
};

const EMPTY_NOTICE: SiteNoticeContent = {
  version: 1,
  enabled: false,
  id: "notice-draft",
  title: "",
  message: "",
  dismissLabel: "Got it",
  linkLabel: "",
  linkHref: "",
};

function newId() {
  return crypto.randomUUID();
}

function emptySection(type: SectionType): Section {
  const id = newId();
  switch (type) {
    case "hero":
      return { id, type, heading: "New hero", paragraph: "" };
    case "richText":
      return { id, type, heading: "New section", paragraphs: [""] };
    case "textImage":
      return { id, type, heading: "New section", paragraph: "", imagePosition: "right" };
    case "cardGrid":
      return { id, type, heading: "Cards", cards: [] };
    case "photoCards":
      return { id, type, heading: "Photos", cards: [] };
    case "experts":
      return { id, type, heading: "Experts", paragraph: "" };
    case "cta":
      return {
        id,
        type,
        heading: "Get started",
        buttonLabel: "Get Started",
        buttonHref: "/get-started",
      };
    case "inquiry":
      return { id, type, heading: "Start an inquiry", paragraph: "" };
    case "academy":
      return {
        id,
        type,
        label: "Training",
        heading: "LEAF-C Academy",
        paragraph: "",
        buttonLabel: "View programmes",
        buttonHref: "/training",
      };
    case "insights":
      return {
        id,
        type,
        label: "Insights",
        heading: "Insights",
        paragraph: "",
        buttonLabel: "View all insights",
        buttonHref: "/insights",
      };
    case "newsletter":
      return {
        id,
        type,
        label: "Newsletter",
        heading: "Stay informed",
        paragraph: "",
      };
    case "divisionLayout":
      return { id, type, content: {} };
  }
}

function emptyExpert(sortOrder: number): ExpertDraft {
  return {
    slug: `expert-${Date.now()}`,
    name: "New expert",
    title: "Title",
    published: false,
    sortOrder,
    portrait: "male",
  };
}

export default function SiteContentPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const { pushToast } = useToast();
  const [tab, setTab] = useState<Tab>("pages");
  const [slug, setSlug] = useState<CmsPageSlug>("home");
  const [page, setPage] = useState<PageContent | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [experts, setExperts] = useState<CmsExpertRecord[]>([]);
  const [nav, setNav] = useState<NavContent | null>(null);
  const [footer, setFooter] = useState<FooterContent | null>(null);
  const [notice, setNotice] = useState<SiteNoticeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [addType, setAddType] = useState<SectionType>("richText");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("saved_draft");
  const [lastSavedJson, setLastSavedJson] = useState<string>("");
  const [previewReloadToken, setPreviewReloadToken] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setPreviewOpen(readPreviewPaneOpen());
  }, []);

  function setPreviewVisible(open: boolean) {
    setPreviewOpen(open);
    writePreviewPaneOpen(open);
  }

  const allowed = Boolean(user && canEditSiteContent(user));
  const visibleTabs = (["pages", "experts", "nav", "footer", "notice"] as Tab[]).filter(
    (item) => {
      if (!user) return false;
      if (item === "pages") {
        return (
          hasPermission(user, "canEditHome") || hasPermission(user, "canEditPages")
        );
      }
      if (item === "experts" || item === "notice") {
        return hasPermission(user, "canEditPages");
      }
      return hasPermission(user, "canEditMenusFooter");
    },
  );

  const pageDirty = Boolean(
    page && lastSavedJson && JSON.stringify(page) !== lastSavedJson,
  );
  const effectiveStatus: PublishStatus = pageDirty
    ? "unsaved"
    : publishStatus === "live"
      ? "live"
      : "saved_draft";

  function confirmLeaveUnsaved(): boolean {
    if (!pageDirty) return true;
    return window.confirm("You have unsaved changes. Leave without saving?");
  }

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
      return;
    }
    if (!canEditSiteContent(user)) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (!visibleTabs.includes(tab)) {
      setTab(visibleTabs[0]);
    }
  }, [visibleTabs, tab]);

  const loadPage = useCallback(async () => {
    if (!token) return;
    const data = await fetchAdminCmsPage(token, slug);
    const draft = data.page.draftContent;
    setPage(draft);
    setLastSavedJson(JSON.stringify(draft));
    setPublishStatus("saved_draft");
    setSelectedSectionId((current) => {
      if (current === "pending-home-hero") {
        return (
          draft.sections.find((section) => section.type === "hero")?.id ??
          draft.sections[0]?.id ??
          null
        );
      }
      if (current && draft.sections.some((section) => section.id === current)) {
        return current;
      }
      return draft.sections[0]?.id ?? null;
    });
  }, [token, slug]);

  const loadExperts = useCallback(async () => {
    if (!token) return;
    const data = await fetchAdminCmsExperts(token);
    setExperts(
      [...data.experts].sort(
        (a, b) => a.draft.sortOrder - b.draft.sortOrder || a.id - b.id,
      ),
    );
  }, [token]);

  const loadNav = useCallback(async () => {
    if (!token) return;
    const data = await fetchAdminGlobal(token, "nav");
    setNav(data.global.draftContent as NavContent);
  }, [token]);

  const loadFooter = useCallback(async () => {
    if (!token) return;
    const data = await fetchAdminGlobal(token, "footer");
    setFooter(data.global.draftContent as FooterContent);
  }, [token]);

  const loadNotice = useCallback(async () => {
    if (!token) return;
    const data = await fetchAdminGlobal(token, "notice");
    setNotice({
      ...EMPTY_NOTICE,
      ...(data.global.draftContent as SiteNoticeContent),
    });
  }, [token]);

  useEffect(() => {
    if (!token || !allowed) return;
    let cancelled = false;
    const run = async () => {
      try {
        if (tab === "pages") await loadPage();
        if (tab === "experts") await loadExperts();
        if (tab === "nav") await loadNav();
        if (tab === "footer") await loadFooter();
        if (tab === "notice") await loadNotice();
      } catch (error) {
        if (!cancelled) {
          pushToast((error as AuthError).error ?? "Unable to load content.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [token, allowed, tab, loadPage, loadExperts, loadNav, loadFooter, loadNotice, pushToast]);

  const selectedSection = useMemo(
    () => page?.sections.find((section) => section.id === selectedSectionId) ?? null,
    [page, selectedSectionId],
  );

  function updateSection(next: Section) {
    setPage((current) => {
      if (!current) return current;
      return {
        ...current,
        sections: current.sections.map((section) =>
          section.id === next.id ? next : section,
        ),
      };
    });
  }

  async function handleSavePage() {
    if (!token || !page) return;
    setBusy(true);
    try {
      const saved = await saveCmsPageDraft(token, slug, page);
      const draft = saved.page.draftContent;
      setPage(draft);
      setLastSavedJson(JSON.stringify(draft));
      setPublishStatus("saved_draft");
      setPreviewReloadToken((value) => value + 1);
      pushToast("Saved. Preview updated — not live yet.");
    } catch (error) {
      pushToast((error as AuthError).error ?? "Unable to save.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublishPage() {
    if (!token || !page) return;
    setBusy(true);
    try {
      const saved = await saveCmsPageDraft(token, slug, page);
      await publishCmsPage(token, slug);
      const draft = saved.page.draftContent;
      setPage(draft);
      setLastSavedJson(JSON.stringify(draft));
      setPublishStatus("live");
      setPreviewReloadToken((value) => value + 1);
      pushToast("Live on the public website.");
    } catch (error) {
      pushToast((error as AuthError).error ?? "Unable to make live.", "error");
    } finally {
      setBusy(false);
    }
  }

  function handleEditHomeHeadline() {
    if (tab === "pages" && slug === "home" && page) {
      const hero = page.sections.find((section) => section.type === "hero");
      setSelectedSectionId(hero?.id ?? null);
      return;
    }
    if (tab === "pages" && !confirmLeaveUnsaved()) return;
    setLoading(true);
    setTab("pages");
    setSlug("home");
    setSelectedSectionId("pending-home-hero");
  }

  function handleUpdatePersonPhoto() {
    if (tab === "pages" && pageDirty && !confirmLeaveUnsaved()) return;
    setLoading(true);
    setTab("experts");
  }

  async function handleUpload(file: File, onUrl: (url: string) => void) {
    if (!token) return;
    setBusy(true);
    try {
      const url = await uploadCmsMedia(token, file);
      onUrl(url);
      pushToast("Image uploaded.");
    } catch (error) {
      pushToast((error as AuthError).error ?? "Upload failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!isReady || !allowed) {
    return <PageLoader label="Loading site content…" />;
  }

  return (
    <DashboardShell
      title="Site content"
      description="Update website copy and images. Layout, backgrounds, and text alignment stay fixed by design."
      toolbarPlacement="below"
      toolbar={
        <SiteContentNav
          secondaryTabs={visibleTabs.map((item) => ({
            id: item,
            label: TAB_LABELS[item],
            active: tab === item,
            onClick: () => {
              if (tab === "pages" && item !== "pages" && !confirmLeaveUnsaved()) {
                return;
              }
              setLoading(true);
              setTab(item);
            },
          }))}
        />
      }
    >
      {loading ? (
        <PageLoader label="Loading…" />
      ) : (
        <div className="space-y-6">
          {tab === "pages" && page ? (
            <div className="space-y-4">
              <CommonTasks
                onEditHomeHeadline={handleEditHomeHeadline}
                onUpdatePersonPhoto={handleUpdatePersonPhoto}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <PublishBar
                    status={effectiveStatus}
                    busy={busy}
                    previewHref={`${PUBLIC_PATH_BY_SLUG[slug]}?preview=1`}
                    onSave={() => void handleSavePage()}
                    onPublish={() => void handlePublishPage()}
                    compactPreviewLink
                  />
                </div>
                <button
                  type="button"
                  className="hidden shrink-0 self-start rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm font-medium text-brand-navy hover:bg-warm-cream lg:inline-flex"
                  onClick={() => setPreviewVisible(!previewOpen)}
                >
                  {previewOpen ? "Hide preview" : "Show preview"}
                </button>
              </div>
              <div
                className={
                  previewOpen
                    ? "grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_minmax(0,1.1fr)]"
                    : "grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]"
                }
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Pages</CardTitle>
                    <CardDescription>Choose a page, then edit its blocks.</CardDescription>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <Select
                      value={slug}
                      onChange={(event) => {
                        if (!confirmLeaveUnsaved()) return;
                        setLoading(true);
                        setSlug(event.target.value as CmsPageSlug);
                      }}
                      options={CMS_PAGE_SLUGS.map((item) => ({
                        value: item,
                        label: CMS_PAGE_LABELS[item],
                      }))}
                    />
                    <BlockList
                      sections={page.sections}
                      slug={slug}
                      selectedId={selectedSectionId}
                      onSelect={setSelectedSectionId}
                      onMove={(index, direction) => {
                        setPage((current) => {
                          if (!current) return current;
                          const nextIndex = index + direction;
                          if (nextIndex < 0 || nextIndex >= current.sections.length) {
                            return current;
                          }
                          const sections = [...current.sections];
                          const [item] = sections.splice(index, 1);
                          sections.splice(nextIndex, 0, item);
                          return { ...current, sections };
                        });
                      }}
                    />
                    <div className="rounded-lg border border-dashed border-border-subtle p-3">
                      <button
                        type="button"
                        className="text-left text-sm font-medium text-brand-navy underline"
                        onClick={() => setShowAdvanced((value) => !value)}
                      >
                        {showAdvanced ? "Hide advanced" : "Advanced"}
                      </button>
                      {showAdvanced ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Add or remove blocks. Most editors only need to edit existing ones.
                          </p>
                          <div className="flex gap-2">
                            <Select
                              value={addType}
                              onChange={(event) =>
                                setAddType(event.target.value as SectionType)
                              }
                              options={SECTION_TYPES.filter(
                                (type) => type !== "divisionLayout",
                              ).map((type) => ({
                                value: type,
                                label: sectionTypeLabel(type),
                              }))}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const section = emptySection(addType);
                                setPage((current) =>
                                  current
                                    ? {
                                        ...current,
                                        sections: [...current.sections, section],
                                      }
                                    : current,
                                );
                                setSelectedSectionId(section.id);
                              }}
                            >
                              Add block
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Edit block</CardTitle>
                    <CardDescription>
                      {CMS_PAGE_LABELS[slug]}
                      {selectedSection
                        ? ` · ${sectionDisplayName(selectedSection, slug)}`
                        : ""}
                      {showAdvanced && selectedSection
                        ? ` (${selectedSection.type})`
                        : ""}
                      . Backgrounds and text alignment are fixed.
                    </CardDescription>
                  </CardHeader>
                  <CardBody>
                    {!selectedSection ? (
                      <p className="text-sm text-muted-foreground">
                        Select a block from the list.
                      </p>
                    ) : (
                      <SectionFields
                        section={selectedSection}
                        showAdvanced={showAdvanced}
                        onChange={updateSection}
                        onDelete={() => {
                          setPage((current) => {
                            if (!current) return current;
                            const sections = current.sections.filter(
                              (section) => section.id !== selectedSection.id,
                            );
                            setSelectedSectionId(sections[0]?.id ?? null);
                            return { ...current, sections };
                          });
                        }}
                        onUpload={handleUpload}
                      />
                    )}
                  </CardBody>
                </Card>

                {previewOpen ? (
                  <PreviewPane
                    slug={slug}
                    reloadToken={previewReloadToken}
                    onHide={() => setPreviewVisible(false)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === "experts" ? (
            <ExpertsEditor
              experts={experts}
              busy={busy}
              setBusy={setBusy}
              onChange={setExperts}
              token={token!}
              pushToast={pushToast}
              onUpload={handleUpload}
            />
          ) : null}

          {tab === "nav" && nav ? (
            <GlobalsEditor
              title="Menus"
              busy={busy}
              onSave={async () => {
                if (!token) return;
                setBusy(true);
                try {
                  const saved = await saveAdminGlobal(token, "nav", nav);
                  setNav(saved.global.draftContent as NavContent);
                  pushToast("Saved. Not live yet.");
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Unable to save.", "error");
                } finally {
                  setBusy(false);
                }
              }}
              onPublish={async () => {
                if (!token) return;
                const ok = window.confirm(
                  "This updates the public website. Make these menu changes live?",
                );
                if (!ok) return;
                setBusy(true);
                try {
                  await saveAdminGlobal(token, "nav", nav);
                  await publishAdminGlobal(token, "nav");
                  pushToast("Menus are live.");
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Unable to make live.", "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <NavFields value={nav} onChange={setNav} />
            </GlobalsEditor>
          ) : null}

          {tab === "footer" && footer ? (
            <GlobalsEditor
              title="Footer"
              busy={busy}
              onSave={async () => {
                if (!token) return;
                setBusy(true);
                try {
                  const saved = await saveAdminGlobal(token, "footer", footer);
                  setFooter(saved.global.draftContent as FooterContent);
                  pushToast("Saved. Not live yet.");
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Unable to save.", "error");
                } finally {
                  setBusy(false);
                }
              }}
              onPublish={async () => {
                if (!token) return;
                const ok = window.confirm(
                  "This updates the public website. Make these footer changes live?",
                );
                if (!ok) return;
                setBusy(true);
                try {
                  await saveAdminGlobal(token, "footer", footer);
                  await publishAdminGlobal(token, "footer");
                  pushToast("Footer is live.");
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Unable to make live.", "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <FooterFields value={footer} onChange={setFooter} />
            </GlobalsEditor>
          ) : null}

          {tab === "notice" && notice ? (
            <GlobalsEditor
              title="Popup notice"
              busy={busy}
              onSave={async () => {
                if (!token) return;
                setBusy(true);
                try {
                  const saved = await saveAdminGlobal(token, "notice", notice);
                  setNotice({
                    ...EMPTY_NOTICE,
                    ...(saved.global.draftContent as SiteNoticeContent),
                  });
                  pushToast("Saved. Not live yet.");
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Unable to save.", "error");
                } finally {
                  setBusy(false);
                }
              }}
              onPublish={async () => {
                if (!token) return;
                const ok = window.confirm(
                  notice.enabled
                    ? "This shows the popup to visitors who have not dismissed this notice. Make it live?"
                    : "Notice is turned off. Publishing will hide the popup on the site. Continue?",
                );
                if (!ok) return;
                setBusy(true);
                try {
                  await saveAdminGlobal(token, "notice", notice);
                  const published = await publishAdminGlobal(token, "notice");
                  setNotice({
                    ...EMPTY_NOTICE,
                    ...(published.global.draftContent as SiteNoticeContent),
                  });
                  pushToast(
                    notice.enabled
                      ? "Popup notice is live."
                      : "Popup notice unpublished (hidden).",
                  );
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Unable to make live.", "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <NoticeFields value={notice} onChange={setNotice} />
            </GlobalsEditor>
          ) : null}
        </div>
      )}
    </DashboardShell>
  );
}

function GlobalsEditor({
  title,
  children,
  busy,
  onSave,
  onPublish,
}: {
  title: string;
  children: React.ReactNode;
  busy: boolean;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Save keeps a working copy. Make live updates the public website.
        </CardDescription>
      </CardHeader>
      <CardBody className="space-y-6">
        {children}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void onSave()} disabled={busy}>
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onPublish()}
            disabled={busy}
          >
            Make live
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function NavFields({
  value,
  onChange,
}: {
  value: NavContent;
  onChange: (value: NavContent) => void;
}) {
  function updateList(
    key: "primary" | "divisions",
    index: number,
    patch: Partial<NavContent["primary"][number]>,
  ) {
    const list = value[key].map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ ...value, [key]: list });
  }

  return (
    <div className="space-y-8">
      {(["primary", "divisions"] as const).map((key) => (
        <div key={key} className="space-y-3">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-navy">
            {key}
          </h3>
          {value[key].map((item, index) => (
            <div
              key={item.id}
              className="grid gap-2 rounded-lg border border-border-subtle p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <Input
                value={item.label}
                onChange={(event) => updateList(key, index, { label: event.target.value })}
                placeholder="Label"
              />
              <Input
                value={item.href}
                onChange={(event) => updateList(key, index, { href: event.target.value })}
                placeholder="/about"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={(event) =>
                    updateList(key, index, { visible: event.target.checked })
                  }
                />
                Visible
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange({
                    ...value,
                    [key]: value[key].filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                [key]: [
                  ...value[key],
                  { id: newId(), label: "New link", href: "/about", visible: true },
                ],
              })
            }
          >
            Add link
          </Button>
        </div>
      ))}
    </div>
  );
}

function FooterFields({
  value,
  onChange,
}: {
  value: FooterContent;
  onChange: (value: FooterContent) => void;
}) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Blurb"
        value={value.blurb}
        onChange={(event) => onChange({ ...value, blurb: event.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Location"
          value={value.location}
          onChange={(event) => onChange({ ...value, location: event.target.value })}
        />
        <Input
          label="Email"
          value={value.email}
          onChange={(event) => onChange({ ...value, email: event.target.value })}
        />
        <Input
          label="Phone display"
          value={value.phoneDisplay}
          onChange={(event) => onChange({ ...value, phoneDisplay: event.target.value })}
        />
        <Input
          label="Phone href"
          value={value.phoneHref}
          onChange={(event) => onChange({ ...value, phoneHref: event.target.value })}
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-sm font-semibold text-brand-navy">Social links</h3>
        {value.social.map((item, index) => (
          <div key={item.id} className="grid gap-2 sm:grid-cols-2">
            <Input
              value={item.label}
              onChange={(event) => {
                const social = value.social.map((link, i) =>
                  i === index ? { ...link, label: event.target.value } : link,
                );
                onChange({ ...value, social });
              }}
            />
            <Input
              value={item.href}
              onChange={(event) => {
                const social = value.social.map((link, i) =>
                  i === index ? { ...link, href: event.target.value } : link,
                );
                onChange({ ...value, social });
              }}
            />
          </div>
        ))}
      </div>
      <Textarea
        label="Trust badges (one per line)"
        value={value.trustBadges.join("\n")}
        onChange={(event) =>
          onChange({
            ...value,
            trustBadges: event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          })
        }
      />
    </div>
  );
}

function NoticeFields({
  value,
  onChange,
}: {
  value: SiteNoticeContent;
  onChange: (value: SiteNoticeContent) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-heading">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) =>
            onChange({ ...value, enabled: event.target.checked })
          }
        />
        Show popup to visitors
      </label>
      <p className="text-xs text-muted-foreground">
        Visitors can dismiss the notice once. Making live again with new content
        shows it again.
      </p>
      <Input
        label="Title"
        value={value.title}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
      />
      <Textarea
        label="Message"
        rows={4}
        value={value.message}
        onChange={(event) => onChange({ ...value, message: event.target.value })}
      />
      <Input
        label="Dismiss button text"
        value={value.dismissLabel}
        onChange={(event) =>
          onChange({ ...value, dismissLabel: event.target.value })
        }
        hint='Default: "Got it"'
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Optional link text"
          value={value.linkLabel ?? ""}
          onChange={(event) =>
            onChange({ ...value, linkLabel: event.target.value })
          }
        />
        <Input
          label="Optional link URL"
          value={value.linkHref ?? ""}
          onChange={(event) =>
            onChange({ ...value, linkHref: event.target.value })
          }
          hint="Site path or https://…"
        />
      </div>
    </div>
  );
}

function ExpertsEditor({
  experts,
  busy,
  setBusy,
  onChange,
  token,
  pushToast,
  onUpload,
}: {
  experts: CmsExpertRecord[];
  busy: boolean;
  setBusy: (value: boolean) => void;
  onChange: (value: CmsExpertRecord[]) => void;
  token: string;
  pushToast: (message: string, tone?: "success" | "error") => void;
  onUpload: (file: File, onUrl: (url: string) => void) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(experts[0]?.id ?? null);
  const selected = experts.find((expert) => expert.id === selectedId) ?? null;

  async function saveSelected(draft: ExpertDraft) {
    if (!selected) return;
    setBusy(true);
    try {
      const saved = await updateCmsExpert(token, selected.id, draft);
      onChange(
        experts.map((expert) => (expert.id === selected.id ? saved.expert : expert)),
      );
      pushToast("Saved. Not live until you Make live.");
    } catch (error) {
      pushToast((error as AuthError).error ?? "Unable to save.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Staff shown on the website.</CardDescription>
        </CardHeader>
        <CardBody className="space-y-2">
          {experts.map((expert, index) => (
            <div key={expert.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedId(expert.id)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-left text-sm",
                  selectedId === expert.id
                    ? "border-brand-orange bg-brand-orange/10"
                    : "border-border-subtle",
                )}
              >
                {expert.draft.name || "Untitled"}
              </button>
              <button
                type="button"
                className="px-1 text-xs"
                onClick={async () => {
                  if (index === 0) return;
                  const order = experts.map((item) => item.id);
                  const [id] = order.splice(index, 1);
                  order.splice(index - 1, 0, id);
                  setBusy(true);
                  try {
                    const data = await reorderCmsExperts(token, order);
                    onChange(data.experts);
                    pushToast("Order updated.");
                  } catch (error) {
                    pushToast((error as AuthError).error ?? "Reorder failed.", "error");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                ↑
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setBusy(true);
              try {
                const created = await createCmsExpert(
                  token,
                  emptyExpert(experts.length),
                );
                onChange([...experts, created.expert]);
                setSelectedId(created.expert.id);
                pushToast("Expert added.");
              } catch (error) {
                pushToast((error as AuthError).error ?? "Unable to add expert.", "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            Add expert
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              const ok = window.confirm(
                "This updates the public website. Make the people list live?",
              );
              if (!ok) return;
              setBusy(true);
              try {
                await publishCmsExperts(token);
                const refreshed = await fetchAdminCmsExperts(token);
                onChange(refreshed.experts);
                pushToast("Members list is live.");
              } catch (error) {
                pushToast((error as AuthError).error ?? "Unable to make live.", "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            Make live
          </Button>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expert details</CardTitle>
        </CardHeader>
        <CardBody>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select an expert.</p>
          ) : (
            <ExpertFields
              key={selected.id}
              draft={selected.draft}
              busy={busy}
              onSave={(draft) => void saveSelected(draft)}
              onDelete={async () => {
                setBusy(true);
                try {
                  await deleteCmsExpert(token, selected.id);
                  const next = experts.filter((expert) => expert.id !== selected.id);
                  onChange(next);
                  setSelectedId(next[0]?.id ?? null);
                  pushToast("Expert removed.");
                } catch (error) {
                  pushToast((error as AuthError).error ?? "Delete failed.", "error");
                } finally {
                  setBusy(false);
                }
              }}
              onUpload={onUpload}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ExpertFields({
  draft,
  busy,
  onSave,
  onDelete,
  onUpload,
}: {
  draft: ExpertDraft;
  busy: boolean;
  onSave: (draft: ExpertDraft) => void;
  onDelete: () => void;
  onUpload: (file: File, onUrl: (url: string) => void) => Promise<void>;
}) {
  const [form, setForm] = useState(draft);
  const photo = resolveCmsAssetUrl(form.photoUrl ?? undefined);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <Input
          label="Title / position"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(event) => setForm({ ...form, slug: event.target.value })}
        />
        <Input
          label="Initials"
          value={form.initials ?? ""}
          onChange={(event) => setForm({ ...form, initials: event.target.value })}
        />
      </div>
      <Textarea
        label="Summary"
        value={form.summary ?? ""}
        onChange={(event) => setForm({ ...form, summary: event.target.value })}
      />
      <Textarea
        label="Relevant experience (one per line)"
        value={(form.experience ?? []).join("\n")}
        onChange={(event) =>
          setForm({
            ...form,
            experience: event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          })
        }
      />
      <Textarea
        label="Specialist areas (one per line)"
        value={(form.specialistAreas ?? []).join("\n")}
        onChange={(event) =>
          setForm({
            ...form,
            specialistAreas: event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          })
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) => setForm({ ...form, published: event.target.checked })}
        />
        Visible when published
      </label>
      <div className="space-y-2">
        <p className="text-sm font-medium">Photo</p>
        {photo ? (
          <div className="relative h-40 w-32 overflow-hidden rounded-lg border">
            <Image src={photo} alt="" fill className="object-cover" />
          </div>
        ) : null}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void onUpload(file, (url) => setForm((current) => ({ ...current, photoUrl: url })));
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => onSave(form)}>
          Save
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function SectionFields({
  section,
  showAdvanced = false,
  onChange,
  onDelete,
  onUpload,
}: {
  section: Section;
  showAdvanced?: boolean;
  onChange: (section: Section) => void;
  onDelete: () => void;
  onUpload: (file: File, onUrl: (url: string) => void) => Promise<void>;
}) {
  if (section.type === "divisionLayout") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Division layout fields (JSON-backed). Edit key copy below.
        </p>
        <Input
          label="Hero badge"
          value={String(section.content.heroBadge ?? "")}
          onChange={(event) =>
            onChange({
              ...section,
              content: { ...section.content, heroBadge: event.target.value },
            })
          }
        />
        <Input
          label="Hero title"
          value={String(section.content.heroTitle ?? "")}
          onChange={(event) =>
            onChange({
              ...section,
              content: { ...section.content, heroTitle: event.target.value },
            })
          }
        />
        <Textarea
          label="Hero intro"
          value={String(section.content.heroIntro ?? "")}
          onChange={(event) =>
            onChange({
              ...section,
              content: { ...section.content, heroIntro: event.target.value },
            })
          }
        />
        <Textarea
          label="Inquiry title"
          value={String(section.content.inquiryTitle ?? "")}
          onChange={(event) =>
            onChange({
              ...section,
              content: { ...section.content, inquiryTitle: event.target.value },
            })
          }
        />
        <Textarea
          label="Inquiry description"
          value={String(section.content.inquiryDescription ?? "")}
          onChange={(event) =>
            onChange({
              ...section,
              content: { ...section.content, inquiryDescription: event.target.value },
            })
          }
        />
        <Button type="button" variant="outline" onClick={onDelete}>
          Delete section
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {"label" in section ? (
        <Input
          label="Small label"
          value={section.label ?? ""}
          onChange={(event) => onChange({ ...section, label: event.target.value })}
        />
      ) : null}
      {"heading" in section ? (
        <Input
          label="Headline"
          value={section.heading ?? ""}
          onChange={(event) => onChange({ ...section, heading: event.target.value } as Section)}
        />
      ) : null}
      {"paragraph" in section ? (
        <Textarea
          label="Supporting text"
          value={section.paragraph ?? ""}
          onChange={(event) =>
            onChange({ ...section, paragraph: event.target.value } as Section)
          }
        />
      ) : null}
      {section.type === "richText" ? (
        <>
          <Textarea
            label="Body text (blank line between paragraphs)"
            value={section.paragraphs.join("\n\n")}
            onChange={(event) =>
              onChange({
                ...section,
                paragraphs: event.target.value.split(/\n\s*\n/).map((part) => part.trim()),
              })
            }
          />
          <div className="space-y-3 rounded-xl border border-border-subtle bg-warm-cream/40 p-3">
            <p className="text-sm font-semibold text-brand-navy">Stats card</p>
            <p className="text-xs text-muted-foreground">
              Numbers and credentials shown beside this section on Home. Layout stays fixed.
            </p>
            {(section.sidePanel?.stats?.length
              ? section.sidePanel.stats
              : [
                  { value: "", label: "", body: "" },
                  { value: "", label: "", body: "" },
                ]
            )
              .slice(0, 2)
              .map((stat, index) => (
                <div
                  key={`stat-${index}`}
                  className="grid gap-2 rounded-lg border border-border-subtle bg-surface p-3 sm:grid-cols-2"
                >
                  <Input
                    label={index === 0 ? "First number" : "Second number"}
                    value={stat.value}
                    onChange={(event) => {
                      const stats = [
                        ...(section.sidePanel?.stats?.length
                          ? section.sidePanel.stats
                          : [
                              { value: "", label: "", body: "" },
                              { value: "", label: "", body: "" },
                            ]),
                      ];
                      while (stats.length < 2) stats.push({ value: "", label: "", body: "" });
                      stats[index] = { ...stats[index], value: event.target.value };
                      onChange({
                        ...section,
                        sidePanel: {
                          ...section.sidePanel,
                          stats: stats.slice(0, 2),
                          footerTitle: section.sidePanel?.footerTitle,
                          footerItems: section.sidePanel?.footerItems,
                        },
                      });
                    }}
                  />
                  <Input
                    label="Label under number"
                    value={stat.label}
                    onChange={(event) => {
                      const stats = [
                        ...(section.sidePanel?.stats?.length
                          ? section.sidePanel.stats
                          : [
                              { value: "", label: "", body: "" },
                              { value: "", label: "", body: "" },
                            ]),
                      ];
                      while (stats.length < 2) stats.push({ value: "", label: "", body: "" });
                      stats[index] = { ...stats[index], label: event.target.value };
                      onChange({
                        ...section,
                        sidePanel: {
                          ...section.sidePanel,
                          stats: stats.slice(0, 2),
                          footerTitle: section.sidePanel?.footerTitle,
                          footerItems: section.sidePanel?.footerItems,
                        },
                      });
                    }}
                  />
                  {index === 0 ? (
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Short note under first number"
                        value={stat.body ?? ""}
                        onChange={(event) => {
                          const stats = [
                            ...(section.sidePanel?.stats?.length
                              ? section.sidePanel.stats
                              : [
                                  { value: "", label: "", body: "" },
                                  { value: "", label: "", body: "" },
                                ]),
                          ];
                          while (stats.length < 2) {
                            stats.push({ value: "", label: "", body: "" });
                          }
                          stats[0] = { ...stats[0], body: event.target.value };
                          onChange({
                            ...section,
                            sidePanel: {
                              ...section.sidePanel,
                              stats: stats.slice(0, 2),
                              footerTitle: section.sidePanel?.footerTitle,
                              footerItems: section.sidePanel?.footerItems,
                            },
                          });
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            <Input
              label="Credentials heading"
              value={section.sidePanel?.footerTitle ?? ""}
              onChange={(event) =>
                onChange({
                  ...section,
                  sidePanel: {
                    stats: section.sidePanel?.stats?.length
                      ? section.sidePanel.stats
                      : [
                          { value: "", label: "" },
                          { value: "", label: "" },
                        ],
                    footerTitle: event.target.value,
                    footerItems: section.sidePanel?.footerItems,
                  },
                })
              }
            />
            <Textarea
              label="Credentials (one per line)"
              value={(section.sidePanel?.footerItems ?? []).join("\n")}
              onChange={(event) =>
                onChange({
                  ...section,
                  sidePanel: {
                    stats: section.sidePanel?.stats?.length
                      ? section.sidePanel.stats
                      : [
                          { value: "", label: "" },
                          { value: "", label: "" },
                        ],
                    footerTitle: section.sidePanel?.footerTitle,
                    footerItems: event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
        </>
      ) : null}
      {section.type === "hero" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Button text"
              value={section.primaryCta?.label ?? ""}
              onChange={(event) =>
                onChange({
                  ...section,
                  primaryCta: {
                    label: event.target.value,
                    href: section.primaryCta?.href ?? "/get-started",
                  },
                })
              }
            />
            <Input
              label="Button link"
              value={section.primaryCta?.href ?? ""}
              onChange={(event) =>
                onChange({
                  ...section,
                  primaryCta: {
                    label: section.primaryCta?.label ?? "Get Started",
                    href: event.target.value,
                  },
                })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={section.mediaType === "video"}
              onChange={(event) =>
                onChange({
                  ...section,
                  mediaType: event.target.checked ? "video" : "image",
                  mediaUrl: event.target.checked
                    ? section.mediaUrl || "/Lady_justice_Video.webm"
                    : section.mediaUrl,
                })
              }
            />
            Use background video on this banner
          </label>
        </div>
      ) : null}
      {section.type === "cta" ||
      section.type === "academy" ||
      section.type === "insights" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Button text"
            value={section.buttonLabel ?? ""}
            onChange={(event) =>
              onChange({ ...section, buttonLabel: event.target.value } as Section)
            }
          />
          <Input
            label="Button link"
            value={section.buttonHref ?? ""}
            onChange={(event) =>
              onChange({ ...section, buttonHref: event.target.value } as Section)
            }
          />
        </div>
      ) : null}
      {(section.type === "textImage" ||
        section.type === "cardGrid" ||
        section.type === "photoCards" ||
        section.type === "hero") && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {section.type === "hero" ? "Photo or media" : "Photos and cards"}
          </p>
          {section.type === "textImage" || section.type === "hero" ? (
            <>
              {"image" in section && section.image ? (
                <p className="text-xs text-muted-foreground">{section.image}</p>
              ) : null}
              {"mediaUrl" in section && section.mediaUrl ? (
                <p className="text-xs text-muted-foreground">{section.mediaUrl}</p>
              ) : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void onUpload(file, (url) => {
                    if (section.type === "textImage") {
                      onChange({ ...section, image: url });
                    } else if (section.type === "hero") {
                      onChange({ ...section, mediaUrl: url, mediaType: "image" });
                    }
                  });
                }}
              />
            </>
          ) : null}
          {section.type === "cardGrid" ? (
            <CardGridEditor section={section} onChange={onChange} onUpload={onUpload} />
          ) : null}
          {section.type === "photoCards" ? (
            <PhotoCardsEditor section={section} onChange={onChange} onUpload={onUpload} />
          ) : null}
        </div>
      )}
      {showAdvanced ? (
        <Button type="button" variant="outline" onClick={onDelete}>
          Delete block
        </Button>
      ) : null}
    </div>
  );
}
