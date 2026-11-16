"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SiteContentNav } from "@/components/cms/SiteContentNav";
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
import { useToast } from "@/components/ui/Toast";
import {
  fetchAdminGlobal,
  publishAdminGlobal,
  saveAdminGlobal,
} from "@/lib/cms/api";
import {
  policyPublicPath,
  type PoliciesContent,
  type PolicyDocument,
} from "@/lib/cms/types";
import { hasPermission, isStaffRole, type AuthError } from "@/lib/auth";
import { cn } from "@/lib/utils";

function newId() {
  return crypto.randomUUID();
}

function emptyPolicy(sortOrder: number): PolicyDocument {
  return {
    id: newId(),
    slug: `policy-${Date.now()}`,
    title: "New policy",
    badge: "Governance",
    description: "",
    updated: new Date().toISOString().slice(0, 10),
    published: false,
    sortOrder,
    sections: [{ id: newId(), title: "Overview", body: "" }],
  };
}

export default function DashboardPoliciesPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const { pushToast } = useToast();
  const [content, setContent] = useState<PoliciesContent | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const allowed = Boolean(user && hasPermission(user, "canEditPages"));

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
      return;
    }
    if (!hasPermission(user, "canEditPages")) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await fetchAdminGlobal(token, "policies");
    const draft = data.global.draftContent as PoliciesContent;
    setContent(draft);
    setSelectedId(draft.policies[0]?.id ?? null);
  }, [token]);

  useEffect(() => {
    if (!token || !allowed) return;
    let cancelled = false;
    setLoading(true);
    load()
      .catch((error) => {
        if (!cancelled) {
          pushToast((error as AuthError).error ?? "Unable to load policies.", "error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, allowed, load, pushToast]);

  const selected = useMemo(
    () => content?.policies.find((policy) => policy.id === selectedId) ?? null,
    [content, selectedId],
  );

  function updateSelected(patch: Partial<PolicyDocument>) {
    if (!content || !selected) return;
    setContent({
      ...content,
      policies: content.policies.map((policy) =>
        policy.id === selected.id ? { ...policy, ...patch } : policy,
      ),
    });
  }

  async function handleSave() {
    if (!token || !content) return;
    setBusy(true);
    try {
      const saved = await saveAdminGlobal(token, "policies", content);
      setContent(saved.global.draftContent as PoliciesContent);
      pushToast("Saved. Not live yet.");
    } catch (error) {
      pushToast((error as AuthError).error ?? "Unable to save.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (!token || !content) return;
    const ok = window.confirm(
      "This updates the public website. Make these policies live?",
    );
    if (!ok) return;
    setBusy(true);
    try {
      await saveAdminGlobal(token, "policies", content);
      await publishAdminGlobal(token, "policies");
      pushToast("Policies are live.");
    } catch (error) {
      pushToast((error as AuthError).error ?? "Unable to make live.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!isReady || !allowed) {
    return <PageLoader label="Loading policies…" />;
  }

  return (
    <DashboardShell
      title="Policies"
      description="Edit Privacy, Data Protection, Terms, and other governance pages. Footer Governance links follow published policies."
      toolbarPlacement="below"
      toolbar={<SiteContentNav />}
    >
      {loading || !content ? (
        <PageLoader label="Loading…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Governance policies</CardTitle>
              <CardDescription>Add or select a policy to edit.</CardDescription>
            </CardHeader>
            <CardBody className="space-y-2">
              {[...content.policies]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => setSelectedId(policy.id)}
                    className={cn(
                      "flex w-full flex-col rounded-lg border px-3 py-2 text-left text-sm",
                      selectedId === policy.id
                        ? "border-brand-orange bg-brand-orange/10"
                        : "border-border-subtle hover:bg-warm-cream",
                    )}
                  >
                    <span className="font-medium text-brand-navy">{policy.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {policy.published ? "Published" : "Hidden"} · /{policy.slug}
                    </span>
                  </button>
                ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const policy = emptyPolicy(content.policies.length);
                  setContent({
                    ...content,
                    policies: [...content.policies, policy],
                  });
                  setSelectedId(policy.id);
                }}
              >
                Add policy
              </Button>
              <div className="flex flex-col gap-2 pt-2">
                <Button type="button" onClick={() => void handleSave()} disabled={busy}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handlePublish()}
                  disabled={busy}
                >
                  Make live
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selected ? selected.title : "Policy editor"}</CardTitle>
              <CardDescription>
                {selected
                  ? `Public link: ${policyPublicPath(selected.slug)}`
                  : "Select a policy."}
              </CardDescription>
            </CardHeader>
            <CardBody>
              {!selected ? (
                <p className="text-sm text-muted-foreground">Select a policy to edit.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Title"
                      value={selected.title}
                      onChange={(event) => updateSelected({ title: event.target.value })}
                    />
                    <Input
                      label="URL slug"
                      value={selected.slug}
                      onChange={(event) =>
                        updateSelected({
                          slug: event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                    />
                    <Input
                      label="Badge"
                      value={selected.badge}
                      onChange={(event) => updateSelected({ badge: event.target.value })}
                    />
                    <Input
                      label="Effective date"
                      value={selected.updated}
                      onChange={(event) => updateSelected({ updated: event.target.value })}
                    />
                  </div>
                  <Textarea
                    label="Short description"
                    value={selected.description}
                    onChange={(event) =>
                      updateSelected({ description: event.target.value })
                    }
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.published}
                      onChange={(event) =>
                        updateSelected({ published: event.target.checked })
                      }
                    />
                    Show in Governance menu when live
                  </label>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-brand-navy">Sections</p>
                    {selected.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="space-y-2 rounded-xl border border-border-subtle p-3"
                      >
                        <Input
                          label={`Section ${index + 1} heading`}
                          value={section.title}
                          onChange={(event) => {
                            const sections = selected.sections.map((item) =>
                              item.id === section.id
                                ? { ...item, title: event.target.value }
                                : item,
                            );
                            updateSelected({ sections });
                          }}
                        />
                        <Textarea
                          label="Body (blank line between paragraphs; start lines with - for bullets)"
                          value={section.body}
                          onChange={(event) => {
                            const sections = selected.sections.map((item) =>
                              item.id === section.id
                                ? { ...item, body: event.target.value }
                                : item,
                            );
                            updateSelected({ sections });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSelected({
                              sections: selected.sections.filter(
                                (item) => item.id !== section.id,
                              ),
                            })
                          }
                        >
                          Remove section
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateSelected({
                          sections: [
                            ...selected.sections,
                            { id: newId(), title: "New section", body: "" },
                          ],
                        })
                      }
                    >
                      Add section
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!window.confirm("Delete this policy from the draft?")) return;
                      const policies = content.policies.filter(
                        (policy) => policy.id !== selected.id,
                      );
                      setContent({ ...content, policies });
                      setSelectedId(policies[0]?.id ?? null);
                    }}
                  >
                    Delete policy
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
