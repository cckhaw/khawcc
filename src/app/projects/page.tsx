import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFilter } from "@/components/ProjectFilter";
import { PROJECT_CATEGORIES } from "@/db/schema";
import { getProjects } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Projects (*.khaw.cc)",
  description: "A growing ecosystem of production apps shipped on *.khaw.cc.",
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
      <div className="canvas-glow" />
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-14 sm:px-8 md:pt-20">
        <header className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-dim">The Lab</p>
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
            node: <ProjectCard p={p} />,
          }))}
        />
      </div>
    </div>
  );
}
