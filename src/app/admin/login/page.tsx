import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { signInAction } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params?.error === "config"
      ? "Supabase não está configurado neste ambiente. Confira as variáveis na Vercel."
      : params?.error === "unauthorized"
        ? "Esta conta não tem acesso ao painel."
        : params?.error === "missing"
          ? "Preencha o email e a senha."
        : params?.error
          ? "Não foi possível entrar. Verifique suas credenciais."
          : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-10">
      <div className="hero-grid absolute inset-0 opacity-35" aria-hidden="true" />
      <section className="relative w-full max-w-md rounded-sm border border-white/12 bg-ink/95 p-6 shadow-2xl shadow-black/35 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={28} height={28} />
            <span className="text-sm font-semibold text-white">Gabriel Morgado</span>
          </div>
          <span className="font-mono text-[0.62rem] uppercase text-mint">Admin</span>
        </div>

        <h1 className="mt-7 text-2xl font-semibold text-white sm:text-3xl">Entrar no painel</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Acesso reservado para gerenciar os projetos publicados.</p>
        {errorMessage ? (
          <p role="alert" className="mt-5 rounded-sm border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
            {errorMessage}
          </p>
        ) : null}

        <Link href="/auth/google" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-white/12 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
          <LogIn size={16} />
          Entrar com Google
        </Link>
        <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          ou
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form action={signInAction} className="space-y-4">
          <label className="block text-xs text-slate-400">
            Email
            <input name="email" autoComplete="email" className="mt-2 h-12 w-full rounded-sm border border-white/12 bg-black/25 px-4 text-sm text-white outline-none focus:border-mint" type="email" placeholder="voce@email.com" required />
          </label>
          <label className="block text-xs text-slate-400">
            Senha
            <input name="password" autoComplete="current-password" className="mt-2 h-12 w-full rounded-sm border border-white/12 bg-black/25 px-4 text-sm text-white outline-none focus:border-mint" type="password" placeholder="********" required />
          </label>
          <button className="h-12 w-full rounded-sm bg-mint px-4 text-sm font-semibold text-ink transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint" type="submit">
            Entrar
          </button>
        </form>
        <Link className="group mt-6 inline-flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-white" href="/">
          <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" size={14} />
          Site público
        </Link>
      </section>
    </main>
  );
}
