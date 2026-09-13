import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leafc.net";

const publicRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/get-started", changeFrequency: "weekly", priority: 0.9 },
  { path: "/consultancy", changeFrequency: "monthly", priority: 0.8 },
  { path: "/operations", changeFrequency: "monthly", priority: 0.8 },
  { path: "/training", changeFrequency: "monthly", priority: 0.8 },
  { path: "/polygraph", changeFrequency: "monthly", priority: 0.8 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.5 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/data-protection", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
