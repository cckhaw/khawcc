import chaptersJson from "./book-chapters.json";
import { readingTime } from "../../lib/markdown";
import type {
  BookChapter,
  BookPart,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from "../schema";

/**
 * Initial content. Used by `npm run db:seed` and, when DATABASE_URL is absent,
 * as an in-memory "demo mode" so the site renders fully without a database.
 */

const T = new Date("2026-11-01T00:00:00Z");

export const seedProfile: Profile = {
  id: 1,
  fullName: "Khaw Cheng Chuan",
  headline: "Telecommunications & IT Transformation Executive · Product & Platform Leader · Builder",
  location: "Kuala Lumpur, Malaysia · Singapore & APAC",
  email: "",
  linkedinUrl: "",
  githubUrl: "https://github.com/cckhaw",
  instagramHandle: "",
  avatarUrl: "",
  heroBio:
    "Twenty-five years inside telecom: from 56k-modem support desks to leading full-stack BSS transformations, launching digital brands from zero, and now building AI-native software on the side. I turn messy, high-stakes platforms into things that quietly work.",
  aboutNarrative: `I started in 2001 on a technical support desk in Kuala Lumpur, remote-controlling broken systems for customers in Myanmar, New Zealand and India over a 56k modem. Twenty-five years later I still work the same way: get close to the real problem, then build the system that makes it go away.

My career has moved through **support, pre-sales, regional sales, consulting, product and platform leadership**, across Acision/LogicaCMG, Openet, Accuris Networks, Sandvine, Ruckus, Fortesys and M1 in Singapore, and now Maxis in Malaysia. That breadth is the point: I can sit in the architecture review, the commercial negotiation and the 2 a.m. war room, and speak the language of each.

Outside the day job I build. The **\\*.khaw.cc** lab is a growing set of production apps, from telco plan comparison to endurance-sports analytics, written AI-natively and shipped fast.`,
  leadershipPhilosophy: `1. **Own the outcome.** Not the ticket, not the slide deck: the real-world impact.
2. **Simplify fiercely.** Complexity is not a badge of honour. Simplicity is what scales.
3. **Communicate like a human.** If an update can't be understood by both a marketer and a sysadmin, rewrite it.

Great leaders build the best problem-solvers, then measure success by the number of problems that no longer need them in the room.`,
  currentlyFocusedOn: `- Leading the **Amdocs → Huawei BSS transformation** at Maxis (CRM, Product Catalog, Billing & Charging and integrations).
- Writing ***Thinking in Signals***, a serialized book on 25 years of telecom, platforms and leadership.
- Growing the **\\*.khaw.cc** lab: new products, sharper AI-native workflows.`,
  updatedAt: T,
};

type ExpSeed = Omit<Experience, "id" | "createdAt" | "updatedAt">;
const exp = (o: Omit<ExpSeed, "sortOrder" | "isVisible">, i: number): Experience => ({
  ...o,
  sortOrder: (i + 1) * 10,
  isVisible: true,
  id: i + 1,
  createdAt: T,
  updatedAt: T,
});

export const seedExperiences: Experience[] = [
  exp(
    {
      roleTitle: "Program Director, IT Transformation",
      company: "Maxis",
      location: "Malaysia",
      startDate: "2026-01-01",
      endDate: null,
      isCurrent: true,
      domainTag: "Telco & BSS",
      summary:
        "Owning the full-stack BSS platform and business transformation from **Amdocs to Huawei** across CRM, Product Catalog, Billing & Charging and third-party integrations.",
      highlights: [
        "Accountable end to end for the programme: scope, architecture, vendors, delivery, cutover and business readiness.",
        "Driving the CRM, Product Catalog, Billing & Charging and integration workstreams as one coherent platform, not four projects.",
        "Aligning business, IT and vendor leadership around a migration path that protects revenue and customer experience.",
      ],
    },
    0,
  ),
  exp(
    {
      roleTitle: "Head of Product Management / Head of Platform (Deputy Director) & Product Owner (GM)",
      company: "M1 Limited",
      location: "Singapore",
      startDate: "2019-12-01",
      endDate: "2025-12-01",
      isCurrent: false,
      domainTag: "Product & Platform",
      summary:
        "Led the digital core at Singapore's M1: CRM, billing, charging, APIs, web and mobile. Built, launched and scaled the **Maxx** SIM-only digital brand and the MVNE platform behind it.",
      highlights: [
        "Directed a team of 10 across product management and platform delivery.",
        "Built, launched and scaled **Maxx**, a digital-first SIM-only brand run like a startup inside a telco.",
        "Designed a multi-tenant digital BSS / MVNE platform that launched MyRepublic, Gorilla Mobile, Geenet, Changi Mobile and Maxx in roughly 18 months.",
        "Executed two major platform migrations in a single year with zero customer-visible downtime.",
        "Led the prepaid transformation: digital KYC self-onboarding and seamless migration journeys.",
        "Scaled API monetisation and partner onboarding; repositioned the digital core as a growth engine, not a cost centre.",
      ],
    },
    1,
  ),
  exp(
    {
      roleTitle: "Business Consultant",
      company: "Fortesys",
      location: "Malaysia",
      startDate: "2018-09-01",
      endDate: "2019-11-01",
      isCurrent: false,
      domainTag: "Enterprise Networking",
      summary:
        "Rebooted the company's ASEAN growth strategy: clarified what to sell, to whom, and why customers should care.",
      highlights: [
        "Initiated ASEAN ICT distribution and built a scalable go-to-market model for emerging markets.",
        "Championed **Peplink SD-WAN** with channel partners, including grassroots integrators in Indonesia.",
        "Co-founded **ChargeLah!**, a power-bank rental service.",
      ],
    },
    2,
  ),
  exp(
    {
      roleTitle: "Regional Sales Director, ASEAN",
      company: "Ruckus Networks",
      location: "ASEAN",
      startDate: "2017-08-01",
      endDate: "2018-08-01",
      isCurrent: false,
      domainTag: "Enterprise Networking",
      summary: "Led regional sales for Wi-Fi infrastructure across ASEAN service providers and enterprises.",
      highlights: [],
    },
    3,
  ),
  exp(
    {
      roleTitle: "Regional Sales Engineer, ASEAN",
      company: "Sandvine",
      location: "ASEAN",
      startDate: "2016-02-01",
      endDate: "2017-08-01",
      isCurrent: false,
      domainTag: "Sales & Architecture",
      summary: "Technical lead on policy-control and network-intelligence bids across ASEAN operators.",
      highlights: [],
    },
    4,
  ),
  exp(
    {
      roleTitle: "Director of Business Development, APAC & Senior Engineer",
      company: "Accuris Networks",
      location: "Kuala Lumpur, Malaysia · APAC",
      startDate: "2012-04-01",
      endDate: "2016-01-01",
      isCurrent: false,
      domainTag: "Sales & Architecture",
      summary:
        "Built the Accuris business in APAC from Kuala Lumpur, selling Wi-Fi roaming and offload to operators across the region. Earlier stint as Senior Engineer, Sep 2007 – Jun 2009.",
      highlights: [],
    },
    5,
  ),
  exp(
    {
      roleTitle: "Regional Technical Sales Manager",
      company: "Openet",
      location: "Asia-Pacific",
      startDate: "2011-04-01",
      endDate: "2012-04-01",
      isCurrent: false,
      domainTag: "Sales & Architecture",
      summary: "Regional technical sales for charging and policy solutions.",
      highlights: [],
    },
    6,
  ),
  exp(
    {
      roleTitle: "Pre-sales & Solution Architect / Customer Support Engineer",
      company: "Acision / LogicaCMG",
      location: "Malaysia",
      startDate: "2004-12-01",
      endDate: "2011-03-01",
      isCurrent: false,
      domainTag: "Sales & Architecture",
      summary:
        "Moved from the support desk into pre-sales and solution architecture for messaging platforms at global operators.",
      highlights: [],
    },
    7,
  ),
  exp(
    {
      roleTitle: "Senior Support Engineer / Technical Support Executive",
      company: "ADC Software Systems & Computer Protocol",
      location: "Kuala Lumpur, Malaysia",
      startDate: "2001-06-01",
      endDate: "2004-12-01",
      isCurrent: false,
      domainTag: "Telco & BSS",
      summary:
        "Where it began: remote support for billing and telecom software customers across Myanmar, New Zealand, India and beyond.",
      highlights: [],
    },
    8,
  ),
];

export const seedSkills: SkillGroup[] = [
  {
    id: 1,
    category: "Core Competencies",
    items: [
      "BSS / OSS transformation",
      "Programme & vendor governance",
      "Product management",
      "Platform strategy",
      "MVNO / MVNE enablement",
      "Digital brand launches (0→1)",
      "Pre-sales & solution architecture",
      "Regional P&L and go-to-market",
      "Team leadership & coaching",
    ],
    sortOrder: 10,
    createdAt: T,
    updatedAt: T,
  },
  {
    id: 2,
    category: "Architecture & Stack",
    items: [
      "CRM · Product Catalog · Billing & Charging",
      "Amdocs → Huawei migration",
      "API monetisation & partner integration",
      "Digital KYC & self-onboarding",
      "Next.js · TypeScript · Tailwind",
      "Postgres · Drizzle · Neon",
      "Vercel · GitHub",
      "AI-native software delivery",
    ],
    sortOrder: 20,
    createdAt: T,
    updatedAt: T,
  },
  {
    id: 3,
    category: "Education & Certifications",
    items: [],
    sortOrder: 30,
    createdAt: T,
    updatedAt: T,
  },
];

const LOGO_EXT: Record<string, string> = { meridian: "png", plansifu: "png", splitline: "png" };
const stack = ["Next.js", "TypeScript", "Tailwind CSS", "Neon Postgres"];
const proj = (
  i: number,
  p: Pick<Project, "slug" | "name" | "url" | "category" | "tagline" | "status" | "featuredOnCv"> &
    Partial<Pick<Project, "description" | "techStack">>,
): Project => ({
  logoUrl: `/img/projects/${p.slug}.${LOGO_EXT[p.slug] ?? "svg"}`,
  description: `${p.tagline}\n\n_Placeholder: refine this description in **/admin/projects**._`,
  techStack: stack,
  ...p,
  id: i + 1,
  sortOrder: (i + 1) * 10,
  createdAt: T,
  updatedAt: T,
});

export const seedProjects: Project[] = [
  proj(0, {
    slug: "meridian",
    name: "Meridian",
    url: "https://meridian.khaw.cc",
    category: "Flagship Platforms",
    tagline: "Flagship platform in the khaw.cc lab. Details coming soon.",
    status: "live",
    featuredOnCv: true,
  }),
  proj(1, {
    slug: "plansifu",
    name: "PlanSifu",
    url: "https://plansifu.khaw.cc",
    category: "Flagship Platforms",
    tagline: "Automated Malaysia & Singapore telco and broadband plan comparison platform.",
    status: "live",
    featuredOnCv: true,
  }),
  proj(2, {
    slug: "pacevelo",
    name: "PaceVelo",
    url: "https://pacevelo.khaw.cc",
    category: "Endurance & Sports",
    tagline: "B2B corporate athletic challenge and employee wellness SaaS platform.",
    status: "live",
    featuredOnCv: true,
  }),
  proj(3, {
    slug: "splitline",
    name: "SplitLine",
    url: "https://splitline.khaw.cc",
    category: "Endurance & Sports",
    tagline: "AI endurance sports advisory and Strava telemetry race predictor.",
    status: "live",
    featuredOnCv: true,
  }),
  proj(4, {
    slug: "wodejia",
    name: "Wodejia",
    url: "https://wodejia.khaw.cc",
    category: "Utilities & Productivity",
    tagline: "Privacy-first household maintenance and asset ledger.",
    status: "live",
    featuredOnCv: true,
  }),
  proj(5, {
    slug: "bibliotek",
    name: "Bibliotek",
    url: "https://bibliotek.khaw.cc",
    category: "Utilities & Productivity",
    tagline: "Multi-tenant school and university library management platform.",
    status: "beta",
    featuredOnCv: false,
  }),
  proj(6, {
    slug: "scanlio",
    name: "Scanlio",
    url: "https://scanlio.khaw.cc",
    category: "Utilities & Productivity",
    tagline: "Smart scanning and document utility web app.",
    status: "live",
    featuredOnCv: false,
  }),
  proj(7, {
    slug: "games",
    name: "Games Arcade",
    url: "https://games.khaw.cc",
    category: "Arcade & Games",
    tagline: "Multi-game HTML5 browser arcade portal.",
    description:
      "A multi-game HTML5 browser arcade: **Slipstream**, **Synthwave Racer**, **VeloPool**, **Tower Stack**, **Trail & Tarmac**, **Xiangqi** and **Mastermind**.",
    techStack: ["HTML5 Canvas", "TypeScript", "Next.js"],
    status: "live",
    featuredOnCv: true,
  }),
];

export const seedParts: BookPart[] = [
  {
    id: 1,
    partNumber: 1,
    title: "Signals in the Noise: Systems & Architecture",
    description: "From a 56k-modem support desk to pre-sales, architecture and building a regional business: learning to read the system.",
    sortOrder: 10,
    createdAt: T,
    updatedAt: T,
  },
  {
    id: 2,
    partNumber: 2,
    title: "Leading Through Migrations",
    description: "Sales, strategy, consulting, and the platform migrations and digital brands that tested everything.",
    sortOrder: 20,
    createdAt: T,
    updatedAt: T,
  },
  {
    id: 3,
    partNumber: 3,
    title: "The Builder's Mindset",
    description: "The long game: legacy, endurance and what it means to keep building.",
    sortOrder: 30,
    createdAt: T,
    updatedAt: T,
  },
];

const PART_OF: Record<string, number> = {
  Preface: 1, "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "5.1": 1,
  "6": 2, "6.1": 2, "7": 2, "8": 2, "9": 2, "9.1": 2,
  "10": 3, Annex: 3,
};
const PUBLISHED = new Set<string>(); // all chapters start as drafts; publish them from /admin/book
const RELATED: Record<string, string[]> = {
  "8": ["plansifu"],
  "9": ["meridian"],
  Annex: ["splitline", "pacevelo"],
};

type RawChapter = { label: string; slug: string; title: string; summary: string; content: string; order: number };
export const seedChapters: BookChapter[] = (chaptersJson as RawChapter[]).map((c, i) => ({
  id: i + 1,
  partId: PART_OF[c.label] ?? null,
  chapterNumber: c.label,
  slug: c.slug,
  title: c.title,
  subtitle: "",
  status: PUBLISHED.has(c.label) ? ("wip_published" as const) : ("draft" as const),
  summary: c.summary,
  contentMarkdown: c.content,
  readingTimeMinutes: readingTime(c.content),
  relatedProjectSlugs: RELATED[c.label] ?? [],
  publishedAt: PUBLISHED.has(c.label) ? T : null,
  createdAt: T,
  updatedAt: T,
  sortOrder: c.order * 10,
}));
