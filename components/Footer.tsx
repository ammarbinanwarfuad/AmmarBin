import React from "react";
import Link from "next/link";
import { Github, Linkedin, Facebook, Instagram, Mail, Twitter } from "lucide-react";
import { getProfile } from "@/lib/server/data";

export async function Footer() {
  const profile = await getProfile();

  // Use profile values with fallbacks so icons always appear even if admin
  // hasn't filled in social links yet.
  const email     = profile.email                    || "ammarbinanwarfuad@gmail.com";
  const github    = profile.socialLinks?.github      || "https://github.com/ammarbinanwarfuad";
  const linkedin  = profile.socialLinks?.linkedin    || "https://linkedin.com/in/ammarbinanwarfuad";
  const twitter   = profile.socialLinks?.twitter     || "https://x.com/ammarbinfuad";
  const facebook  = profile.socialLinks?.facebook    || "https://www.facebook.com/ammarbinanwarfuad";
  const instagram = profile.socialLinks?.instagram   || "https://www.instagram.com/_ammarbin_/";

  const socialLinks: { name: string; href: string; icon: React.ElementType }[] = [
    { name: "GitHub",    href: github,              icon: Github    },
    { name: "LinkedIn",  href: linkedin,            icon: Linkedin  },
    { name: "Facebook",  href: facebook,            icon: Facebook  },
    { name: "Instagram", href: instagram,           icon: Instagram },
    { name: "Twitter",   href: twitter,             icon: Twitter   },
    { name: "Email",     href: `mailto:${email}`,  icon: Mail      },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-6">
            {socialLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {profile.name || "Ammar Bin Anwar Fuad"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

