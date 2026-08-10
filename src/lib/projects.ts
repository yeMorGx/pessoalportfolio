export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  tech_stack: string[];
  project_url: string | null;
  repo_url: string | null;
  featured: boolean;
  order: number;
};

export const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "Atlas CRM",
    slug: "atlas-crm",
    description: "Painel operacional para equipes comerciais acompanharem pipeline, receita e tarefas críticas em tempo real.",
    cover_image_url: "/project-atlas.svg",
    tech_stack: ["Next.js", "Supabase", "TypeScript"],
    project_url: null,
    repo_url: null,
    featured: true,
    order: 1
  },
  {
    id: "2",
    title: "Pulse Analytics",
    slug: "pulse-analytics",
    description: "Dashboard de produto com métricas acionáveis, segmentação por coorte e visualizações focadas em decisão.",
    cover_image_url: "/project-pulse.svg",
    tech_stack: ["React", "Postgres", "GSAP"],
    project_url: null,
    repo_url: null,
    featured: true,
    order: 2
  },
  {
    id: "3",
    title: "Forge Admin",
    slug: "forge-admin",
    description: "Área administrativa enxuta para gerenciar conteúdo, uploads e estados de publicação sem tocar no código.",
    cover_image_url: "/project-forge.svg",
    tech_stack: ["Next.js", "Storage", "Auth"],
    project_url: null,
    repo_url: null,
    featured: false,
    order: 3
  }
];
