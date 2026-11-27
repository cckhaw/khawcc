/** Default content for the APAC map (used until it is edited in /admin/map). Pin positions come from apac-map.json (scripts/build-apac-map.mjs). */
import map from "./apac-map.json";
import type { ApacDoc } from "../lib/apac";

export type ApacProject = {
  id: string;
  text: string;
  /** Short place label (used for the pin's accessible name). */
  place: string;
  /** Highlighted as the current / most recent engagement. */
  current?: boolean;
};

export const APAC_STATS = [
  { value: "15", label: "Countries" },
  { value: "30+", label: "Major projects" },
  { value: "Millions", label: "of users" },
];

export const APAC_PROJECTS: ApacProject[] = [
  { id: "A", place: "Singapore", text: "Build MVNE platform, launch a fighter sub-brand and complete Prepaid migration for M1 Singapore. The multi-tenant platform launched MVNOs for MyRepublic, Gorilla Mobile, Geenet and Changi Mobile, plus M1's own fighter brand Maxx, in roughly 18 months. It came with digital KYC self-onboarding and two major platform migrations in one year, with zero customer-visible downtime." },
  { id: "B", place: "Malaysia", text: "Secure and deploy the largest Wi-Fi network in Malaysia for TM (Telekom Malaysia). A carrier-scale Wi-Fi network has to authenticate and protect a very large number of users and hotspots, so security mattered as much as coverage. The work took the network from design through secure rollout for the country's national operator." },
  { id: "C", place: "Indonesia", text: "Ads-sponsored and Residential Wi-Fi Offload for STP Tower in Indonesia. Wi-Fi offload moves mobile data traffic onto Wi-Fi to relieve congested cellular networks. The solution combined ad-sponsored public access, where advertisers fund free connectivity, with offload through residential Wi-Fi." },
  { id: "D", place: "Malaysia", text: "Prepaid platform support and growth for Celcom Malaysia. Prepaid depends on a charging platform that rates and balances every call and data session in real time, so reliability is non-negotiable. The work kept that platform healthy while helping it grow with new plans and offers." },
  { id: "E", place: "Australia", text: "Prepaid platform support and growth for Telstra and Optus. Supporting two of Australia's largest operators meant keeping a real-time charging platform dependable at scale. It also meant evolving it as new plans, bundles and offers came to market." },
  { id: "F", place: "New Zealand", text: "Deploy CDMA to GSM and GSM Dual-IMSI Roaming for Spark NZ. Spark, formerly Telecom NZ, was moving subscribers from a CDMA network to GSM, so service had to keep working while the network changed underneath them. Dual-IMSI roaming puts two network identities on one SIM, which lets a traveller use local rates abroad." },
  { id: "G", place: "New Zealand", text: "Prepaid Migration for Vodafone NZ. Migrating a prepaid base means moving balances, bundles and customer histories to a new platform without anyone losing credit or service. Done well, customers barely notice that it happened." },
  { id: "H", place: "Taiwan", text: "Prepaid Migration for Far EasTone (FET). The migration moved prepaid customers onto a new platform while protecting their balances, bundles and active services. It required careful planning of the cutover so that top-ups and usage kept working throughout." },
  { id: "I", place: "China", text: "Secure and roll out the world-first WRIX-based Wi-Fi Roaming Hub for China Mobile. WRIX is the Wireless Broadband Alliance's standard for exchanging Wi-Fi roaming traffic and settlement data between operators. The hub let users roam across partner networks on a single account." },
  { id: "J", place: "Japan", text: "Roll out Policy Manager (PCRF) for Softbank. A PCRF is the part of the mobile core that decides what each subscriber and session is allowed to do, at what speed and at what charge. It is how fair-usage rules and plan entitlements are enforced in real time across the network." },
  { id: "K", place: "Philippines", text: "Roll out Prepaid Charging for Sun Cellular (now Smart). Prepaid charging deducts credit in real time as customers call, text and use data, so accuracy and speed matter on every transaction. The rollout put that engine in place for a large prepaid customer base." },
  { id: "L", place: "Pakistan", text: "Wi-Fi Offload for PTCL, Mobilink and Wateen Telecom. Offload moves data traffic from congested mobile networks onto Wi-Fi to improve customer experience and relieve capacity. The work covered three operators (Mobilink is now Jazz), each with its own network and commercial needs." },
  { id: "M", place: "Myanmar", text: "Supply major outdoor Wi-Fi to Myanmar Net. Outdoor Wi-Fi at scale has to cope with weather, power and backhaul constraints that indoor networks never face. The project supplied the wireless infrastructure to bring dependable public coverage to the operator's customers." },
  { id: "N", place: "Bhutan", text: "Live trial of Intelligent Wi-Fi Traffic Steering for Bhutan Telecom. Traffic steering guides devices to the best available connection, Wi-Fi or cellular, based on real network conditions rather than signal strength alone. The trial ran on the live network, proving the approach with real customers before any wider rollout." },
  { id: "O", place: "Sri Lanka", text: "Roll out Broadband Policy Manager (PCRF) for Sri Lanka Telecom (SLT). On a broadband network the policy manager applies each customer's plan, speed and fair-usage rules automatically. It gives the operator control over how capacity is shared and how packages are enforced." },
  {
    id: "P",
    place: "Malaysia",
    current: true,
    text: "Lead the full-stack BSS transformation (CRM, Product Catalog, Billing & Charging and integrations) for Maxis. I'm accountable end to end, from scope, architecture and vendors through to cutover and business readiness. The goal is a migration that protects revenue and customer experience.",
  },
];

const pins = map.pins as Record<string, number[]>;

/** Theme per project letter (drives the filter chips on the home page). */
const TAGS: Record<string, string> = {
  A: "Platforms & transformation",
  P: "Platforms & transformation",
  D: "Prepaid & charging",
  E: "Prepaid & charging",
  G: "Prepaid & charging",
  H: "Prepaid & charging",
  K: "Prepaid & charging",
  B: "Wi-Fi & roaming",
  C: "Wi-Fi & roaming",
  F: "Wi-Fi & roaming",
  I: "Wi-Fi & roaming",
  L: "Wi-Fi & roaming",
  M: "Wi-Fi & roaming",
  N: "Wi-Fi & roaming",
  J: "Policy control",
  O: "Policy control",
};

export const DEFAULT_APAC_DOC: ApacDoc = {
  stats: APAC_STATS,
  items: APAC_PROJECTS.map((p) => ({
    id: `seed-${p.id}`,
    text: p.text,
    place: p.place,
    tag: TAGS[p.id] ?? "",
    current: Boolean(p.current),
    visible: true,
    x: pins[p.id][0],
    y: pins[p.id][1],
  })),
};
