import type { Experience, Profile, SkillGroup } from "@/db/schema";
import { absoluteUrl, SITE_URL, snippet } from "./seo";

/** schema.org Person for the site owner, built from the profile, current role and skills. */
export function personLd(profile: Profile, experiences: Experience[] = [], skills: SkillGroup[] = []) {
  const current = experiences.find((e) => e.isCurrent);
  const sameAs = [
    profile.linkedinUrl,
    profile.githubUrl,
    profile.stravaUrl,
    profile.instagramHandle && `https://instagram.com/${profile.instagramHandle.replace(/^@/, "")}`,
  ].filter(Boolean);
  const knows = skills.find((g) => g.category === "Core Competencies")?.items.slice(0, 8) ?? [];
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.fullName,
    url: SITE_URL,
    image: profile.avatarUrl || absoluteUrl("/img/portrait-light.webp"),
    jobTitle: profile.headline.split("·")[0].trim(),
    description: snippet(profile.heroBio, 300),
    homeLocation: { "@type": "Place", name: profile.location.split("·")[0].trim() },
    ...(current ? { worksFor: { "@type": "Organization", name: current.company } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(knows.length ? { knowsAbout: knows } : {}),
  };
}

export const websiteLd = (name: string) => ({
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#person` },
});
