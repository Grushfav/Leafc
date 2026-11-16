function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function emailGatewayConfig(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = firstEnv("EMAIL_API_BASE_URL")?.replace(/\/$/, "");
  const apiKey = firstEnv("EMAIL_API_KEY");
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey };
}

/** True when the Cloudflare email-api-gateway credentials are present. */
export function isMailConfigured(): boolean {
  return Boolean(emailGatewayConfig());
}

async function sendViaEmailGateway(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const config = emailGatewayConfig();
  if (!config) {
    throw new Error("Email API gateway is not configured.");
  }

  // Only override sender when EMAIL_FROM is set and allowed by the gateway.
  // Otherwise the Worker uses DEFAULT_FROM_EMAIL (SES_FROM_EMAIL may differ).
  const from = firstEnv("EMAIL_FROM");
  const fromName = firstEnv("EMAIL_FROM_NAME");
  const replyTo = firstEnv("EMAIL_REPLY_TO");

  const response = await fetch(`${config.baseUrl}/v1/email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      ...(from ? { from } : {}),
      ...(fromName ? { fromName } : {}),
      ...(replyTo ? { replyTo } : {}),
    }),
  });

  const bodyText = await response.text();
  let payload: unknown = null;
  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      payload = bodyText;
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : bodyText || response.statusText;
    throw new Error(
      `Email gateway request failed (${response.status}): ${detail}`,
    );
  }
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn(
      "Email API gateway is not configured; skipped email:",
      options.subject,
    );
    return false;
  }

  await sendViaEmailGateway(options);
  return true;
}
