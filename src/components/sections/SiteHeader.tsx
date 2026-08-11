"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const navItems = [
  { href: "#sobre", label: "Sobre" },
  { href: "#projetos", label: "Projetos" },
  { href: "#stack", label: "Stack" },
  { href: "#contato", label: "Contato" }
];

export function SiteHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const header = headerRef.current;

    if (!header || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.fromTo(header, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(".brand-mark", { rotate: -14, scale: 0.9 }, { rotate: 0, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.7)" });
    }, header);

    return () => context.revert();
  }, []);

  return (
    <header ref={headerRef} className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-ceramic focus:outline-none focus-visible:text-mint">
          <Image className="brand-mark" src="/logo.svg" alt="" width={27} height={27} priority />
          <span>Gabriel Morgado</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="font-mono text-[0.67rem] uppercase text-steel transition-colors hover:text-ceramic focus:outline-none focus-visible:text-mint">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden h-9 items-center border border-white/15 px-3 font-mono text-[0.62rem] uppercase text-smoke transition-colors hover:border-mint/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint sm:inline-flex">
            Admin
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center border border-white/15 text-ceramic focus:outline-none focus-visible:ring-2 focus-visible:ring-mint md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-white/10 bg-ink px-5 py-4 md:hidden" aria-label="Navegação móvel">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-between border-b border-white/10 text-sm text-smoke last:border-0">
              {item.label}
              <span className="font-mono text-[0.6rem] text-steel">{item.href}</span>
            </a>
          ))}
          <Link href="/admin" className="mt-3 inline-flex h-10 items-center font-mono text-[0.65rem] uppercase text-mint">
            Acessar painel
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
