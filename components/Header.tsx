"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy load ThemeToggle to reduce initial bundle size
const ThemeToggle = dynamic(() => import("./ThemeToggle").then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="w-12 h-12 rounded-full bg-accent/50 animate-pulse" />
});

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Skills", href: "/skills" },
  { name: "Projects", href: "/projects" },
  { name: "Experience", href: "/experience" },
  { name: "Education", href: "/education" },
  { name: "Certifications", href: "/certifications" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Predictive prefetching on hover (desktop) - handled via onMouseEnter prop

  // Intersection Observer for viewport-based prefetching
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
            const href = entry.target.getAttribute('href');
            if (href && href.startsWith('/')) {
              router.prefetch(href);
            }
          }
        });
      },
      { rootMargin: '100px' } // Prefetch when link is 100px from viewport
    );

    const links = linkRefs.current;
    links.forEach((link) => {
      if (link) {
        observer.observe(link);
      }
    });

    return () => {
      links.forEach((link) => {
        if (link) {
          observer.unobserve(link);
        }
      });
    };
  }, [router]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" prefetch={true} className="-m-1.5 p-1.5">
            <span className="text-xl font-bold">Ammar Bin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex lg:gap-x-6 lg:items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                ref={(el) => {
                  if (el) {
                    linkRefs.current.set(item.href, el);
                  }
                }}
                href={item.href}
                prefetch={true}
                className="text-sm font-medium leading-6 text-foreground hover:text-primary transition-colors"
                onMouseEnter={() => router.prefetch(item.href)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <ThemeToggle />
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                ref={(el) => {
                  if (el) {
                    linkRefs.current.set(item.href, el);
                  }
                }}
                href={item.href}
                prefetch={true}
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

