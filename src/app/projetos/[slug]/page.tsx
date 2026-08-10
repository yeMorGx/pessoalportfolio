import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { StackLogo } from "@/components/ui/StackLogo";
import { getProjectBySlug } from "@/lib/supabase/projects";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

function isEmbeddableVideo(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
}

function getEmbedUrl(url: string) {
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (url.includes("watch?v=")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }

  return url;
}

function getGalleryItemClass(size: string | undefined) {
  if (size === "small") {
    return "md:col-span-1";
  }

  if (size === "large") {
    return "md:col-span-2 lg:col-span-2";
  }

  if (size === "full") {
    return "md:col-span-2 lg:col-span-3";
  }

  return "md:col-span-1 lg:col-span-1";
}

function getGalleryAspectClass(size: string | undefined) {
  if (size === "full") {
    return "aspect-[21/9]";
  }

  if (size === "large") {
    return "aspect-[16/8]";
  }

  if (size === "small") {
    return "aspect-square";
  }

  return "aspect-[16/10]";
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const gallery = project.gallery_image_urls.length ? project.gallery_image_urls : [project.cover_image_url];
  const overview = project.product_overview ?? project.description;

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="px-5 pb-14 pt-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/#projetos" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} />
            Projetos
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase text-mint">{project.product_role ?? "Produto digital"}</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">{project.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {project.project_url ? (
                  <a href={project.project_url} className="inline-flex items-center gap-2 bg-mint px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-white">
                    <ExternalLink size={16} />
                    Abrir produto
                  </a>
                ) : null}
                {project.repo_url ? (
                  <a href={project.repo_url} className="inline-flex items-center gap-2 border border-white/14 px-4 py-2.5 text-sm text-white transition hover:border-mint/70">
                    <Github size={16} />
                    Repositório
                  </a>
                ) : null}
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-white/12 bg-graphite shadow-2xl shadow-black/30">
              <Image src={project.cover_image_url} alt="" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div className="border-l border-mint/40 pl-5">
            <p className="font-mono text-xs uppercase text-mint">Visão do Produto</p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-200">{overview}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase text-mint">Stack</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/20 px-3 py-1.5 text-sm text-slate-200">
                  <StackLogo label={tech} className="h-4 w-4" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {project.video_url ? (
        <section className="px-5 py-14">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs uppercase text-mint">Demo</p>
            <div className="mt-5 aspect-video overflow-hidden rounded-sm border border-white/12 bg-black">
              {isEmbeddableVideo(project.video_url) ? (
                <iframe className="h-full w-full" src={getEmbedUrl(project.video_url)} title={`Demo ${project.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              ) : (
                <video className="h-full w-full" src={project.video_url} controls />
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase text-mint">Galeria</p>
          <div className="mt-6 grid auto-rows-auto gap-5 md:grid-cols-2 lg:grid-cols-3">
            {gallery.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className={`overflow-hidden rounded-sm border border-white/12 bg-graphite shadow-xl shadow-black/20 ${getGalleryItemClass(project.gallery_image_sizes[index])}`}>
                <img src={imageUrl} alt="" className={`${getGalleryAspectClass(project.gallery_image_sizes[index])} w-full object-cover`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase text-mint">Features</p>
            <div className="mt-5 grid gap-3">
              {(project.product_features.length ? project.product_features : ["Experiência responsiva", "Fluxo principal implementado", "Base pronta para evolução"]).map((feature) => (
                <div key={feature} className="border-l border-mint/50 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-200">
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs uppercase text-mint">Impacto</p>
            <div className="mt-5 grid gap-3">
              {(project.product_results.length ? project.product_results : ["Produto apresentável", "Arquitetura limpa", "Experiência consistente"]).map((result) => (
                <div key={result} className="border-l border-coral/60 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-200">
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
