"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
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
    <header ref={headerRef} className="fixed left-0 right-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto flex h-14 max-w-7xl items-center border border-white/10 bg-ink/[0.88] px-3 shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-4">
        <Link href="/" className="flex h-full shrink-0 items-center gap-3 pr-4 text-sm font-semibold text-ceramic focus:outline-none focus-visible:text-mint sm:pr-6">
          <span className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.04]">
            <Image className="brand-mark h-5 w-5" src="/logo.svg" alt="" width={20} height={20} priority />
          </span>
          <span className="hidden sm:inline">Gabriel Morgado</span>
          <span className="font-mono text-[0.58rem] uppercase text-steel sm:hidden">GM</span>
        </Link>

        <nav className="hidden h-full flex-1 items-stretch border-x border-white/10 md:flex" aria-label="Navegação principal">
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} className="group flex min-w-0 flex-1 items-center justify-center gap-2 border-r border-white/10 px-3 font-mono text-[0.62rem] uppercase text-steel transition-colors last:border-r-0 hover:bg-white/[0.04] hover:text-ceramic focus:outline-none focus-visible:bg-white/[0.04] focus-visible:text-mint">
              <span className="text-[0.5rem] text-slate-600 transition-colors group-hover:text-mint">0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex h-full items-center pl-3 sm:pl-4">
          <a href="#contato" className="group hidden h-9 items-center gap-2 bg-ceramic px-4 text-xs font-semibold text-ink transition-colors hover:bg-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint md:inline-flex">
            Vamos conversar
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
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
        <nav className="mx-auto max-w-7xl border-x border-b border-white/10 bg-ink/95 px-4 py-3 backdrop-blur-xl md:hidden" aria-label="Navegação móvel">
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-between border-b border-white/10 text-sm text-smoke last:border-0">
              <span className="flex items-center gap-3"><span className="font-mono text-[0.55rem] text-mint">0{index + 1}</span>{item.label}</span>
              <ArrowUpRight size={14} className="text-steel" />
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
