"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { resolveCmsAssetUrl } from "@/lib/cms/api";
import type { Section } from "@/lib/cms/types";

function newId() {
  return crypto.randomUUID();
}

type UploadHandler = (file: File, onUrl: (url: string) => void) => Promise<void>;

export function CardGridEditor({
  section,
  onChange,
  onUpload,
}: {
  section: Extract<Section, { type: "cardGrid" }>;
  onChange: (section: Section) => void;
  onUpload: UploadHandler;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-brand-navy">
        Service cards — edit title, bullets, image, and link
      </p>
      {section.cards.map((card, index) => {
        const thumb = resolveCmsAssetUrl(card.image);
        return (
          <div
            key={card.id}
            className="space-y-3 rounded-lg border border-border-subtle p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-sm font-semibold text-brand-navy">
                Card {index + 1}
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => {
                    if (index === 0) return;
                    const cards = [...section.cards];
                    const [item] = cards.splice(index, 1);
                    cards.splice(index - 1, 0, item);
                    onChange({ ...section, cards });
                  }}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index >= section.cards.length - 1}
                  onClick={() => {
                    if (index >= section.cards.length - 1) return;
                    const cards = [...section.cards];
                    const [item] = cards.splice(index, 1);
                    cards.splice(index + 1, 0, item);
                    onChange({ ...section, cards });
                  }}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...section,
                      cards: section.cards.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
            <Input
              label="Title"
              value={card.title}
              onChange={(event) => {
                const cards = section.cards.map((item, i) =>
                  i === index ? { ...item, title: event.target.value } : item,
                );
                onChange({ ...section, cards });
              }}
            />
            <Textarea
              label="Short body (optional)"
              value={card.body ?? ""}
              onChange={(event) => {
                const cards = section.cards.map((item, i) =>
                  i === index ? { ...item, body: event.target.value } : item,
                );
                onChange({ ...section, cards });
              }}
            />
            <Textarea
              label="Service bullets (one per line)"
              value={(card.items ?? []).join("\n")}
              onChange={(event) => {
                const items = event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean);
                const cards = section.cards.map((item, i) =>
                  i === index ? { ...item, items } : item,
                );
                onChange({ ...section, cards });
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Link href"
                value={card.href ?? ""}
                onChange={(event) => {
                  const cards = section.cards.map((item, i) =>
                    i === index ? { ...item, href: event.target.value } : item,
                  );
                  onChange({ ...section, cards });
                }}
              />
              <Select
                label="Accent"
                value={card.accent ?? "navy"}
                onChange={(event) => {
                  const cards = section.cards.map((item, i) =>
                    i === index ? { ...item, accent: event.target.value } : item,
                  );
                  onChange({ ...section, cards });
                }}
                options={[
                  { value: "navy", label: "Navy" },
                  { value: "orange", label: "Orange" },
                  { value: "bronze", label: "Bronze" },
                ]}
              />
            </div>
            <Input
              label="Image alt text"
              value={card.imageAlt ?? ""}
              onChange={(event) => {
                const cards = section.cards.map((item, i) =>
                  i === index ? { ...item, imageAlt: event.target.value } : item,
                );
                onChange({ ...section, cards });
              }}
            />
            {thumb ? (
              <div className="relative h-28 w-44 overflow-hidden rounded-lg border">
                <Image src={thumb} alt="" fill className="object-cover" />
              </div>
            ) : null}
            <div>
              <p className="mb-1 text-sm font-medium">Card image</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void onUpload(file, (url) => {
                    const cards = section.cards.map((item, i) =>
                      i === index ? { ...item, image: url } : item,
                    );
                    onChange({ ...section, cards });
                  });
                }}
              />
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange({
            ...section,
            cards: [
              ...section.cards,
              {
                id: newId(),
                title: "New service",
                body: "",
                items: ["New capability"],
                href: "/get-started",
                accent: "navy",
              },
            ],
          })
        }
      >
        Add card
      </Button>
    </div>
  );
}

export function PhotoCardsEditor({
  section,
  onChange,
  onUpload,
}: {
  section: Extract<Section, { type: "photoCards" }>;
  onChange: (section: Section) => void;
  onUpload: UploadHandler;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-brand-navy">Photo cards</p>
      {section.cards.map((card, index) => {
        const thumb = resolveCmsAssetUrl(card.image);
        return (
          <div
            key={card.id}
            className="space-y-3 rounded-lg border border-border-subtle p-4"
          >
            <Input
              label="Title"
              value={card.title}
              onChange={(event) => {
                const cards = section.cards.map((item, i) =>
                  i === index ? { ...item, title: event.target.value } : item,
                );
                onChange({ ...section, cards });
              }}
            />
            <Input
              label="Subtitle"
              value={card.subtitle ?? ""}
              onChange={(event) => {
                const cards = section.cards.map((item, i) =>
                  i === index ? { ...item, subtitle: event.target.value } : item,
                );
                onChange({ ...section, cards });
              }}
            />
            {thumb ? (
              <div className="relative h-28 w-44 overflow-hidden rounded-lg border">
                <Image src={thumb} alt="" fill className="object-cover" />
              </div>
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void onUpload(file, (url) => {
                  const cards = section.cards.map((item, i) =>
                    i === index ? { ...item, image: url } : item,
                  );
                  onChange({ ...section, cards });
                });
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  ...section,
                  cards: section.cards.filter((_, i) => i !== index),
                })
              }
            >
              Remove
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange({
            ...section,
            cards: [
              ...section.cards,
              { id: newId(), title: "New card", subtitle: "" },
            ],
          })
        }
      >
        Add card
      </Button>
    </div>
  );
}
