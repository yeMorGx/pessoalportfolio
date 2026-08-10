"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit3, LogOut, Plus, Star, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteProjectAction, saveProjectAction, signOutAction, toggleFeaturedAction } from "@/app/admin/actions";
import type { Project } from "@/lib/projects";

export function AdminProjects({
  initialProjects,
  status
}: {
  initialProjects: Project[];
  status?: "deleted" | "updated" | "error";
}) {
  const [projects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const featuredCount = useMemo(() => projects.filter((project) => project.featured).length, [projects]);

  function clearForm() {
    setSelectedProject(null);
  }

  return (
    <main className="min-h-screen bg-ink px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
              <ArrowLeft size={16} />
              Site público
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-white">Painel de projetos</h1>
            <p className="mt-2 text-sm text-slate-400">{projects.length} projetos cadastrados, {featuredCount} em destaque.</p>
            {status ? (
              <p className={`mt-4 inline-flex border px-3 py-2 text-sm ${status === "error" ? "border-coral/40 bg-coral/10 text-coral" : "border-mint/40 bg-mint/10 text-mint"}`}>
                {status === "deleted" ? "Projeto excluido." : null}
                {status === "updated" ? "Projeto atualizado." : null}
                {status === "error" ? "Nao foi possivel concluir a acao. Confira sua sessao e tente novamente." : null}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={clearForm} className="inline-flex items-center justify-center gap-2 bg-mint px-4 py-3 text-sm font-semibold text-ink">
              <Plus size={16} />
              Novo projeto
            </button>
            <form action={signOutAction}>
              <button className="inline-flex items-center justify-center gap-2 border border-white/12 px-4 py-3 text-sm text-white" type="submit">
                <LogOut size={16} />
                Sair
              </button>
            </form>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden border border-white/10">
            <div className="grid grid-cols-[1fr_7rem_7rem] border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase text-slate-400">
              <span>Projeto</span>
              <span>Destaque</span>
              <span>Ações</span>
            </div>
            {projects.map((project) => (
              <div key={project.id} className="grid grid-cols-[1fr_7rem_7rem] items-center gap-3 border-b border-white/8 px-4 py-4 last:border-b-0">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-white/6">
                    <Image src={project.cover_image_url || "/project-forge.svg"} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-white">{project.title}</h2>
                    <p className="truncate text-sm text-slate-400">{Array.isArray(project.tech_stack) ? project.tech_stack.join(", ") : ""}</p>
                  </div>
                </div>
                <form action={toggleFeaturedAction}>
                  <input name="id" type="hidden" value={project.id} />
                  <input name="featured" type="hidden" value={String(project.featured)} />
                  <button className="inline-flex h-10 w-10 items-center justify-center border border-white/12 text-slate-300 transition hover:border-mint hover:text-mint" type="submit" aria-label="Alternar destaque">
                    <Star size={16} fill={project.featured ? "currentColor" : "none"} />
                  </button>
                </form>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedProject(project)} className="inline-flex h-10 w-10 items-center justify-center border border-white/12 text-slate-300 transition hover:border-mint hover:text-mint" type="button" aria-label="Editar projeto">
                    <Edit3 size={16} />
                  </button>
                  <form action={deleteProjectAction} onSubmit={(event) => {
                    if (!window.confirm(`Excluir "${project.title}"?`)) {
                      event.preventDefault();
                    }
                  }}>
                    <input name="id" type="hidden" value={project.id} />
                    <button className="inline-flex h-10 w-10 items-center justify-center border border-white/12 text-slate-300 transition hover:border-coral hover:text-coral" type="submit" aria-label="Excluir projeto">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <aside className="border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold text-white">{selectedProject ? "Editar projeto" : "Novo projeto"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Salva no Supabase, atualiza a home e permite trocar a imagem de capa pelo Storage.</p>
            <form action={saveProjectAction} className="mt-6 space-y-4">
              <input name="id" type="hidden" value={selectedProject?.id ?? ""} />
              <input name="current_cover_image_url" type="hidden" value={selectedProject?.cover_image_url ?? ""} />
              <input name="title" className="w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Título" defaultValue={selectedProject?.title ?? ""} required />
              <input name="slug" className="w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="slug-opcional" defaultValue={selectedProject?.slug ?? ""} />
              <textarea name="description" className="min-h-28 w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Descrição" defaultValue={selectedProject?.description ?? ""} required />
              <input name="tech_stack" className="w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Stack separada por vírgulas" defaultValue={Array.isArray(selectedProject?.tech_stack) ? selectedProject.tech_stack.join(", ") : ""} />
              <input name="project_url" className="w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL do projeto" defaultValue={selectedProject?.project_url ?? ""} />
              <input name="repo_url" className="w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL do repositório" defaultValue={selectedProject?.repo_url ?? ""} />
              <input name="order" className="w-full border border-white/12 bg-ink px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Ordem" type="number" defaultValue={selectedProject?.order ?? projects.length + 1} />
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input name="featured" className="h-4 w-4 accent-mint" type="checkbox" defaultChecked={selectedProject?.featured ?? false} />
                Mostrar em destaque
              </label>
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-white/18 px-4 py-5 text-sm text-slate-300 transition hover:border-mint/50 hover:text-white">
                <Upload size={16} />
                {selectedProject ? "Trocar capa" : "Upload de capa"}
                <input name="cover" className="sr-only" type="file" accept="image/*" />
              </label>
              <button type="submit" className="w-full bg-white px-4 py-3 text-sm font-semibold text-ink">
                Salvar projeto
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
