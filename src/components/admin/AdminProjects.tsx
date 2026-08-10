"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit3, LogOut, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteProjectAction, saveProjectAction, signOutAction, toggleFeaturedAction } from "@/app/admin/actions";
import { StackLogo } from "@/components/ui/StackLogo";
import type { Project } from "@/lib/projects";

const commonStacks = [
  "JavaScript",
  "TypeScript",
  "Next.js",
  "React",
  "HTML5",
  "CSS",
  "Python",
  "MySQL",
  "PHP",
  "Composer",
  "Laravel",
  "Rust",
  "PostgreSQL",
  "Supabase",
  "API",
  "SSO"
];

function getGalleryFormValue(project: Project | null) {
  if (!project) {
    return "";
  }

  return project.gallery_image_urls
    .map((url, index) => `${url} | ${project.gallery_image_sizes[index] ?? "medium"}`)
    .join("\n");
}

export function AdminProjects({
  initialProjects,
  status
}: {
  initialProjects: Project[];
  status?: "deleted" | "updated" | "error";
}) {
  const [projects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const featuredCount = useMemo(() => projects.filter((project) => project.featured).length, [projects]);

  function openCreateForm() {
    setSelectedProject(null);
    setIsModalOpen(true);
  }

  function openEditForm(project: Project) {
    setSelectedProject(project);
    setIsModalOpen(true);
  }

  function closeForm() {
    setIsModalOpen(false);
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
            <button onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 bg-mint px-4 py-3 text-sm font-semibold text-ink">
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

        <section className="mt-8">
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
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                        {project.cover_display === "fullscreen" ? "Fullscreen" : "Miniatura"}
                      </span>
                      {project.tech_stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">
                          <StackLogo label={tech} className="h-3 w-3" />
                          {tech}
                        </span>
                      ))}
                    </div>
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
                  <button onClick={() => openEditForm(project)} className="inline-flex h-10 w-10 items-center justify-center border border-white/12 text-slate-300 transition hover:border-mint hover:text-mint" type="button" aria-label="Editar projeto">
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
            {!projects.length ? (
              <div className="px-4 py-10 text-sm text-slate-400">Nenhum projeto cadastrado ainda.</div>
            ) : null}
          </div>
        </section>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm md:py-10">
          <div className="w-full max-w-4xl border border-white/12 bg-ink shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-ink/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedProject ? "Editar projeto" : "Novo projeto"}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">Salva no Supabase e atualiza a vitrine do site.</p>
              </div>
              <button onClick={closeForm} className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/12 text-slate-300 transition hover:border-coral hover:text-coral" type="button" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <form key={selectedProject?.id ?? "new"} action={saveProjectAction} className="space-y-5 p-5">
              <input name="id" type="hidden" value={selectedProject?.id ?? ""} readOnly />
              <input name="current_cover_image_url" type="hidden" value={selectedProject?.cover_image_url ?? ""} readOnly />
              <input name="gallery_image_urls" type="hidden" value={getGalleryFormValue(selectedProject)} readOnly />

              <div className="grid gap-4 md:grid-cols-2">
                <input name="title" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Título" defaultValue={selectedProject?.title ?? ""} required />
                <input name="slug" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="slug-opcional" defaultValue={selectedProject?.slug ?? ""} />
              </div>

              <textarea name="description" className="min-h-24 w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Descrição curta para cards e topo da página" defaultValue={selectedProject?.description ?? ""} required />

              <div className="space-y-3">
                <input name="tech_stack" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Stack separada por vírgulas" defaultValue={Array.isArray(selectedProject?.tech_stack) ? selectedProject.tech_stack.join(", ") : ""} />
                <div className="flex flex-wrap gap-2">
                  {commonStacks.map((tech) => (
                    <span key={tech} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
                      <StackLogo label={tech} className="h-4 w-4" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input name="project_url" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL do projeto" defaultValue={selectedProject?.project_url ?? ""} />
                <input name="repo_url" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL do repositório" defaultValue={selectedProject?.repo_url ?? ""} />
                <input name="video_url" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL de vídeo/demo" defaultValue={selectedProject?.video_url ?? ""} />
                <input name="product_role" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Seu papel no produto" defaultValue={selectedProject?.product_role ?? ""} />
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
                <textarea name="product_overview" className="min-h-28 w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Visão do produto / contexto / problema resolvido" defaultValue={selectedProject?.product_overview ?? ""} />
                <input name="order" className="w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Ordem" type="number" defaultValue={selectedProject?.order ?? projects.length + 1} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <textarea name="product_features" className="min-h-28 w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Features, uma por linha" defaultValue={selectedProject?.product_features.join("\n") ?? ""} />
                <textarea name="product_results" className="min-h-28 w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Resultados/impactos, um por linha" defaultValue={selectedProject?.product_results.join("\n") ?? ""} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-500">Capa do card</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 border border-white/12 px-3 py-3 text-sm text-slate-300 transition hover:border-mint/50">
                      <input name="cover_display" className="h-4 w-4 accent-mint" type="radio" value="thumbnail" defaultChecked={selectedProject?.cover_display !== "fullscreen"} />
                      Miniatura
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 border border-white/12 px-3 py-3 text-sm text-slate-300 transition hover:border-mint/50">
                      <input name="cover_display" className="h-4 w-4 accent-mint" type="radio" value="fullscreen" defaultChecked={selectedProject?.cover_display === "fullscreen"} />
                      Fullscreen
                    </label>
                  </div>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-white/18 px-4 py-5 text-sm text-slate-300 transition hover:border-mint/50 hover:text-white">
                    <Upload size={16} />
                    {selectedProject ? "Trocar capa" : "Upload de capa"}
                    <input name="cover" className="sr-only" type="file" accept="image/*" />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-500">Galeria do produto</p>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-white/18 px-4 py-5 text-sm text-slate-300 transition hover:border-mint/50 hover:text-white">
                    <Upload size={16} />
                    Enviar imagens da galeria
                    <input name="gallery_images" className="sr-only" type="file" accept="image/*" multiple />
                  </label>
                  <textarea
                    name="gallery_image_sizes"
                    className="min-h-20 w-full border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint"
                    placeholder={"Tamanho por imagem enviada\npequeno, medio, grande ou total"}
                  />
                </div>
              </div>

              {selectedProject?.gallery_image_urls.length ? (
                <div>
                  <p className="mb-3 text-xs uppercase text-slate-500">Galeria atual</p>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {selectedProject.gallery_image_urls.map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="overflow-hidden border border-white/10 bg-black/25">
                        <img src={imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
                        <span className="block px-3 py-2 text-xs text-slate-400">{selectedProject.gallery_image_sizes[index] ?? "medium"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input name="featured" className="h-4 w-4 accent-mint" type="checkbox" defaultChecked={selectedProject?.featured ?? false} />
                  Mostrar em destaque
                </label>
                <div className="flex gap-3">
                  <button onClick={closeForm} type="button" className="border border-white/12 px-4 py-3 text-sm text-slate-300 transition hover:border-white/30 hover:text-white">
                    Cancelar
                  </button>
                  <button type="submit" className="bg-white px-5 py-3 text-sm font-semibold text-ink">
                    Salvar projeto
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
