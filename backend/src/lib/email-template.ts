import { emailSiteOrigin } from "./site-origin.js";

/**
 * Shared branded HTML layout for every transactional email.
 *
 * Email-client rules followed here: table layout, inline CSS only, system fonts,
 * no flex/grid, no external CSS. Colours come from frontend/app/globals.css.
 */

export const EMAIL_BRAND = {
  name: "LEAF-C",
  tagline: "Law Enforcement Against Financial Crimes",
  location: "Kingston, Jamaica",
  contactEmail: "support@leafc.net",
} as const;

const COLOR = {
  navy: "#0d2a4a",
  navyDark: "#081e36",
  gold: "#c8a45d",
  bronze: "#ad8c53",
  pageBg: "#f5f0e8", // --warm-cream
  card: "#ffffff",
  panelBg: "#faf8f5", // --warm-white
  border: "#ebe4d8", // --warm-sand
  text: "#1a2433", // --foreground
  muted: "#5c5c5c", // --muted-foreground
  mutedLight: "#8a8a8a",
  headerSub: "#c9d3df",
} as const;

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO_STACK = "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    );
  } catch {
    return true;
  }
}

/**
 * Absolute URL of the white-on-navy logo PNG, or null when it cannot be loaded
 * by a real inbox (localhost origin with no EMAIL_LOGO_URL override).
 */
export function emailLogoUrl(): string | null {
  const override = process.env.EMAIL_LOGO_URL?.trim();
  if (override) return override;
  const origin = emailSiteOrigin();
  if (isLocalUrl(origin)) return null;
  return `${origin}/email/leafc-logo-mark-light.png`;
}

/** Styled paragraph. `innerHtml` must already be escaped / trusted. */
export function emailParagraph(innerHtml: string): string {
  return `<p style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:16px;line-height:24px;color:${COLOR.text};">${innerHtml}</p>`;
}

/** Styled inline link (label is escaped here). */
export function emailLink(url: string, label: string): string {
  return `<a href="${escapeHtml(url)}" style="color:${COLOR.navy};font-weight:600;text-decoration:underline;">${escapeHtml(label)}</a>`;
}

/** Label/value table for inquiry-style details. Values are escaped here. */
export function emailDetailsTable(rows: Array<[label: string, value: string]>): string {
  const body = rows
    .map(
      ([label, value], index) => `
        <tr>
          <td valign="top" style="padding:10px 14px;width:130px;font-family:${FONT_STACK};font-size:13px;line-height:20px;font-weight:700;color:${COLOR.muted};${index > 0 ? `border-top:1px solid ${COLOR.border};` : ""}">${escapeHtml(label)}</td>
          <td valign="top" style="padding:10px 14px;font-family:${FONT_STACK};font-size:15px;line-height:20px;color:${COLOR.text};${index > 0 ? `border-top:1px solid ${COLOR.border};` : ""}">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;background-color:${COLOR.panelBg};border:1px solid ${COLOR.border};border-radius:8px;">
      ${body}
    </table>`;
}

export interface RenderEmailOptions {
  /** Hidden inbox preview text (plain text, escaped here). */
  preheader?: string;
  /** Bold heading (plain text, escaped here). */
  heading: string;
  /** Trusted HTML: callers must escape dynamic values. See emailParagraph(). */
  bodyHtml: string;
  /** Bulletproof call-to-action button. */
  button?: { label: string; url: string };
  /** Short value shown large, letter-spaced, in a box (e.g. a sign-in code). */
  codeBlock?: string;
  /** Muted small print above the footer rule (plain text, escaped here). */
  footerNote?: string;
  /** Optional footer link, e.g. unsubscribe. */
  footerLink?: { label: string; url: string };
}

function renderHeader(): string {
  const logoUrl = emailLogoUrl();
  const logoCell = logoUrl
    ? `<td valign="middle" width="60" style="padding:0 16px 0 0;">
                <img src="${escapeHtml(logoUrl)}" width="60" height="67" alt="LEAF-C logo" style="display:block;width:60px;height:67px;border:0;outline:none;text-decoration:none;" />
              </td>`
    : "";

  return `
          <tr>
            <td bgcolor="${COLOR.navy}" style="background-color:${COLOR.navy};padding:24px 32px;border-radius:12px 12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${logoCell}
                  <td valign="middle">
                    <div style="font-family:${FONT_STACK};font-size:26px;line-height:30px;font-weight:800;letter-spacing:2px;color:#ffffff;">${EMAIL_BRAND.name}</div>
                    <div style="font-family:${FONT_STACK};font-size:12px;line-height:18px;letter-spacing:0.5px;color:${COLOR.headerSub};">${EMAIL_BRAND.tagline}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td height="4" bgcolor="${COLOR.gold}" style="height:4px;line-height:4px;font-size:0;background-color:${COLOR.gold};background-image:linear-gradient(90deg,${COLOR.navy} 0%,${COLOR.bronze} 55%,${COLOR.gold} 100%);">&nbsp;</td>
          </tr>`;
}

function renderButton(button: { label: string; url: string }): string {
  const url = escapeHtml(button.url);
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.gold}" style="background-color:${COLOR.gold};border-radius:8px;">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${FONT_STACK};font-size:16px;line-height:20px;font-weight:700;color:${COLOR.navy};text-decoration:none;border-radius:8px;">${escapeHtml(button.label)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px 0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${COLOR.muted};">Button not working? Copy and paste this link into your browser:<br /><a href="${url}" style="color:${COLOR.navy};word-break:break-all;">${url}</a></p>`;
}

function renderCodeBlock(code: string): string {
  return `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.panelBg}" style="background-color:${COLOR.panelBg};border:2px dashed ${COLOR.gold};border-radius:10px;padding:20px 12px;">
                    <span style="font-family:${MONO_STACK};font-size:36px;line-height:44px;font-weight:700;letter-spacing:10px;color:${COLOR.navy};">${escapeHtml(code)}</span>
                  </td>
                </tr>
              </table>`;
}

/** Returns a complete, email-client-safe HTML document. */
export function renderEmail(options: RenderEmailOptions): string {
  const preheader = options.preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${COLOR.pageBg};">${escapeHtml(options.preheader)}${"&zwnj;&nbsp;".repeat(40)}</div>`
    : "";

  const footerNote = options.footerNote
    ? `<p style="margin:0 0 8px 0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${COLOR.muted};">${escapeHtml(options.footerNote)}</p>`
    : "";
  const footerLink = options.footerLink
    ? `<p style="margin:0 0 8px 0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${COLOR.muted};"><a href="${escapeHtml(options.footerLink.url)}" style="color:${COLOR.muted};text-decoration:underline;">${escapeHtml(options.footerLink.label)}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(options.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.pageBg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.pageBg}" style="background-color:${COLOR.pageBg};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${COLOR.card};border-radius:12px;border:1px solid ${COLOR.border};">
          ${renderHeader()}
          <tr>
            <td style="padding:32px 32px 8px 32px;background-color:${COLOR.card};">
              <h1 style="margin:0 0 20px 0;font-family:${FONT_STACK};font-size:24px;line-height:32px;font-weight:800;color:${COLOR.navy};">${escapeHtml(options.heading)}</h1>
              ${options.bodyHtml}
              ${options.codeBlock ? renderCodeBlock(options.codeBlock) : ""}
              ${options.button ? renderButton(options.button) : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;background-color:${COLOR.card};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:${COLOR.border};">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;background-color:${COLOR.card};border-radius:0 0 12px 12px;">
              ${footerNote}
              ${footerLink}
              <p style="margin:0 0 4px 0;font-family:${FONT_STACK};font-size:12px;line-height:18px;font-weight:700;color:${COLOR.navy};">${EMAIL_BRAND.name} - ${EMAIL_BRAND.tagline}</p>
              <p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${COLOR.muted};">${EMAIL_BRAND.location} &middot; Questions? Contact <a href="mailto:${EMAIL_BRAND.contactEmail}" style="color:${COLOR.muted};text-decoration:underline;">${EMAIL_BRAND.contactEmail}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
