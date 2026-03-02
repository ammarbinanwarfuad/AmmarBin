'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CSSProperties } from 'react';

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

interface SkillsShowcaseProps {
  skills: Skill[];
  categories: string[];
}

// ── Icon lookup ────────────────────────────────────────────────────────────────
export function getIconUrl(skillName: string, iconField?: string): string {
  if (iconField && (iconField.startsWith('http') || iconField.startsWith('/'))) {
    return iconField;
  }

  const n = (skillName || '').toLowerCase().trim();

  const iconMap: Record<string, string> = {
    html:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    html5:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    css:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    css3:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    javascript:     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    js:             'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    typescript:     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    ts:             'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    react:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'react js':     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    reactjs:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'react.js':     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'next.js':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    nextjs:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    'next js':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    vue:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    'vue.js':       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    vuejs:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    angular:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    svelte:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg',
    redux:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
    sass:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
    scss:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
    bootstrap:      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
    tailwind:       'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
    tailwindcss:    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
    'tailwind css': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
    materialui:     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg',
    'material ui':  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg',
    'node.js':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    nodejs:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'node js':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    node:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    express:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    'express.js':   'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    expressjs:      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    python:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    django:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
    flask:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
    php:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    laravel:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg',
    java:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    spring:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
    go:             'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    golang:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    rust:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg',
    ruby:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
    rails:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-original-wordmark.svg',
    swift:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
    kotlin:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    c:              'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    'c++':          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    cpp:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    'c#':           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
    csharp:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
    mongodb:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    postgresql:     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    postgres:       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    mysql:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    redis:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    sqlite:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
    firebase:       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
    git:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    github:         'https://cdn.simpleicons.org/github/000000',  // dark icon — inverted in dark mode via CSS
    gitlab:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg',
    docker:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    dockers:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    kubernetes:     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
    aws:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
    azure:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
    gcp:            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg',
    nginx:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
    linux:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
    ubuntu:         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg',
    graphql:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
    jest:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg',
    webpack:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg',
    vite:           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg',
    figma:          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
    wordpress:      'https://cdn.simpleicons.org/wordpress',
    'wordpress.com': 'https://cdn.simpleicons.org/wordpress',
    // VS Code
    vscode:         'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg',
    'vs code':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg',
    'visual studio code': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg',
    // JSON
    json:           'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/json/json-original.svg',
    // npm
    npm:            'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg',
    // Design tools
    canva:          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg',
    photoshop:      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg',
    'adobe photoshop': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg',
    xd:             'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/xd/xd-original.svg',
    'adobe xd':     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/xd/xd-original.svg',
    illustrator:    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-original.svg',
    'adobe illustrator': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-original.svg',
    'adobe premiere pro': '/premiere-pro.svg',
    'premiere pro':  '/premiere-pro.svg',
    premierepro:    '/premiere-pro.svg',
    premiere:       '/premiere-pro.svg',
    blogger:        '/Blogger_icon.svg',
    vercel:         'https://cdn.simpleicons.org/vercel/ffffff',
    netlify:        'https://cdn.simpleicons.org/netlify',
    shopify:        'https://cdn.simpleicons.org/shopify',
    prisma:         'https://cdn.simpleicons.org/prisma/ffffff',
    postman:        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
  };

  const url = iconMap[n];
  if (url) return url;

  const slug = n.replace(/[^a-z0-9]/g, '');
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
}

// ── Icons that are monochrome-dark and need CSS inversion in dark mode ──────────
const DARK_INVERT_ICONS = new Set(['github', 'express', 'express.js', 'expressjs']);

export function needsDarkInvert(skillName: string): boolean {
  return DARK_INVERT_ICONS.has((skillName || '').toLowerCase().trim());
}

// ── Category accent colour ─────────────────────────────────────────────────────
export function getCategoryColor(category: string): string {
  const lc = category.toLowerCase();
  if (lc.includes('frontend') || lc.includes('front-end') || lc.includes('front end')) return '#3B82F6';
  if (lc.includes('backend') || lc.includes('back-end') || lc.includes('back end')) return '#10B981';
  if (lc.includes('programming')) return '#EF4444';
  if (lc.includes('tools') || lc.includes('technologies')) return '#F59E0B';
  if (lc.includes('cms')) return '#8B5CF6';
  if (lc.includes('design')) return '#EC4899';
  if (lc.includes('database')) return '#06B6D4';
  return '#EAB308';
}

// ── Single Skill Card ──────────────────────────────────────────────────────────
function SkillCard({ skill }: { skill: Skill | null }) {
  const [imgError, setImgError] = useState(false);

  if (!skill) {
    return <div className="h-full rounded-2xl border border-border/30 bg-card/20" />;
  }

  const iconUrl    = getIconUrl(skill.name, skill.icon);
  const accent      = getCategoryColor(skill.category);
  const invertClass = needsDarkInvert(skill.name) ? 'dark:invert' : '';

  return (
    <div
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl
                 bg-card border border-border
                 hover:border-yellow-400/70 hover:bg-accent/40
                 transition-all duration-300 cursor-default p-3 h-full"
    >
      {/* Icon — large, takes up ~55% of card */}
      <div className="flex items-center justify-center w-[55%] aspect-square shrink-0">
        {!imgError ? (
          <img
            src={iconUrl}
            alt={skill.name}
            className={`w-full h-full object-contain drop-shadow-lg ${invertClass}`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full rounded-xl flex items-center justify-center
                       text-white font-bold text-2xl [background-color:var(--accent-color)]"
            style={{ '--accent-color': accent } as CSSProperties}
          >
            {skill.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className="text-[10px] sm:text-[11px] font-bold text-muted-foreground text-center
                   tracking-[0.12em] uppercase leading-tight
                   group-hover:text-foreground transition-colors"
      >
        {skill.name}
      </span>
    </div>
  );
}

// ── Main Showcase ──────────────────────────────────────────────────────────────
// Items per page adapts to breakpoint so we always get exactly 2 rows:
// mobile → 2 cols × 2 rows = 4 | sm → 3 cols × 2 rows = 6 | lg → 5 cols × 2 rows = 10
function useItemsPerPage() {
  const [items, setItems] = useState(10);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640)       setItems(4);
      else if (window.innerWidth < 1024) setItems(6);
      else                               setItems(10);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return items;
}

export function SkillsShowcase({ skills, categories }: SkillsShowcaseProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const lastWheelRef   = useRef(0);
  const isAnimating    = useRef(false);
  const touchStartRef  = useRef<{ x: number; y: number } | null>(null);

  const [catIdx,    setCatIdx]    = useState(0);
  const [subPage,   setSubPage]   = useState(0);
  const [visible,   setVisible]   = useState(true);
  const [direction, setDirection] = useState<'down' | 'up'>('down');

  const ITEMS_PER_PAGE = useItemsPerPage();
  const totalCats = categories.length;

  const catSkills     = skills
    .filter((s) => s.category === (categories[catIdx] ?? ''))
    .sort((a, b) => a.name.localeCompare(b.name));
  const totalSubPages = Math.max(1, Math.ceil(catSkills.length / ITEMS_PER_PAGE));
  const pageSkills    = catSkills.slice(subPage * ITEMS_PER_PAGE, (subPage + 1) * ITEMS_PER_PAGE);

  const paddedSkills: (Skill | null)[] = [
    ...pageSkills,
    ...Array(Math.max(0, ITEMS_PER_PAGE - pageSkills.length)).fill(null),
  ];

  // ── Transition helper ──────────────────────────────────────────────────────
  const animate = useCallback(
    (newCat: number, newSub: number, dir: 'down' | 'up') => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      setDirection(dir);
      setVisible(false);
      setTimeout(() => {
        setCatIdx(newCat);
        setSubPage(newSub);
        setVisible(true);
        setTimeout(() => { isAnimating.current = false; }, 360);
      }, 300);
    },
    []
  );

  // ── Wheel handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelRef.current < 750) return;
      lastWheelRef.current = now;

      if (e.deltaY > 0) {
        if (subPage < totalSubPages - 1) {
          animate(catIdx, subPage + 1, 'down');
        } else if (catIdx < totalCats - 1) {
          animate(catIdx + 1, 0, 'down');
        }
      } else {
        if (subPage > 0) {
          animate(catIdx, subPage - 1, 'up');
        } else if (catIdx > 0) {
          const prevCat    = catIdx - 1;
          const prevSkills = skills.filter((s) => s.category === categories[prevCat]).sort((a, b) => a.name.localeCompare(b.name));
          const prevSub    = Math.max(0, Math.ceil(prevSkills.length / ITEMS_PER_PAGE) - 1);
          animate(prevCat, prevSub, 'up');
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Only handle predominantly vertical swipes
      if (Math.abs(dy) < 40 || Math.abs(dy) < Math.abs(dx)) return;

      const swipeDown = dy < 0; // finger moved up = scroll down
      if (swipeDown) {
        if (subPage < totalSubPages - 1) {
          animate(catIdx, subPage + 1, 'down');
        } else if (catIdx < totalCats - 1) {
          animate(catIdx + 1, 0, 'down');
        }
      } else {
        if (subPage > 0) {
          animate(catIdx, subPage - 1, 'up');
        } else if (catIdx > 0) {
          const prevCat    = catIdx - 1;
          const prevSkills = skills.filter((s) => s.category === categories[prevCat]).sort((a, b) => a.name.localeCompare(b.name));
          const prevSub    = Math.max(0, Math.ceil(prevSkills.length / ITEMS_PER_PAGE) - 1);
          animate(prevCat, prevSub, 'up');
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [catIdx, subPage, totalSubPages, totalCats, skills, categories, animate]);

  // ── Overall progress for right bar ────────────────────────────────────────
  const totalViews = categories.reduce(
    (acc, cat) => acc + Math.max(1, Math.ceil(skills.filter((s) => s.category === cat).length / ITEMS_PER_PAGE)),
    0
  );
  const viewsBefore = categories.slice(0, catIdx).reduce(
    (acc, cat) => acc + Math.max(1, Math.ceil(skills.filter((s) => s.category === cat).length / ITEMS_PER_PAGE)),
    0
  );
  const progressPct = totalViews > 1 ? ((viewsBefore + subPage) / (totalViews - 1)) * 100 : 100;

  // ── Animation classes ──────────────────────────────────────────────────────
  const gridClass = visible
    ? 'opacity-100 translate-y-0'
    : direction === 'down'
    ? 'opacity-0 translate-y-8'
    : 'opacity-0 -translate-y-8';

  const currentCategory = categories[catIdx] ?? '';
  const categoryColor   = getCategoryColor(currentCategory);

  if (!totalCats || skills.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">No skills data available yet.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center h-full w-full overflow-hidden px-2 sm:px-4"
    >
      {/* ── LEFT SIDEBAR — hidden on mobile ───────────────────────────── */}
      <div className="hidden sm:flex flex-col items-center justify-center gap-5 w-10 md:w-14 shrink-0 self-stretch">
        <div className="w-[3px] h-12 md:h-16 bg-yellow-400 rounded-full" />
        <span
          style={{ '--cat-color': categoryColor } as CSSProperties}
          className="text-[9px] md:text-[11px] font-extrabold tracking-[0.2em] uppercase whitespace-nowrap
                     [writing-mode:vertical-rl] rotate-180 select-none leading-none [color:var(--cat-color)]"
        >
          {currentCategory}
        </span>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between gap-3 overflow-hidden min-h-0 max-w-6xl py-3 sm:py-5 md:py-6">

        {/* Category label — mobile only */}
        <p
          style={{ '--cat-color': categoryColor } as CSSProperties}
          className="sm:hidden text-[11px] font-extrabold tracking-[0.2em] uppercase select-none [color:var(--cat-color)]"
        >
          {currentCategory}
        </p>

        {/* Responsive grid: 2 cols mobile → 3 cols tablet → 5 cols desktop */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full flex-1 min-h-0 transition-all duration-300 ease-in-out [grid-template-rows:repeat(2,1fr)] ${gridClass}`}
        >
          {paddedSkills.map((skill, idx) => (
            <SkillCard
              key={skill ? skill._id : `empty-${idx}`}
              skill={skill}
            />
          ))}
        </div>

        {/* ── Controls ────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {/* Sub-page dots — only if category has >10 skills */}
          {totalSubPages > 1 && (
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSubPages }).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Sub-page ${i + 1}`}
                  onClick={() => animate(catIdx, i, i > subPage ? 'down' : 'up')}
                  className={`rounded-full transition-all duration-300 focus:outline-none touch-manipulation ${
                    i === subPage
                      ? 'w-6 h-1.5 sm:h-[5px] bg-yellow-400'
                      : 'w-1.5 h-1.5 sm:w-[5px] sm:h-[5px] bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Category navigation dots */}
          <div className="flex items-center gap-2">
            {categories.map((cat, i) => (
              <button
                key={cat}
                aria-label={`Go to ${cat}`}
                onClick={() => animate(i, 0, i > catIdx ? 'down' : 'up')}
                className={`rounded-full transition-all duration-300 focus:outline-none touch-manipulation [background-color:var(--dot-color)] ${
                  i === catIdx ? 'w-6 h-1.5' : 'w-1.5 h-1.5'
                }`}
                style={{ '--dot-color': i === catIdx ? categoryColor : 'hsl(var(--border))' } as CSSProperties}
              />
            ))}
          </div>

          {/* x / n counter */}
          <p className="text-[11px] text-muted-foreground tracking-widest font-medium select-none">
            {String(catIdx + 1).padStart(2, '0')} / {String(totalCats).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR — hidden on mobile ──────────────────────────── */}
      <div className="hidden sm:flex flex-col items-center justify-center w-8 md:w-10 shrink-0 self-stretch gap-3">
        <div className="relative w-[3px] h-36 md:h-48 bg-border rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 bg-yellow-400 rounded-full transition-all duration-500 ease-out [height:var(--prog-height)]"
            style={{ '--prog-height': `${progressPct}%` } as CSSProperties}
          />
        </div>
        <div className="flex flex-col items-center gap-[5px]">
          {categories.map((cat, i) => (
            <div
              key={cat}
              onClick={() => animate(i, 0, i > catIdx ? 'down' : 'up')}
              title={cat}
              className={`rounded-full cursor-pointer transition-all duration-300 [background-color:var(--dot-color)] ${
                i === catIdx ? 'w-2 h-2' : 'w-[5px] h-[5px]'
              }`}
              style={{ '--dot-color': i === catIdx ? categoryColor : 'hsl(var(--border))' } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
