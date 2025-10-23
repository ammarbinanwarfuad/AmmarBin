import Link from "next/link";
import { Github, Linkedin, Facebook, Instagram, Mail, Twitter } from "lucide-react";
import { getProfile } from "@/lib/server/data";

export async function Footer() {
  const profile = await getProfile();
  
  const socialLinks = [
    profile.socialLinks?.github && {
      name: "GitHub",
      href: profile.socialLinks.github,
      icon: Github,
    },
    profile.socialLinks?.linkedin && {
      name: "LinkedIn",
      href: profile.socialLinks.linkedin,
      icon: Linkedin,
    },
    profile.socialLinks?.facebook && {
      name: "Facebook",
      href: profile.socialLinks.facebook,
      icon: Facebook,
    },
    profile.socialLinks?.instagram && {
      name: "Instagram",
      href: profile.socialLinks.instagram,
      icon: Instagram,
    },
    profile.socialLinks?.twitter && {
      name: "Twitter",
      href: profile.socialLinks.twitter,
      icon: Twitter,
    },
    profile.email && {
      name: "Email",
      href: `mailto:${profile.email}`,
      icon: Mail,
    },
  ].filter(Boolean);

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          {socialLinks.length > 0 && (
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {profile.name || "Ammar Bin Anwar Fuad"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

