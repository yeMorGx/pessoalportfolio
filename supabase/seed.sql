insert into public.projects (
  title,
  slug,
  description,
  cover_image_url,
  tech_stack,
  project_url,
  repo_url,
  featured,
  "order"
)
values
  (
    'Atlas CRM',
    'atlas-crm',
    'Painel operacional para equipes comerciais acompanharem pipeline, receita e tarefas críticas em tempo real.',
    '/project-atlas.svg',
    array['Next.js', 'Supabase', 'TypeScript'],
    null,
    null,
    true,
    1
  ),
  (
    'Pulse Analytics',
    'pulse-analytics',
    'Dashboard de produto com métricas acionáveis, segmentação por coorte e visualizações focadas em decisão.',
    '/project-pulse.svg',
    array['React', 'Postgres', 'GSAP'],
    null,
    null,
    true,
    2
  ),
  (
    'Forge Admin',
    'forge-admin',
    'Área administrativa enxuta para gerenciar conteúdo, uploads e estados de publicação sem tocar no código.',
    '/project-forge.svg',
    array['Next.js', 'Storage', 'Auth'],
    null,
    null,
    false,
    3
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  cover_image_url = excluded.cover_image_url,
  tech_stack = excluded.tech_stack,
  project_url = excluded.project_url,
  repo_url = excluded.repo_url,
  featured = excluded.featured,
  "order" = excluded."order";
