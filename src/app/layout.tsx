import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { getProfile } from "@/lib/data";
import "./globals.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://khaw.cc"),
    title: { default: `${p.fullName} · ${p.headline.split("·")[0].trim()}`, template: `%s · ${p.fullName}` },
    description: p.heroBio,
    openGraph: { title: p.fullName, description: p.headline, type: "website", siteName: p.fullName, url: "/" },
    twitter: { card: "summary_large_image", title: p.fullName, description: p.headline },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#14110f" },
  ],
  colorScheme: "light dark",
};

const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`;

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
