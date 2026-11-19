import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFilter } from "@/components/ProjectFilter";
import { PROJECT_CATEGORIES } from "@/db/schema";
import { getProjects } from "@/lib/data";
import { absoluteUrl, snippet } from "@/lib/seo";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Projects (*.khaw.cc)",
  description: "A growing ecosystem of production web apps and platforms built and shipped on khaw.cc, from plan comparison to endurance-sports analytics, SaaS and games.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "/projects",
    title: "Projects (*.khaw.cc)",
    description: "A growing ecosystem of production web apps and platforms built and shipped on khaw.cc.",
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  // Known categories first (in canonical order), then any custom ones found in data.
  const extra = Array.from(new Set(projects.map((p) => p.category))).filter(
    (c) => !(PROJECT_CATEGORIES as readonly string[]).includes(c),
  );
  const categories = [...PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c)), ...extra];

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "khaw.cc projects",
          url: absoluteUrl("/projects"),
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "WebApplication",
              name: p.name,
              url: p.url,
              description: snippet(p.tagline || p.description || p.name, 200),
              applicationCategory: p.category,
              operatingSystem: "Web",
            },
          })),
        }}
      />
      <div className="canvas-glow" />
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-14 sm:px-8 md:pt-20">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">The Lab</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="text-gradient">*.khaw.cc</span> projects
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            A growing ecosystem of products, each on its own subdomain, built AI-natively and shipped to production.
            New subdomains appear here automatically.
          </p>
        </header>
        <ProjectFilter
          categories={categories}
          items={projects.map((p) => ({
            id: p.id,
            category: p.category,
            status: p.status,
            node: <ProjectCard p={p} headingLevel={2} />,
          }))}
        />
      </div>
    </div>
  );
}
