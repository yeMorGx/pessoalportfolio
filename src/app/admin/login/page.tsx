import Link from "next/link";
import { LogIn } from "lucide-react";
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
        : params?.error
          ? "Não foi possível entrar. Verifique suas credenciais."
          : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-md border border-white/12 bg-white/[0.04] p-8">
        <p className="font-mono text-sm uppercase text-mint">Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Entrar no painel</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          A autenticação com Supabase está preparada para ser conectada quando as variáveis de ambiente forem configuradas.
        </p>
        {errorMessage ? (
          <p className="mt-5 border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
            {errorMessage}
          </p>
        ) : null}
        <Link href="/auth/google" className="mt-8 inline-flex w-full items-center justify-center gap-2 border border-white/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mint">
          <LogIn size={16} />
          Entrar com Google
        </Link>
        <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          ou
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form action={signInAction} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Email
            <input name="email" className="mt-2 w-full border border-white/12 bg-ink px-4 py-3 text-white outline-none focus:border-mint" type="email" placeholder="voce@email.com" required />
          </label>
          <label className="block text-sm text-slate-300">
            Senha
            <input name="password" className="mt-2 w-full border border-white/12 bg-ink px-4 py-3 text-white outline-none focus:border-mint" type="password" placeholder="********" required />
          </label>
          <button className="w-full bg-mint px-4 py-3 text-sm font-semibold text-ink" type="submit">
            Entrar
          </button>
        </form>
        <Link className="mt-6 inline-block text-sm text-slate-400 hover:text-white" href="/">
          Voltar para o site
        </Link>
      </section>
    </main>
  );
}
