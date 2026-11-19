import type { Metadata } from "next";
import { ApacPoster } from "@/components/ApacMap";

export const metadata: Metadata = { title: "APAC transformation (image)", robots: { index: false, follow: false } };

/** Unlisted page used to render the shareable infographic (see public/img/apac-transformation.png). */
export default function ApacPosterPage() {
  return (
    <div className="flex justify-center overflow-x-auto bg-white py-8">
      <ApacPoster />
    </div>
  );
}
