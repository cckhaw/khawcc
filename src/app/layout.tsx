import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { getProfile } from "@/lib/data";
import { SITE_URL, snippet } from "@/lib/seo";
import "./globals.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  const role = p.headline.split("·")[0].trim();
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: p.fullName,
    title: { default: `${p.fullName} | ${role}`, template: `%s | ${p.fullName}` },
    description: snippet(p.heroBio),
    authors: [{ name: p.fullName, url: SITE_URL }],
    creator: p.fullName,
    publisher: p.fullName,
    openGraph: { type: "website", siteName: p.fullName, locale: "en_US", title: `${p.fullName} | ${role}`, description: snippet(p.heroBio), url: "/" },
    twitter: { card: "summary_large_image", title: `${p.fullName} | ${role}`, description: snippet(p.heroBio) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#14110f" },
  ],
  colorScheme: "light dark",
};

const themeScript = `document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <NavBar name={profile.fullName} />
        <main className="relative">{children}</main>
        <Footer profile={profile} />
      </body>
    </html>
  );
}
