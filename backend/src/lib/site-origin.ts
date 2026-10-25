const PUBLIC_SITE_FALLBACK = "https://leafc.net";

function configuredOrigins(): string[] {
  return (process.env.FRONTEND_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
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

/** Origin used in emails. Never returns localhost when a public origin is configured. */
export function emailSiteOrigin(): string {
  const origins = configuredOrigins();
  const publicOrigin = origins.find((origin) => !isLocalOrigin(origin));
  if (publicOrigin) return publicOrigin;
  if (process.env.NODE_ENV === "production") return PUBLIC_SITE_FALLBACK;
  return origins[0] ?? "http://localhost:3000";
}
