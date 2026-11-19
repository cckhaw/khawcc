import type { Metadata } from "next";
import { ApacPoster } from "@/components/ApacMap";
import { DownloadPoster } from "@/components/DownloadPoster";
import { getApacDoc } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Telecom & digital transformation across APAC", robots: { index: false, follow: false } };

/** Shareable infographic (e.g. for LinkedIn), always in sync with the map on the home page. */
export default async function ApacPosterPage() {
  const doc = await getApacDoc();
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10">
      <DownloadPoster />
      <div className="overflow-x-auto">
        <ApacPoster doc={doc} />
      </div>
    </div>
  );
}
