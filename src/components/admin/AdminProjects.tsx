"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit3, LogOut, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  "SSO",
  "Wazuh",
  "TheHive",
  "OWASP Top 10",
  "RedTeam",
  "SOC"
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
  const [stackValue, setStackValue] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const featuredCount = useMemo(() => projects.filter((project) => project.featured).length, [projects]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setSelectedProject(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }

      galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [coverPreviewUrl, galleryPreviewUrls]);

  function openCreateForm() {
    setSelectedProject(null);
    setStackValue("");
    setCoverPreviewUrl(null);
    setGalleryPreviewUrls([]);
    setIsModalOpen(true);
  }

  function openEditForm(project: Project) {
    setSelectedProject(project);
    setStackValue(project.tech_stack.join(", "));
    setCoverPreviewUrl(null);
    setGalleryPreviewUrls([]);
    setIsModalOpen(true);
  }

  function closeForm() {
    setIsModalOpen(false);
    setSelectedProject(null);
    setCoverPreviewUrl(null);
    setGalleryPreviewUrls([]);
  }

  function toggleStack(tech: string) {
    const currentStacks = stackValue.split(",").map((item) => item.trim()).filter(Boolean);
    const alreadySelected = currentStacks.some((item) => item.toLowerCase() === tech.toLowerCase());
    const nextStacks = alreadySelected
      ? currentStacks.filter((item) => item.toLowerCase() !== tech.toLowerCase())
      : [...currentStacks, tech];

    setStackValue(nextStacks.join(", "));
  }

  function handleCoverPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setCoverPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleGalleryPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setGalleryPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-6 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
              <ArrowLeft size={16} />
              Site público
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Painel de projetos</h1>
            <p className="mt-2 text-sm text-slate-400">{projects.length} projetos cadastrados, {featuredCount} em destaque.</p>
            {status ? (
              <p className={`mt-4 inline-flex border px-3 py-2 text-sm ${status === "error" ? "border-coral/40 bg-coral/10 text-coral" : "border-mint/40 bg-mint/10 text-mint"}`}>
                {status === "deleted" ? "Projeto excluído." : null}
                {status === "updated" ? "Projeto atualizado." : null}
                {status === "error" ? "Não foi possível concluir a ação. Confira sua sessão e tente novamente." : null}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={openCreateForm} className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-mint px-4 text-sm font-semibold text-ink transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
              <Plus size={16} />
              Novo projeto
            </button>
            <form action={signOutAction}>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-white/12 px-4 text-sm text-white transition-colors hover:border-white/30" type="submit">
                <LogOut size={16} />
                Sair
              </button>
            </form>
          </div>
        </div>

        <section className="mt-8">
          <div className="overflow-hidden border border-white/10">
            <div className="hidden grid-cols-[1fr_6rem_6rem] border-b border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[0.62rem] uppercase text-slate-400 md:grid">
              <span>Projeto</span>
              <span>Destaque</span>
              <span>Ações</span>
            </div>
            {projects.map((project) => (
              <div key={project.id} className="grid items-center gap-4 border-b border-white/10 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_6rem_6rem] md:gap-3">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-white/6">
                    <Image src={project.cover_image_url || "/project-forge.svg"} alt={`Capa de ${project.title}`} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-white">{project.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="border border-white/10 px-2 py-0.5 text-[0.65rem] text-slate-400">
                        {project.cover_display === "fullscreen" ? "Fullscreen" : "Miniatura"}
                      </span>
                      {project.tech_stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="inline-flex items-center gap-1.5 border border-white/10 px-2 py-0.5 text-[0.65rem] text-slate-300">
                          <StackLogo label={tech} className="h-3 w-3" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <form action={toggleFeaturedAction} className="flex items-center justify-between md:block">
                  <input name="id" type="hidden" value={project.id} />
                  <input name="featured" type="hidden" value={String(project.featured)} />
                  <span className="font-mono text-[0.62rem] uppercase text-steel md:hidden">Destaque</span>
                  <button title="Alternar destaque" className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/12 text-slate-300 transition hover:border-mint hover:text-mint" type="submit" aria-label="Alternar destaque">
                    <Star size={16} fill={project.featured ? "currentColor" : "none"} />
                  </button>
                </form>
                <div className="flex justify-end gap-2 border-t border-white/10 pt-3 md:border-t-0 md:pt-0">
                  <button title="Editar projeto" onClick={() => openEditForm(project)} className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/12 text-slate-300 transition hover:border-mint hover:text-mint" type="button" aria-label="Editar projeto">
                    <Edit3 size={16} />
                  </button>
                  <form action={deleteProjectAction} onSubmit={(event) => {
                    if (!window.confirm(`Excluir "${project.title}"?`)) {
                      event.preventDefault();
                    }
                  }}>
                    <input name="id" type="hidden" value={project.id} />
                    <button title="Excluir projeto" className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/12 text-slate-300 transition hover:border-coral hover:text-coral" type="submit" aria-label="Excluir projeto">
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
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-4 md:py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" className="w-full max-w-5xl rounded-sm border border-white/12 bg-ink shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-ink/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="font-mono text-[0.62rem] uppercase text-mint">Editor de produto</p>
                <h2 id="project-dialog-title" className="mt-1 text-xl font-semibold text-white">{selectedProject ? "Editar projeto" : "Novo projeto"}</h2>
              </div>
              <button title="Fechar" onClick={closeForm} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/12 text-slate-300 transition hover:border-coral hover:text-coral" type="button" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <form key={selectedProject?.id ?? "new"} action={saveProjectAction} className="space-y-6 p-4 sm:p-5">
              <input name="id" type="hidden" value={selectedProject?.id ?? ""} readOnly />
              <input name="current_cover_image_url" type="hidden" value={selectedProject?.cover_image_url ?? ""} readOnly />
              <input name="gallery_image_urls" type="hidden" value={getGalleryFormValue(selectedProject)} readOnly />

              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="font-mono text-[0.62rem] text-steel">01</span>
                <p className="text-sm font-medium text-white">Informações principais</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-400">Título
                  <input name="title" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Nome do projeto" defaultValue={selectedProject?.title ?? ""} required />
                </label>
                <label className="text-xs text-slate-400">Endereço da página
                  <input name="slug" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="nome-do-projeto" defaultValue={selectedProject?.slug ?? ""} />
                </label>
              </div>

              <label className="block text-xs text-slate-400">Descrição curta
                <textarea name="description" className="mt-2 min-h-24 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Resumo usado no card e no topo da página" defaultValue={selectedProject?.description ?? ""} required />
              </label>

              <div className="space-y-3">
                <label className="block text-xs text-slate-400">Tecnologias
                  <input name="tech_stack" value={stackValue} onChange={(event) => setStackValue(event.target.value)} className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Escolha abaixo ou digite separando por vírgulas" />
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonStacks.map((tech) => {
                    const isSelected = stackValue.split(",").some((item) => item.trim().toLowerCase() === tech.toLowerCase());

                    return (
                    <button key={tech} type="button" aria-pressed={isSelected} onClick={() => toggleStack(tech)} className={`inline-flex h-8 items-center gap-2 rounded-sm border px-3 text-xs transition-colors ${isSelected ? "border-mint/50 bg-mint/10 text-mint" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"}`}>
                      <StackLogo label={tech} className="h-4 w-4" />
                      {tech}
                    </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/10 pb-3 pt-2">
                <span className="font-mono text-[0.62rem] text-steel">02</span>
                <p className="text-sm font-medium text-white">Produto e publicação</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input aria-label="URL do projeto" name="project_url" className="w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL do projeto" defaultValue={selectedProject?.project_url ?? ""} />
                <input aria-label="URL do repositório" name="repo_url" className="w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL do repositório" defaultValue={selectedProject?.repo_url ?? ""} />
                <input aria-label="URL do vídeo" name="video_url" className="w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="URL de vídeo ou demo" defaultValue={selectedProject?.video_url ?? ""} />
                <input aria-label="Papel no produto" name="product_role" className="w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Seu papel no produto" defaultValue={selectedProject?.product_role ?? ""} />
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
                <textarea aria-label="Visão do produto" name="product_overview" className="min-h-28 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Contexto e problema resolvido" defaultValue={selectedProject?.product_overview ?? ""} />
                <input aria-label="Ordem" name="order" className="w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Ordem" type="number" defaultValue={selectedProject?.order ?? projects.length + 1} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <textarea aria-label="Features" name="product_features" className="min-h-28 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Features, uma por linha" defaultValue={selectedProject?.product_features.join("\n") ?? ""} />
                <textarea aria-label="Resultados" name="product_results" className="min-h-28 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Resultados e impactos, um por linha" defaultValue={selectedProject?.product_results.join("\n") ?? ""} />
              </div>

              <div className="flex items-center gap-3 border-b border-white/10 pb-3 pt-2">
                <span className="font-mono text-[0.62rem] text-steel">03</span>
                <p className="text-sm font-medium text-white">Imagens do produto</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-500">Capa do card</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-white/12 px-3 py-3 text-sm text-slate-300 transition hover:border-mint/50">
                      <input name="cover_display" className="h-4 w-4 accent-mint" type="radio" value="thumbnail" defaultChecked={selectedProject?.cover_display !== "fullscreen"} />
                      Miniatura
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-white/12 px-3 py-3 text-sm text-slate-300 transition hover:border-mint/50">
                      <input name="cover_display" className="h-4 w-4 accent-mint" type="radio" value="fullscreen" defaultChecked={selectedProject?.cover_display === "fullscreen"} />
                      Fullscreen
                    </label>
                  </div>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-white/18 px-4 py-5 text-sm text-slate-300 transition hover:border-mint/50 hover:text-white">
                    <Upload size={16} />
                    {selectedProject ? "Trocar capa" : "Upload de capa"}
                    <input name="cover" className="sr-only" type="file" accept="image/*" onChange={handleCoverPreview} />
                  </label>
                  {coverPreviewUrl || selectedProject?.cover_image_url ? (
                    <div className="overflow-hidden rounded-sm border border-white/10 bg-black/25">
                      <img src={coverPreviewUrl ?? selectedProject?.cover_image_url} alt="Prévia da capa" className="aspect-[16/9] w-full object-cover" />
                      <span className="block border-t border-white/10 px-3 py-2 font-mono text-[0.6rem] uppercase text-steel">Prévia da capa</span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-500">Galeria do produto</p>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-white/18 px-4 py-5 text-center text-sm text-slate-300 transition hover:border-mint/50 hover:text-white">
                    <Upload size={16} />
                    Enviar imagens da galeria
                    <input name="gallery_images" className="sr-only" type="file" accept="image/*" multiple onChange={handleGalleryPreview} />
                  </label>
                  <textarea
                    name="gallery_image_sizes"
                    aria-label="Tamanhos das imagens"
                    className="min-h-20 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint"
                    placeholder={"Tamanho por imagem enviada\npequeno, medio, grande ou total"}
                  />
                </div>
              </div>

              {galleryPreviewUrls.length ? (
                <div>
                  <p className="mb-3 font-mono text-[0.62rem] uppercase text-mint">Novas imagens</p>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {galleryPreviewUrls.map((imageUrl, index) => (
                      <div key={imageUrl} className="overflow-hidden rounded-sm border border-mint/20 bg-black/25">
                        <img src={imageUrl} alt={`Prévia da imagem ${index + 1}`} className="aspect-[16/10] w-full object-cover" />
                        <span className="block border-t border-white/10 px-3 py-2 text-xs text-slate-400">Imagem {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedProject?.gallery_image_urls.length ? (
                <div>
                  <p className="mb-3 text-xs uppercase text-slate-500">Galeria atual</p>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {selectedProject.gallery_image_urls.map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-sm border border-white/10 bg-black/25">
                        <img src={imageUrl} alt={`Imagem atual ${index + 1}`} className="aspect-[16/10] w-full object-cover" />
                        <span className="block border-t border-white/10 px-3 py-2 text-xs text-slate-400">{selectedProject.gallery_image_sizes[index] ?? "medium"}</span>
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
                  <button onClick={closeForm} type="button" className="h-11 rounded-sm border border-white/12 px-4 text-sm text-slate-300 transition hover:border-white/30 hover:text-white">
                    Cancelar
                  </button>
                  <button type="submit" className="h-11 rounded-sm bg-white px-5 text-sm font-semibold text-ink transition-colors hover:bg-mint">
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
