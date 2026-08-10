"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const navItems = [
  { href: "#sobre", label: "Sobre" },
  { href: "#projetos", label: "Projetos" },
  { href: "#stack", label: "Stack" },
  { href: "#contato", label: "Contato" }
];

export function SiteHeader() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;

    if (!header || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.fromTo(header, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(".brand-mark", { rotate: -16, scale: 0.9 }, { rotate: 0, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.7)" });
    }, header);

    return () => context.revert();
  }, []);

  return (
    <header ref={headerRef} className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide text-white">
          <Image className="brand-mark" src="/logo.svg" alt="" width={28} height={28} priority />
          Gabriel Morgado
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <Link href="/admin" className="rounded-full border border-white/14 px-4 py-2 text-sm text-slate-200 transition hover:border-mint/60 hover:text-white">
          Admin
        </Link>
      </div>
    </header>
  );
}
