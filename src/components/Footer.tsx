import Link from "next/link";
import type { Profile } from "@/db/schema";
import { GithubIcon, InstagramIcon, LinkedinIcon, MailIcon } from "./icons";

export function SocialLinks({ profile, className = "" }: { profile: Profile; className?: string }) {
  const items = [
    profile.email && { href: `mailto:${profile.email}`, label: "Email", Icon: MailIcon },
    profile.linkedinUrl && { href: profile.linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon },
    profile.githubUrl && { href: profile.githubUrl, label: "GitHub", Icon: GithubIcon },
    profile.instagramHandle && {
      href: `https://instagram.com/${profile.instagramHandle.replace(/^@/, "")}`,
      label: "Instagram",
      Icon: InstagramIcon,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof MailIcon }[];
  if (!items.length) return null;
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-muted transition hover:border-accent hover:text-accent"
          >
            <Icon width={17} height={17} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="no-print mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="text-sm font-medium">{profile.fullName}</p>
          <p className="mt-1 font-mono text-xs text-dim">
            © {new Date().getFullYear()} · {profile.location.split("·")[0].trim()}
          </p>
        </div>
        <SocialLinks profile={profile} />
        <p className="font-mono text-xs text-dim">
          <Link href="/projects" className="hover:text-fg">
            *.khaw.cc
          </Link>
        </p>
      </div>
    </footer>
  );
}
