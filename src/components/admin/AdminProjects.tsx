"use client";

import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Edit3, Eye, FileText, ImageIcon, Link2, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createProjectUploadTargetAction, deleteProjectAction, discardProjectUploadsAction, saveProjectAction, toggleFeaturedAction } from "@/app/admin/actions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProjectLogo } from "@/components/ui/ProjectLogo";
import { StackLogo } from "@/components/ui/StackLogo";
import type { Project } from "@/lib/projects";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const PROJECT_ASSET_BUCKET = "project-covers";
const MAX_PROJECT_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_PROJECT_LOGO_BYTES = 2 * 1024 * 1024;
const PROJECT_LOGO_TYPES = new Set(["image/png", "image/webp"]);

const stackGroups = [
  {
    label: "Frontend",
    technologies: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "Tailwind CSS", "Sass", "HTML5", "CSS"]
  },
  {
    label: "Backend",
    technologies: ["Node.js", "Express", "NestJS", "Python", "Django", "FastAPI", "PHP", "Laravel", "Composer", "Java", "Spring Boot", "C#", ".NET", "Go", "Rust", "Ruby", "Ruby on Rails", "Perl"]
  },
  {
    label: "Mobile",
    technologies: ["React Native", "Flutter", "Dart", "Kotlin", "Swift"]
  },
  {
    label: "Dados",
    technologies: ["PostgreSQL", "MySQL", "MariaDB", "MongoDB", "Redis", "SQLite", "Prisma", "Supabase", "Firebase"]
  },
  {
    label: "Plataforma e APIs",
    technologies: ["API", "REST", "GraphQL", "SSO", "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Vercel", "GitHub Actions"]
  },
  {
    label: "IA e automação",
    technologies: ["OpenAI", "Codex", "Claude", "Gemini", "n8n", "LangChain", "Hugging Face", "Ollama", "MCP"]
  },
  {
    label: "Segurança",
    technologies: ["Wazuh", "TheHive", "OWASP Top 10", "Kali Linux", "RedTeam", "SOC"]
  }
] as const;

const editorSteps = [
  { label: "Essencial", detail: "Nome, resumo e tecnologias", icon: FileText },
  { label: "Produto", detail: "Contexto, links e resultados", icon: Link2 },
  { label: "Mídia", detail: "Capa, galeria e descrições", icon: ImageIcon },
  { label: "Revisão", detail: "Confira antes de salvar", icon: Eye }
] as const;

type ProjectDraftPreview = {
  title: string;
  slug: string;
  description: string;
  role: string;
  overview: string;
  stacks: string[];
  features: string[];
  results: string[];
  coverDisplay: "thumbnail" | "fullscreen";
  featured: boolean;
  order: string;
  projectUrl: string;
  repoUrl: string;
  videoUrl: string;
};

function getGalleryFormValue(project: Project | null) {
  if (!project) {
    return "";
  }

  return project.gallery_image_urls
    .map((url, index) => `${url} | ${project.gallery_image_sizes[index] ?? "medium"}`)
    .join("\n");
}

function getImageValidationError(file: File) {
  if (!file.type.startsWith("image/")) {
    return `${file.name} não é uma imagem válida.`;
  }

  if (file.size > MAX_PROJECT_IMAGE_BYTES) {
    return `${file.name} ultrapassa o limite de 20 MB.`;
  }

  return null;
}

async function getLogoValidationError(file: File) {
  if (!PROJECT_LOGO_TYPES.has(file.type)) {
    return `${file.name} deve estar em PNG ou WebP.`;
  }

  if (file.size > MAX_PROJECT_LOGO_BYTES) {
    return `${file.name} ultrapassa o limite de 2 MB.`;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();

    if (width !== height || width < 128 || width > 2048) {
      return "O logo deve ser quadrado, entre 128 x 128 e 2048 x 2048 px.";
    }
  } catch {
    return `${file.name} não pôde ser lido como imagem.`;
  }

  return null;
}

export function AdminProjects({
  initialProjects,
  unreadMessageCount,
  status
}: {
  initialProjects: Project[];
  unreadMessageCount?: number;
  status?: "created" | "deleted" | "updated" | "error";
}) {
  const [projects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stackValue, setStackValue] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [draftPreview, setDraftPreview] = useState<ProjectDraftPreview | null>(null);
  const [projectQuery, setProjectQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<"all" | "featured">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const featuredCount = useMemo(() => projects.filter((project) => project.featured).length, [projects]);
  const galleryImageCount = useMemo(() => projects.reduce((total, project) => total + project.gallery_image_urls.length, 0), [projects]);
  const visibleProjects = useMemo(() => {
    const normalizedQuery = projectQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter = projectFilter === "all" || project.featured;
      const matchesQuery = !normalizedQuery || [project.title, project.slug, ...project.tech_stack]
        .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesQuery;
    });
  }, [projectFilter, projectQuery, projects]);
  const previewCoverUrl = coverPreviewUrl ?? selectedProject?.cover_image_url ?? "/project-forge.svg";
  const previewLogoUrl = logoPreviewUrl ?? (logoRemoved ? null : selectedProject?.logo_image_url ?? null);
  const previewGalleryUrls = galleryPreviewUrls.length ? galleryPreviewUrls : selectedProject?.gallery_image_urls ?? [];

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
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
  }, [isModalOpen, isSaving]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  useEffect(() => {
    return () => {
      galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviewUrls]);

  function openCreateForm() {
    setSelectedProject(null);
    setStackValue("");
    setLogoPreviewUrl(null);
    setLogoRemoved(false);
    setCoverPreviewUrl(null);
    setGalleryPreviewUrls([]);
    setCurrentStep(0);
    setHighestStep(0);
    setDraftPreview(null);
    setSaveError(null);
    setSaveProgress("");
    setIsModalOpen(true);
  }

  function openEditForm(project: Project) {
    setSelectedProject(project);
    setStackValue(project.tech_stack.join(", "));
    setLogoPreviewUrl(null);
    setLogoRemoved(false);
    setCoverPreviewUrl(null);
    setGalleryPreviewUrls([]);
    setCurrentStep(0);
    setHighestStep(0);
    setDraftPreview(null);
    setSaveError(null);
    setSaveProgress("");
    setIsModalOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setSelectedProject(null);
    setLogoPreviewUrl(null);
    setLogoRemoved(false);
    setCoverPreviewUrl(null);
    setGalleryPreviewUrls([]);
    setCurrentStep(0);
    setHighestStep(0);
    setDraftPreview(null);
    setSaveError(null);
    setSaveProgress("");
  }

  function readDraftPreview() {
    const form = formRef.current;

    if (!form) {
      return null;
    }

    const formData = new FormData(form);
    const getText = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value.trim() : "";
    };
    const getList = (name: string) => getText(name)
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title: getText("title") || "Projeto sem título",
      slug: getText("slug"),
      description: getText("description") || "Adicione um resumo para apresentar o projeto.",
      role: getText("product_role") || "Produto digital",
      overview: getText("product_overview"),
      stacks: stackValue.split(",").map((item) => item.trim()).filter(Boolean),
      features: getList("product_features"),
      results: getList("product_results"),
      coverDisplay: getText("cover_display") === "fullscreen" ? "fullscreen" : "thumbnail",
      featured: formData.get("featured") === "on",
      order: getText("order") || "0",
      projectUrl: getText("project_url"),
      repoUrl: getText("repo_url"),
      videoUrl: getText("video_url")
    } satisfies ProjectDraftPreview;
  }

  function goToStep(step: number) {
    const nextStep = Math.min(Math.max(step, 0), editorSteps.length - 1);

    if (nextStep === editorSteps.length - 1) {
      setDraftPreview(readDraftPreview());
    }

    setHighestStep((current) => Math.max(current, nextStep));
    setCurrentStep(nextStep);
    modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueEditor() {
    const panel = formRef.current?.querySelector<HTMLElement>(`[data-editor-step="${currentStep}"]`);
    const controls = panel
      ? Array.from(panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"))
      : [];
    const invalidControl = controls.find((control) => !control.disabled && !control.checkValidity());

    if (invalidControl) {
      invalidControl.reportValidity();
      invalidControl.focus();
      return;
    }

    goToStep(currentStep + 1);
  }

  function toggleStack(tech: string) {
    const currentStacks = stackValue.split(",").map((item) => item.trim()).filter(Boolean);
    const alreadySelected = currentStacks.some((item) => item.toLowerCase() === tech.toLowerCase());
    const nextStacks = alreadySelected
      ? currentStacks.filter((item) => item.toLowerCase() !== tech.toLowerCase())
      : [...currentStacks, tech];

    setStackValue(nextStacks.join(", "));
  }

  async function handleLogoPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    const validationError = file ? await getLogoValidationError(file) : null;

    if (validationError) {
      input.value = "";
      setLogoPreviewUrl(null);
      setSaveError(validationError);
      return;
    }

    setSaveError(null);
    setLogoRemoved(false);
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function removeLogo() {
    setLogoPreviewUrl(null);
    setLogoRemoved(true);
    setSaveError(null);
  }

  function handleCoverPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const validationError = file ? getImageValidationError(file) : null;

    if (validationError) {
      event.target.value = "";
      setCoverPreviewUrl(null);
      setSaveError(validationError);
      return;
    }

    setSaveError(null);
    setCoverPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleGalleryPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validationError = files.map(getImageValidationError).find(Boolean);

    if (validationError) {
      event.target.value = "";
      setGalleryPreviewUrls([]);
      setSaveError(validationError);
      return;
    }

    setSaveError(null);
    setGalleryPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  }

  async function handleProjectSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentStep !== editorSteps.length - 1) {
      continueEditor();
      return;
    }

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const logo = formData.get("logo");
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    const cover = formData.get("cover");
    const coverFile = cover instanceof File && cover.size > 0 ? cover : null;
    const galleryFiles = formData.getAll("gallery_images")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const files = [logoFile, coverFile, ...galleryFiles].filter((file): file is File => Boolean(file));
    const validationError = files.map(getImageValidationError).find(Boolean);
    const logoValidationError = logoFile ? await getLogoValidationError(logoFile) : null;

    if (logoValidationError || validationError) {
      setSaveError(logoValidationError ?? validationError ?? "Arquivo inválido.");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setSaveError("Supabase não está configurado neste ambiente.");
      return;
    }

    const uploadedPaths: string[] = [];

    setIsSaving(true);
    setSaveError(null);

    try {
      formData.delete("logo");
      formData.delete("cover");
      formData.delete("gallery_images");

      if (files.length) {
        setSaveProgress(`Enviando imagens 0 / ${files.length}`);
      } else {
        setSaveProgress("Salvando projeto...");
      }

      const uploadImage = async (file: File, kind: "cover" | "gallery" | "logo") => {
        const target = await createProjectUploadTargetAction({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          kind
        });

        if (!target.ok) {
          throw new Error(target.message);
        }

        const { error } = await supabase.storage
          .from(PROJECT_ASSET_BUCKET)
          .uploadToSignedUrl(target.path, target.token, file, {
            cacheControl: "31536000",
            contentType: file.type
          });

        if (error) {
          throw new Error(`Falha ao enviar ${file.name}: ${error.message}`);
        }

        uploadedPaths.push(target.path);
        setSaveProgress(`Enviando imagens ${uploadedPaths.length} / ${files.length}`);

        return supabase.storage.from(PROJECT_ASSET_BUCKET).getPublicUrl(target.path).data.publicUrl;
      };

      if (logoFile) {
        formData.set("logo_image_url", await uploadImage(logoFile, "logo"));
      }

      if (coverFile) {
        formData.set("cover_image_url", await uploadImage(coverFile, "cover"));
      }

      if (galleryFiles.length) {
        const galleryUrls: string[] = [];

        for (const file of galleryFiles) {
          galleryUrls.push(await uploadImage(file, "gallery"));
        }

        formData.set("gallery_image_urls", galleryUrls.join("\n"));
      }

      setSaveProgress("Salvando projeto...");
      const result = await saveProjectAction(formData);

      if (!result.ok) {
        throw new Error(result.message);
      }

      window.location.assign(selectedProject ? "/admin?updated=1" : "/admin?created=1");
    } catch (error) {
      if (uploadedPaths.length) {
        try {
          await discardProjectUploadsAction(uploadedPaths);
        } catch {
          // The original save error is more useful than a cleanup failure.
        }
      }

      setSaveError(error instanceof Error ? error.message : "Não foi possível salvar o projeto.");
      setSaveProgress("");
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto grid min-h-screen max-w-[96rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <AdminSidebar active="projects" projectCount={projects.length} unreadMessageCount={unreadMessageCount} />

        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[0.58rem] uppercase text-mint">Portfólio / Conteúdo</p>
              <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Projetos</h1>
              <p className="mt-2 text-sm text-slate-500">Organize os estudos de caso publicados no site.</p>
            </div>
            <button onClick={openCreateForm} className="inline-flex h-11 items-center justify-center gap-2 bg-mint px-4 text-sm font-semibold text-ink transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
              <Plus size={16} />
              Novo projeto
            </button>
          </header>

          {status ? (
            <p className={`mt-5 inline-flex border px-3 py-2 text-sm ${status === "error" ? "border-coral/40 bg-coral/10 text-coral" : "border-mint/40 bg-mint/10 text-mint"}`}>
              {status === "created" ? "Projeto criado." : null}
              {status === "deleted" ? "Projeto excluído." : null}
              {status === "updated" ? "Projeto atualizado." : null}
              {status === "error" ? "Não foi possível concluir a ação. Confira sua sessão e tente novamente." : null}
            </p>
          ) : null}

          <dl className="mt-7 grid grid-cols-3 border-y border-white/10">
            {[
              ["Publicados", projects.length],
              ["Destaques", featuredCount],
              ["Telas na galeria", galleryImageCount]
            ].map(([label, value], index) => (
              <div key={label} className={`py-4 ${index ? "border-l border-white/10 pl-4 sm:pl-6" : "pr-4"}`}>
                <dt className="font-mono text-[0.52rem] uppercase text-slate-500 sm:text-[0.58rem]">{label}</dt>
                <dd className="mt-2 text-2xl font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={projectQuery}
                  onChange={(event) => setProjectQuery(event.target.value)}
                  type="search"
                  aria-label="Buscar projetos"
                  placeholder="Buscar por nome, slug ou tecnologia"
                  className="h-11 w-full border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none transition focus:border-mint/60"
                />
              </div>
              <div className="grid grid-cols-2 border border-white/10" aria-label="Filtrar projetos">
                <button type="button" onClick={() => setProjectFilter("all")} aria-pressed={projectFilter === "all"} className={`h-10 px-4 text-xs transition ${projectFilter === "all" ? "bg-white text-ink" : "text-slate-400 hover:text-white"}`}>Todos</button>
                <button type="button" onClick={() => setProjectFilter("featured")} aria-pressed={projectFilter === "featured"} className={`h-10 border-l border-white/10 px-4 text-xs transition ${projectFilter === "featured" ? "bg-white text-ink" : "text-slate-400 hover:text-white"}`}>Destaques</button>
              </div>
            </div>

            <div className="overflow-hidden border-x border-b border-white/10">
              <div className="hidden grid-cols-[4rem_minmax(0,1fr)_7rem_7rem_7rem] border-b border-white/10 bg-white/[0.025] px-4 py-3 font-mono text-[0.55rem] uppercase text-slate-500 md:grid">
                <span>Ordem</span>
                <span>Projeto</span>
                <span>Mídia</span>
                <span>Status</span>
                <span className="text-right">Ações</span>
              </div>
              {visibleProjects.map((project) => (
                <div key={project.id} className="grid gap-4 border-b border-white/10 px-4 py-4 last:border-b-0 md:grid-cols-[4rem_minmax(0,1fr)_7rem_7rem_7rem] md:items-center md:gap-0">
                  <span className="hidden font-mono text-xs text-slate-500 md:block">{String(project.order).padStart(2, "0")}</span>
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-white/10 bg-white/5">
                      <Image src={project.cover_image_url || "/project-forge.svg"} alt={`Capa de ${project.title}`} fill sizes="96px" className="object-cover" />
                      <ProjectLogo title={project.title} url={project.logo_image_url} className="absolute bottom-1 right-1 z-10 h-7 w-7 bg-ink/90" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-sm font-medium text-white">{project.title}</h2>
                        <span className="font-mono text-[0.52rem] text-slate-600 md:hidden">#{String(project.order).padStart(2, "0")}</span>
                      </div>
                      <p className="mt-1 truncate font-mono text-[0.58rem] text-slate-600">/projetos/{project.slug}</p>
                      <div className="mt-2 flex items-center gap-2 overflow-hidden">
                        {project.tech_stack.slice(0, 3).map((tech) => (
                          <span key={tech} className="inline-flex shrink-0 items-center gap-1.5 text-[0.62rem] text-slate-400">
                            <StackLogo label={tech} className="h-3 w-3" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:block">
                    <span className="font-mono text-[0.55rem] uppercase text-slate-600 md:hidden">Mídia</span>
                    <span className="text-xs text-slate-400">{project.gallery_image_urls.length} {project.gallery_image_urls.length === 1 ? "tela" : "telas"}</span>
                  </div>

                  <form action={toggleFeaturedAction} className="flex items-center justify-between md:block">
                    <input name="id" type="hidden" value={project.id} />
                    <input name="featured" type="hidden" value={String(project.featured)} />
                    <span className="font-mono text-[0.55rem] uppercase text-slate-600 md:hidden">Status</span>
                    <button title="Alternar destaque" className={`inline-flex h-8 items-center gap-2 px-2 text-[0.62rem] transition ${project.featured ? "bg-mint/10 text-mint" : "border border-white/10 text-slate-500 hover:text-white"}`} type="submit" aria-label="Alternar destaque">
                      <Star size={13} fill={project.featured ? "currentColor" : "none"} />
                      {project.featured ? "Destaque" : "Normal"}
                    </button>
                  </form>

                  <div className="flex justify-end gap-2 border-t border-white/10 pt-3 md:border-t-0 md:pt-0">
                    <button title="Editar projeto" onClick={() => openEditForm(project)} className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-slate-400 transition hover:border-mint hover:text-mint" type="button" aria-label="Editar projeto">
                      <Edit3 size={15} />
                    </button>
                    <form action={deleteProjectAction} onSubmit={(event) => {
                      if (!window.confirm(`Excluir "${project.title}"?`)) {
                        event.preventDefault();
                      }
                    }}>
                      <input name="id" type="hidden" value={project.id} />
                      <button title="Excluir projeto" className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-slate-400 transition hover:border-coral hover:text-coral" type="submit" aria-label="Excluir projeto">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {!visibleProjects.length ? (
                <div className="px-4 py-12 text-center text-sm text-slate-500">Nenhum projeto corresponde à busca.</div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-4 md:py-8">
          <div role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" className="flex max-h-[calc(100svh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-white/12 bg-ink shadow-2xl md:max-h-[calc(100svh-4rem)]">
            <div className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-ink/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="font-mono text-[0.62rem] uppercase text-mint">Editor de produto</p>
                <h2 id="project-dialog-title" className="mt-1 text-xl font-semibold text-white">{selectedProject ? "Editar projeto" : "Novo projeto"}</h2>
              </div>
              <button title="Fechar" onClick={closeForm} disabled={isSaving} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/12 text-slate-300 transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-50" type="button" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <nav aria-label="Etapas do editor" className="grid shrink-0 grid-cols-4 border-b border-white/10 bg-black/20">
              {editorSteps.map(({ label, detail, icon: Icon }, index) => {
                const isCurrent = index === currentStep;
                const isComplete = index < currentStep;
                const isVisited = index <= highestStep;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={!isVisited}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 border-r border-white/10 px-1.5 text-center transition-colors last:border-r-0 sm:flex-row sm:justify-start sm:gap-2 sm:px-4 sm:text-left ${isCurrent ? "bg-white/[0.06] text-white" : isComplete ? "text-mint hover:bg-white/[0.03]" : isVisited ? "text-slate-400 hover:bg-white/[0.03] hover:text-white" : "cursor-not-allowed text-slate-600"}`}
                  >
                    <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border sm:h-7 sm:w-7 ${isCurrent ? "border-mint text-mint" : isComplete ? "border-mint/40 bg-mint/10" : "border-white/10"}`}>
                      {isComplete ? <Check size={14} /> : <Icon size={14} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.62rem] font-medium sm:truncate sm:text-sm">{label}</span>
                      <span className="mt-0.5 hidden truncate text-[0.65rem] text-slate-500 lg:block">{detail}</span>
                    </span>
                    <span className={`absolute inset-x-0 bottom-0 h-0.5 ${isCurrent ? "bg-mint" : isComplete ? "bg-mint/35" : "bg-transparent"}`} />
                  </button>
                );
              })}
            </nav>

            <form
              ref={formRef}
              key={selectedProject?.id ?? "new"}
              onSubmit={handleProjectSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <input name="id" type="hidden" value={selectedProject?.id ?? ""} readOnly />
              <input name="current_logo_image_url" type="hidden" value={selectedProject?.logo_image_url ?? ""} readOnly />
              <input name="remove_logo" type="hidden" value={logoRemoved ? "true" : "false"} readOnly />
              <input name="current_cover_image_url" type="hidden" value={selectedProject?.cover_image_url ?? ""} readOnly />
              <input name="gallery_image_urls" type="hidden" value={getGalleryFormValue(selectedProject)} readOnly />

              <div ref={modalBodyRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {saveError ? (
                <div role="alert" aria-live="assertive" className="mb-5 border border-coral/40 bg-coral/10 px-4 py-3 text-sm leading-6 text-coral">
                  <strong className="block text-xs uppercase text-white">O projeto não foi salvo</strong>
                  <span className="mt-1 block">{saveError}</span>
                </div>
              ) : null}
              <section data-editor-step="0" hidden={currentStep !== 0} className="space-y-6">
              <div className="flex items-start gap-4 border-b border-white/10 pb-4">
                <span className="font-mono text-[0.62rem] text-steel">01</span>
                <div>
                  <p className="text-sm font-medium text-white">Comece pelo que identifica o projeto</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Essas informações aparecem primeiro no card e no topo da página.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-400">Título do projeto
                  <input name="title" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Nome do projeto" defaultValue={selectedProject?.title ?? ""} required />
                  <span className="mt-1.5 block text-[0.68rem] leading-4 text-slate-600">Exemplo: Atlas CRM</span>
                </label>
                <label className="text-xs text-slate-400">Endereço da página
                  <input name="slug" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="nome-do-projeto" defaultValue={selectedProject?.slug ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] leading-4 text-slate-600">Pode ficar vazio: o endereço será criado a partir do título.</span>
                </label>
              </div>

              <label className="block text-xs text-slate-400">Descrição curta
                <textarea name="description" className="mt-2 min-h-24 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Resumo usado no card e no topo da página" defaultValue={selectedProject?.description ?? ""} required />
                <span className="mt-1.5 block text-[0.68rem] leading-4 text-slate-600">Duas ou três frases sobre o problema e o valor entregue.</span>
              </label>

              <div className="space-y-3">
                <label className="block text-xs text-slate-400">Tecnologias
                  <input name="tech_stack" value={stackValue} onChange={(event) => setStackValue(event.target.value)} className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Escolha abaixo ou digite separando por vírgulas" />
                  <span className="mt-1.5 block text-[0.68rem] leading-4 text-slate-600">Clique nas opções frequentes ou escreva uma tecnologia nova.</span>
                </label>
                <div className="space-y-4 border-t border-white/10 pt-4">
                  {stackGroups.map((group) => (
                    <div key={group.label} className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                      <p className="pt-2 font-mono text-[0.55rem] uppercase text-slate-600">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.technologies.map((tech) => {
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
                  ))}
                </div>
              </div>
              </section>

              <section data-editor-step="1" hidden={currentStep !== 1} className="space-y-6">
              <div className="flex items-start gap-4 border-b border-white/10 pb-4">
                <span className="font-mono text-[0.62rem] text-steel">02</span>
                <div>
                  <p className="text-sm font-medium text-white">Conte a história do produto</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Os links são opcionais. Preencha apenas o que já estiver pronto para ser visitado.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-400">Link público
                  <input type="url" name="project_url" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="https://produto.com" defaultValue={selectedProject?.project_url ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] text-slate-600">Abre o produto funcionando.</span>
                </label>
                <label className="text-xs text-slate-400">Repositório
                  <input type="url" name="repo_url" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="https://github.com/..." defaultValue={selectedProject?.repo_url ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] text-slate-600">Código-fonte, quando puder ser público.</span>
                </label>
                <label className="text-xs text-slate-400">Vídeo ou demonstração
                  <input type="url" name="video_url" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="YouTube, Vimeo ou arquivo de vídeo" defaultValue={selectedProject?.video_url ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] text-slate-600">Aparece antes da galeria.</span>
                </label>
                <label className="text-xs text-slate-400">Seu papel no produto
                  <input name="product_role" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Ex.: Full-stack developer" defaultValue={selectedProject?.product_role ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] text-slate-600">Responsabilidade principal no projeto.</span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
                <label className="text-xs text-slate-400">Visão do produto
                  <textarea name="product_overview" className="mt-2 min-h-28 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder="Explique o contexto, o problema e a solução" defaultValue={selectedProject?.product_overview ?? ""} />
                </label>
                <label className="text-xs text-slate-400">Posição na lista
                  <input name="order" className="mt-2 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" type="number" min="0" defaultValue={selectedProject?.order ?? projects.length + 1} />
                  <span className="mt-1.5 block text-[0.68rem] leading-4 text-slate-600">Menor aparece primeiro.</span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs text-slate-400">O que foi construído
                  <textarea name="product_features" className="mt-2 min-h-28 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder={"Pipeline visual\nIndicadores em tempo real"} defaultValue={selectedProject?.product_features.join("\n") ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] text-slate-600">Uma funcionalidade por linha.</span>
                </label>
                <label className="text-xs text-slate-400">Resultados e impacto
                  <textarea name="product_results" className="mt-2 min-h-28 w-full rounded-sm border border-white/12 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-mint" placeholder={"Menos troca de contexto\nDecisões mais rápidas"} defaultValue={selectedProject?.product_results.join("\n") ?? ""} />
                  <span className="mt-1.5 block text-[0.68rem] text-slate-600">Um resultado por linha.</span>
                </label>
              </div>

              <label className="flex items-start gap-3 border-y border-white/10 py-4 text-sm text-slate-300">
                <input name="featured" className="mt-0.5 h-4 w-4 accent-mint" type="checkbox" defaultChecked={selectedProject?.featured ?? false} />
                <span>
                  <span className="block font-medium text-white">Destacar na página inicial</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Use para os projetos que devem receber mais atenção no portfólio.</span>
                </span>
              </label>
              </section>

              <section data-editor-step="2" hidden={currentStep !== 2} className="space-y-6">
              <div className="flex items-start gap-4 border-b border-white/10 pb-4">
                <span className="font-mono text-[0.62rem] text-steel">03</span>
                <div>
                  <p className="text-sm font-medium text-white">Mostre o produto em uso</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">O logo identifica a marca, a capa apresenta o projeto e a galeria explica as telas.</p>
                </div>
              </div>

              <div className="grid gap-4 border-b border-white/10 pb-6 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center">
                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-500">Logo do projeto</p>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-white/18 px-4 py-5 text-sm text-slate-300 transition hover:border-mint/50 hover:text-white sm:max-w-sm">
                    <Upload size={16} />
                    {previewLogoUrl ? "Trocar logo" : "Enviar logo"}
                    <input name="logo" className="sr-only" type="file" accept="image/png,image/webp" onChange={handleLogoPreview} />
                  </label>
                  <p className="text-[0.68rem] leading-5 text-slate-600">PNG ou WebP quadrado, de 128 a 2048 px, com até 2 MB. Fundo transparente recomendado.</p>
                </div>

                <div className="flex items-center gap-3 sm:flex-col">
                  <span className="flex h-24 w-24 items-center justify-center overflow-hidden border border-white/12 bg-black/25">
                    {previewLogoUrl ? <img src={previewLogoUrl} alt="Prévia do logo" className="h-full w-full object-contain p-3" /> : <ImageIcon size={24} className="text-slate-700" />}
                  </span>
                  {previewLogoUrl ? (
                    <button type="button" onClick={removeLogo} className="text-xs text-slate-500 transition hover:text-coral">Remover logo</button>
                  ) : <span className="text-center text-[0.65rem] text-slate-600">Fallback automático</span>}
                </div>
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
                  <p className="text-[0.68rem] leading-5 text-slate-600">JPG, PNG, WebP ou AVIF, com até 20 MB.</p>
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
                  <p className="text-xs leading-5 text-slate-500">Cada imagem pode ter seu próprio enquadramento e uma descrição exibida ao abrir a tela.</p>
                  <p className="text-[0.68rem] leading-5 text-slate-600">Até 20 MB por imagem. O envio acontece direto para a galeria.</p>
                </div>
              </div>

              {galleryPreviewUrls.length ? (
                <div>
                  <p className="mb-3 font-mono text-[0.62rem] uppercase text-mint">Novas imagens</p>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {galleryPreviewUrls.map((imageUrl, index) => (
                      <div key={imageUrl} className="overflow-hidden rounded-sm border border-mint/20 bg-black/25">
                        <img src={imageUrl} alt={`Prévia da imagem ${index + 1}`} className="aspect-[16/10] w-full object-cover" />
                        <div className="space-y-3 border-t border-white/10 p-3">
                          <label className="block text-xs text-slate-400">Enquadramento
                            <select name="gallery_image_sizes" defaultValue="medium" className="mt-2 w-full rounded-sm border border-white/12 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-mint">
                              <option value="small">Pequeno</option>
                              <option value="medium">Médio</option>
                              <option value="large">Grande</option>
                              <option value="full">Total</option>
                            </select>
                          </label>
                          <label className="block text-xs text-slate-400">Descrição da tela
                            <textarea name="gallery_image_descriptions" className="mt-2 min-h-24 w-full rounded-sm border border-white/12 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-mint" placeholder={`O que a tela ${index + 1} apresenta?`} />
                          </label>
                        </div>
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
                        <div className="space-y-3 border-t border-white/10 p-3">
                          <label className="block text-xs text-slate-400">Enquadramento
                            <select name="gallery_image_sizes" defaultValue={selectedProject.gallery_image_sizes[index] ?? "medium"} className="mt-2 w-full rounded-sm border border-white/12 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-mint">
                              <option value="small">Pequeno</option>
                              <option value="medium">Médio</option>
                              <option value="large">Grande</option>
                              <option value="full">Total</option>
                            </select>
                          </label>
                          <label className="block text-xs text-slate-400">Descrição da tela
                            <textarea name="gallery_image_descriptions" defaultValue={selectedProject.gallery_image_descriptions[index] ?? ""} className="mt-2 min-h-24 w-full rounded-sm border border-white/12 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-mint" placeholder={`O que a tela ${index + 1} apresenta?`} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              </section>

              <section data-editor-step="3" hidden={currentStep !== 3} className="space-y-6">
                <div className="flex items-start gap-4 border-b border-white/10 pb-4">
                  <span className="font-mono text-[0.62rem] text-steel">04</span>
                  <div>
                    <p className="text-sm font-medium text-white">Revise como o projeto será apresentado</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Nada foi salvo ainda. Volte a qualquer etapa para ajustar.</p>
                  </div>
                </div>

                {draftPreview ? (
                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden border border-white/12 bg-black/25">
                      <div className={`aspect-[16/10] bg-graphite ${draftPreview.coverDisplay === "thumbnail" ? "p-5 sm:p-8" : ""}`}>
                        <img src={previewCoverUrl} alt="Prévia da capa do projeto" className={`h-full w-full object-cover ${draftPreview.coverDisplay === "thumbnail" ? "border border-white/10" : ""}`} />
                      </div>
                      <div className="border-t border-white/10 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-mono text-[0.58rem] uppercase text-steel">{draftPreview.role}</span>
                          {draftPreview.featured ? <span className="font-mono text-[0.58rem] uppercase text-mint">Destaque</span> : null}
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <ProjectLogo title={draftPreview.title} url={previewLogoUrl} className="h-10 w-10" />
                          <h3 className="font-display text-2xl font-semibold text-white">{draftPreview.title}</h3>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-400">{draftPreview.description}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {draftPreview.stacks.length ? draftPreview.stacks.slice(0, 8).map((tech) => (
                            <span key={tech} className="inline-flex h-7 items-center gap-2 border border-white/10 px-2.5 text-[0.68rem] text-slate-300">
                              <StackLogo label={tech} className="h-3.5 w-3.5" />
                              {tech}
                            </span>
                          )) : <span className="text-xs text-slate-600">Nenhuma tecnologia selecionada.</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <p className="font-mono text-[0.62rem] uppercase text-mint">Resumo da publicação</p>
                        <button type="button" onClick={() => goToStep(0)} className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white">
                          <Edit3 size={13} /> Editar base
                        </button>
                      </div>

                      <dl className="divide-y divide-white/10 border-y border-white/10 text-sm">
                        <div className="flex items-start justify-between gap-4 py-3">
                          <dt className="text-slate-500">Página</dt>
                          <dd className="max-w-[65%] break-all text-right text-slate-200">/projetos/{draftPreview.slug || "gerado-pelo-titulo"}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-3">
                          <dt className="text-slate-500">Posição</dt>
                          <dd className="text-slate-200">{draftPreview.order}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-3">
                          <dt className="text-slate-500">Links disponíveis</dt>
                          <dd className="text-slate-200">{[draftPreview.projectUrl, draftPreview.repoUrl, draftPreview.videoUrl].filter(Boolean).length} de 3</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-3">
                          <dt className="text-slate-500">Galeria</dt>
                          <dd className="text-right text-slate-200">{previewGalleryUrls.length ? `${previewGalleryUrls.length} ${previewGalleryUrls.length === 1 ? "imagem" : "imagens"}` : "Somente a capa"}</dd>
                        </div>
                      </dl>

                      {draftPreview.overview ? (
                        <div>
                          <p className="text-xs font-medium text-white">Visão do produto</p>
                          <p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-500">{draftPreview.overview}</p>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-white/10 p-3">
                          <p className="font-mono text-[0.58rem] uppercase text-steel">Funcionalidades</p>
                          <p className="mt-2 text-xl font-semibold text-white">{draftPreview.features.length}</p>
                        </div>
                        <div className="border border-white/10 p-3">
                          <p className="font-mono text-[0.58rem] uppercase text-steel">Resultados</p>
                          <p className="mt-2 text-xl font-semibold text-white">{draftPreview.results.length}</p>
                        </div>
                      </div>

                      <button type="button" onClick={() => goToStep(2)} className="inline-flex h-10 w-full items-center justify-center gap-2 border border-white/12 text-xs text-slate-300 transition hover:border-mint/50 hover:text-white">
                        <ImageIcon size={14} /> Revisar capa e galeria
                      </button>
                    </div>
                  </div>
                ) : null}

                {previewGalleryUrls.length ? (
                  <div>
                    <p className="mb-3 font-mono text-[0.6rem] uppercase text-steel">Imagens da galeria</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {previewGalleryUrls.slice(0, 4).map((imageUrl, index) => (
                        <div key={`${imageUrl}-${index}`} className="overflow-hidden border border-white/10 bg-black/25">
                          <img src={imageUrl} alt={`Prévia da galeria ${index + 1}`} className="aspect-[16/10] w-full object-cover" />
                          <span className="block border-t border-white/10 px-2 py-1.5 font-mono text-[0.55rem] uppercase text-slate-500">Tela {String(index + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-ink px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center justify-between gap-4 sm:justify-start">
                  <button onClick={closeForm} disabled={isSaving} type="button" className="h-10 px-2 text-sm text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                    Cancelar
                  </button>
                  <span aria-live="polite" className="font-mono text-[0.58rem] uppercase text-slate-600">{saveProgress || `${currentStep + 1} / ${editorSteps.length}`}</span>
                </div>
                <div className="flex gap-2">
                  {currentStep > 0 ? (
                    <button onClick={() => goToStep(currentStep - 1)} disabled={isSaving} type="button" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-white/12 px-4 text-sm text-slate-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
                      <ChevronLeft size={16} /> Voltar
                    </button>
                  ) : null}
                  {currentStep < editorSteps.length - 1 ? (
                    <button onClick={continueEditor} type="button" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-white px-5 text-sm font-semibold text-ink transition-colors hover:bg-mint sm:flex-none">
                      Continuar <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" disabled={isSaving} className="inline-flex h-11 min-w-40 flex-1 items-center justify-center gap-2 rounded-sm bg-mint px-5 text-sm font-semibold text-ink transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70 sm:flex-none">
                      <Check size={16} /> {isSaving ? "Salvando..." : selectedProject ? "Salvar alterações" : "Criar projeto"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
