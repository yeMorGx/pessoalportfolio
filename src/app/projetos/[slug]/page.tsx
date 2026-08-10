import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
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
      <section className="px-5 pb-20 pt-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/#projetos" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} />
            Projetos
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="font-mono text-sm uppercase text-mint">{project.product_role ?? "Produto digital"}</p>
              <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-normal sm:text-7xl">{project.title}</h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">{project.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.project_url ? (
                  <a href={project.project_url} className="inline-flex items-center gap-2 bg-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white">
                    <ExternalLink size={16} />
                    Abrir produto
                  </a>
                ) : null}
                {project.repo_url ? (
                  <a href={project.repo_url} className="inline-flex items-center gap-2 border border-white/14 px-5 py-3 text-sm text-white transition hover:border-mint/70">
                    <Github size={16} />
                    Repositório
                  </a>
                ) : null}
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden border border-white/12 bg-graphite">
              <Image src={project.cover_image_url} alt="" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="font-mono text-sm uppercase text-mint">Visão do Produto</p>
            <p className="mt-4 text-xl leading-9 text-slate-200">{overview}</p>
          </div>
          <div>
            <p className="font-mono text-sm uppercase text-mint">Stack</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="rounded-full border border-white/12 px-3 py-1 text-sm text-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {project.video_url ? (
        <section className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-sm uppercase text-mint">Demo</p>
            <div className="mt-6 aspect-video overflow-hidden border border-white/12 bg-black">
              {isEmbeddableVideo(project.video_url) ? (
                <iframe className="h-full w-full" src={getEmbedUrl(project.video_url)} title={`Demo ${project.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              ) : (
                <video className="h-full w-full" src={project.video_url} controls />
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm uppercase text-mint">Galeria</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {gallery.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="overflow-hidden border border-white/12 bg-graphite">
                <img src={imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-sm uppercase text-mint">Features</p>
            <div className="mt-5 space-y-3">
              {(project.product_features.length ? project.product_features : ["Experiência responsiva", "Fluxo principal implementado", "Base pronta para evolução"]).map((feature) => (
                <div key={feature} className="border-l border-mint/50 bg-white/[0.04] px-4 py-3 text-slate-200">
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-sm uppercase text-mint">Impacto</p>
            <div className="mt-5 space-y-3">
              {(project.product_results.length ? project.product_results : ["Produto apresentável", "Arquitetura limpa", "Experiência consistente"]).map((result) => (
                <div key={result} className="border-l border-coral/60 bg-white/[0.04] px-4 py-3 text-slate-200">
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
