import Link from "next/link";
import { signInAction } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-md border border-white/12 bg-white/[0.04] p-8">
        <p className="font-mono text-sm uppercase text-mint">Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Entrar no painel</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          A autenticação com Supabase está preparada para ser conectada quando as variáveis de ambiente forem configuradas.
        </p>
        {params?.error ? <p className="mt-5 border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">Email ou senha inválidos.</p> : null}
        <form action={signInAction} className="mt-8 space-y-4">
          <label className="block text-sm text-slate-300">
            Email
            <input className="mt-2 w-full border border-white/12 bg-ink px-4 py-3 text-white outline-none focus:border-mint" type="email" placeholder="voce@email.com" />
          </label>
          <label className="block text-sm text-slate-300">
            Senha
            <input className="mt-2 w-full border border-white/12 bg-ink px-4 py-3 text-white outline-none focus:border-mint" type="password" placeholder="********" />
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
