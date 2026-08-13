"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FolderKanban, Inbox, LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

type AdminSidebarProps = {
  active: "projects" | "messages";
  projectCount?: number;
  unreadMessageCount?: number;
};

const navigation = [
  { id: "projects", href: "/admin", label: "Projetos", icon: FolderKanban },
  { id: "messages", href: "/admin/messages", label: "Mensagens", icon: Inbox }
] as const;

export function AdminSidebar({ active, projectCount = 0, unreadMessageCount = 0 }: AdminSidebarProps) {
  return (
    <aside className="flex border-b border-white/10 bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 lg:flex-none lg:border-b lg:border-white/10 lg:px-5 lg:py-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04]">
          <Image src="/logo.svg" alt="" width={20} height={20} />
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold">Gabriel Morgado</span>
          <span className="mt-0.5 block font-mono text-[0.55rem] uppercase text-steel">Controle editorial</span>
        </span>
      </div>

      <nav className="flex items-center gap-1 border-l border-white/10 px-2 lg:block lg:flex-1 lg:border-l-0 lg:px-3 lg:py-5" aria-label="Navegação do painel">
        <p className="hidden px-3 font-mono text-[0.55rem] uppercase text-slate-600 lg:block">Conteúdo</p>
        <div className="flex gap-1 lg:mt-3 lg:block lg:space-y-1">
          {navigation.map(({ id, href, label, icon: Icon }) => {
            const isActive = active === id;
            const count = id === "projects" ? projectCount : unreadMessageCount;

            return (
              <Link
                key={id}
                href={href}
                title={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-11 items-center gap-3 border-l-2 px-3 text-sm transition-colors ${isActive ? "border-mint bg-white/[0.04] text-white" : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-white"}`}
              >
                <Icon size={16} className={isActive ? "text-mint" : undefined} />
                <span className="hidden lg:inline">{label}</span>
                {count > 0 ? <span className="hidden font-mono text-[0.58rem] text-slate-500 lg:ml-auto lg:inline">{count}</span> : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex items-center gap-1 border-l border-white/10 px-2 lg:block lg:border-l-0 lg:border-t lg:px-4 lg:py-4">
        <Link href="/pt" title="Ver site público" className="inline-flex h-10 items-center gap-2 px-2 text-xs text-slate-400 transition hover:text-white lg:w-full">
          <ArrowLeft size={14} />
          <span className="hidden lg:inline">Ver site público</span>
        </Link>
        <form action={signOutAction} className="lg:mt-1">
          <button title="Encerrar sessão" className="inline-flex h-10 items-center gap-2 px-2 text-xs text-slate-400 transition hover:text-coral lg:w-full" type="submit">
            <LogOut size={14} />
            <span className="hidden lg:inline">Encerrar sessão</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
