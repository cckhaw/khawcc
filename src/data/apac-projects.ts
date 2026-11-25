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
  { id: "A", place: "Singapore", text: "Build MVNE platform, launch a fighter sub-brand and complete Prepaid migration for M1 Singapore" },
  { id: "B", place: "Malaysia", text: "Secure and deploy the largest Wi-Fi network in Malaysia for TM (Telekom Malaysia)" },
  { id: "C", place: "Indonesia", text: "Ads-sponsored and Residential Wi-Fi Offload for STP Tower in Indonesia" },
  { id: "D", place: "Malaysia", text: "Prepaid platform support and growth for Celcom Malaysia" },
  { id: "E", place: "Australia", text: "Prepaid platform support and growth for Telstra and Optus" },
  { id: "F", place: "New Zealand", text: "Deploy CDMA to GSM and GSM Dual-IMSI Roaming for Spark NZ" },
  { id: "G", place: "New Zealand", text: "Prepaid Migration for Vodafone NZ" },
  { id: "H", place: "Taiwan", text: "Prepaid Migration for Far EasTone (FET)" },
  { id: "I", place: "China", text: "Secure and roll out the world-first WRIX-based Wi-Fi Roaming Hub for China Mobile" },
  { id: "J", place: "Japan", text: "Roll out Policy Manager (PCRF) for Softbank" },
  { id: "K", place: "Philippines", text: "Roll out Prepaid Charging for Sun Cellular (now Smart)" },
  { id: "L", place: "Pakistan", text: "Wi-Fi Offload for PTCL, Mobilink and Wateen Telecom" },
  { id: "M", place: "Myanmar", text: "Supply major outdoor Wi-Fi to Myanmar Net" },
  { id: "N", place: "Bhutan", text: "Live trial of Intelligent Wi-Fi Traffic Steering for Bhutan Telecom" },
  { id: "O", place: "Sri Lanka", text: "Roll out Broadband Policy Manager (PCRF) for Sri Lanka Telecom (SLT)" },
  {
    id: "P",
    place: "Malaysia",
    current: true,
    text: "Lead the full-stack BSS transformation (CRM, Product Catalog, Billing & Charging and integrations) for Maxis",
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
