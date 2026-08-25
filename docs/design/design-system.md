# LEAF-C Design System

Design tokens and component guidelines for the LEAF-C web application.

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Future Hub Orange | `#F39200` | **Primary** — CTAs, buttons, active nav, KPI accents, highlights |
| Orange Light | `#ffb033` | Hover on accent buttons |
| Orange Dark | `#c47400` | Gradient endpoints |
| Brand Gold | `#ffd166` | Chart gradients, secondary accent |
| UWI Navy Blue | `#002663` | **Secondary accent** — section headings, dividers, nav hovers, table headers, map strokes, badge outlines |
| Navy Light | `#003d8f` | Rare hover / optional variant |
| Charcoal | `#1a1a1a` | Hero backgrounds, headings, footer, table headers |
| Charcoal Light | `#2a2a2a` | Elevated dark surfaces |
| Warm White | `#faf8f5` | Page background |
| Warm Cream | `#f5f0e8` | Muted section backgrounds |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#faf8f5` | Page background (warm off-white) |
| `--foreground` | `#1a1a1a` | Body text (charcoal) |
| `--heading` | `#1a1a1a` | Headings |
| `--primary` | `#F39200` | Primary actions (orange) |
| `--surface` | `#ffffff` | Cards, inputs, elevated panels |
| `--muted` | `#f5f0e8` | Subtle backgrounds |
| `--muted-foreground` | `#5c5c5c` | Secondary text |
| `--border` | `#d4cdc3` | Input borders, dividers |
| `--success` | `#15803d` | Positive status |
| `--warning` | `#b45309` | Caution status |
| `--error` | `#b91c1c` | Error states |

## Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Headings | Montserrat | 500–800 | h1–h6, buttons, nav labels, badges |
| Body | Inter | 400 (default) | Paragraphs, form labels, table data |

### Scale

| Token | Size | Typical use |
|-------|------|-------------|
| `--text-xs` | 0.75rem | Badges, captions |
| `--text-sm` | 0.875rem | Form inputs, table cells |
| `--text-base` | 1rem | Body copy |
| `--text-lg` | 1.125rem | Lead paragraphs |
| `--text-xl` | 1.25rem | Card titles |
| `--text-2xl` | 1.5rem | Section headings |
| `--text-3xl` | 1.875rem | Page sub-headings |
| `--text-4xl` | 2.25rem | Hero headings |

## Spacing

Based on a 4px grid:

| Token | Value |
|-------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgb(26 26 26 / 0.06)` | Cards at rest |
| `--shadow-md` | `0 4px 12px rgb(26 26 26 / 0.1)` | Cards on hover |
| `--shadow-lg` | `0 12px 32px rgb(26 26 26 / 0.14)` | Modals, dropdowns |
| `--shadow-glow` | `0 0 24px rgb(243 146 0 / 0.25)` | Accent button hover |

## Gradients

| Name | CSS Variable | Direction |
|------|-------------|-----------|
| Hero mesh | `--gradient-mesh` | Charcoal + orange radial overlays |
| CTA band | `--gradient-cta` | Orange → gold (135°) |
| CTA band (navy) | `--gradient-cta-navy` | Navy → orange → gold |
| Accent bar | `--gradient-accent` | Orange → gold (90°) |
| Subtle section | `--gradient-subtle` | Warm cream → background (180°) |

### Section Dividers

- `.section-divider-navy` — navy accent line above section headings
- `.section-divider-duo` — navy-to-orange gradient divider

### Pattern Utilities

- `.pattern-grid` — subtle grid overlay for dark hero sections
- `.pattern-diamonds` — geometric diamond SVG pattern for depth

## Components

Located in `frontend/components/ui/`:

| Component | Variants |
|-----------|----------|
| Button | primary (orange), secondary (charcoal), outline, ghost, accent (gradient) |
| Card | default, featured, elevated, dark, kpi, callout + header/body/footer |
| Badge | default (charcoal), accent, outline, outline-accent, outline-navy, muted, navy, success, warning |
| Input | with label, hint, error states |
| Textarea | with label, hint, error states |
| Select | native select with custom styling |

### Accessibility

- All interactive elements use `:focus-visible` with orange ring (`--ring`)
- Form fields support `aria-invalid`, `aria-describedby`, and `role="alert"` for errors
- Color contrast targets WCAG 2.1 AA minimum
- Heading hierarchy preserved on all pages

## Layout

| Component | Path | Purpose |
|-----------|------|---------|
| SiteHeader | `components/layout/SiteHeader.tsx` | Global nav with divisions dropdown |
| SiteFooter | `components/layout/SiteFooter.tsx` | Footer with division & governance links |
| DashboardShell | `components/layout/DashboardShell.tsx` | Sidebar + content area for dashboard |
