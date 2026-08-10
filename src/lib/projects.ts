export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  cover_display: "thumbnail" | "fullscreen";
  product_overview: string | null;
  gallery_image_urls: string[];
  gallery_image_sizes: ProjectGalleryImageSize[];
  video_url: string | null;
  product_role: string | null;
  product_features: string[];
  product_results: string[];
  tech_stack: string[];
  project_url: string | null;
  repo_url: string | null;
  featured: boolean;
  order: number;
};

export type ProjectGalleryImageSize = "small" | "medium" | "large" | "full";

export const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "Atlas CRM",
    slug: "atlas-crm",
    description: "Painel operacional para equipes comerciais acompanharem pipeline, receita e tarefas críticas em tempo real.",
    cover_image_url: "/project-atlas.svg",
    cover_display: "thumbnail",
    product_overview: "Um CRM operacional pensado para diminuir ruído entre leads, atividades e decisões de venda. A experiência concentra indicadores, próximos passos e contexto do cliente em uma interface rápida de escanear.",
    gallery_image_urls: ["/project-atlas.svg"],
    gallery_image_sizes: ["medium"],
    video_url: null,
    product_role: "Full-stack developer",
    product_features: ["Pipeline visual", "Indicadores em tempo real", "Gestão de tarefas comerciais"],
    product_results: ["Menos troca de contexto", "Leitura rápida do funil", "Operação preparada para times pequenos"],
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
    cover_display: "thumbnail",
    product_overview: "Uma camada analítica para transformar eventos de produto em leitura objetiva. O foco é revelar padrões de uso, retenção e oportunidades sem enterrar o usuário em gráficos soltos.",
    gallery_image_urls: ["/project-pulse.svg"],
    gallery_image_sizes: ["medium"],
    video_url: null,
    product_role: "Frontend e visual analytics",
    product_features: ["Coortes", "Métricas de produto", "Visualizações responsivas"],
    product_results: ["Decisões mais rápidas", "Sinais de retenção claros", "Painel pronto para apresentação"],
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
    cover_display: "thumbnail",
    product_overview: "Um painel privado para controlar conteúdo de projetos com autenticação, uploads e estados de destaque. A proposta é dar autonomia sem transformar o site em um CMS genérico.",
    gallery_image_urls: ["/project-forge.svg"],
    gallery_image_sizes: ["medium"],
    video_url: null,
    product_role: "Arquitetura e implementação",
    product_features: ["Auth", "CRUD de projetos", "Upload de imagens"],
    product_results: ["Conteúdo editável pelo painel", "Menos manutenção manual", "Base pronta para evoluir"],
    tech_stack: ["Next.js", "Storage", "Auth"],
    project_url: null,
    repo_url: null,
    featured: false,
    order: 3
  }
];
