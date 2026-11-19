import type { MetadataRoute } from "next";
import { getChapters, getProfile } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, chapters] = await Promise.all([getProfile(), getChapters()]); // drafts are excluded
  const updated = profile.updatedAt;
  const latestChapter = chapters.reduce<Date | undefined>((m, c) => (!m || c.updatedAt > m ? c.updatedAt : m), undefined);
  return [
    { url: absoluteUrl("/"), lastModified: updated, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/cv"), lastModified: updated, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/projects"), lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/book"), lastModified: latestChapter ?? updated, changeFrequency: "weekly", priority: 0.8 },
    ...chapters.map((c) => ({
      url: absoluteUrl(`/book/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
