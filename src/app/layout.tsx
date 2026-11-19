import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { getProfile } from "@/lib/data";
import "./globals.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return {
    title: { default: `${p.fullName} · ${p.headline.split("·")[0].trim()}`, template: `%s · ${p.fullName}` },
    description: p.heroBio,
    openGraph: { title: p.fullName, description: p.headline, type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: [{ color: "#0a0a0c" }],
  colorScheme: "dark light",
};

const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
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
