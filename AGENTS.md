# AGENTS.md — Portfólio Pessoal

Este arquivo orienta qualquer agente de IA (Claude Code, Cursor, etc.) que for
ajudar a construir e manter este projeto. Leia por completo antes de gerar
código.

## 1. Visão geral do projeto

Site de portfólio pessoal para um desenvolvedor full-stack, com foco forte em
apresentação visual: animações fluidas, scroll storytelling e microinterações
nos elementos de UI. O objetivo não é só "mostrar projetos", é causar uma
primeira impressão memorável.

## 2. Stack técnica

- **Framework:** Next.js (App Router) + TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** GSAP (GreenSock) + plugin ScrollTrigger
- **Backend/dados:** Supabase (banco Postgres + Auth + Storage para imagens
  dos projetos)
- **Deploy:** Vercel (assumir isso ao sugerir configs de build/imagem)
- **Gerenciador de pacotes:** o agente deve detectar (`package-lock.json`,
  `pnpm-lock.yaml`, etc.) antes de sugerir comandos de instalação

Não trocar essa stack sem confirmação explícita. Se algo exigir uma lib nova
(ex.: Lenis para smooth scroll, react-three-fiber para 3D), perguntar antes
de instalar em vez de assumir.

## 3. Identidade visual

- Logo está em `public/logo.svg` (arquivo em anexo, formato monocromático
  branco — pensado para fundo escuro).
- Tema principal: dark mode como padrão. Se o agente propor um light mode,
  deve ser opcional, nunca substituindo o dark por padrão.
- Usar a logo como elemento vivo quando fizer sentido: ex. pequena animação
  de entrada no header, ou reagindo ao scroll — sem exagerar.

## 4. Requisitos de animação (o coração do projeto)

### 4.1 GSAP + ScrollTrigger
- Toda animação de entrada de seção deve usar `ScrollTrigger` (fade/slide/
  scale ao entrar no viewport), não apenas `useEffect` com IntersectionObserver
  puro.
- Usar `gsap.context()` dentro de componentes React para escopar as
  animações e limpar tudo no `return` do `useEffect` (evitar leaks e
  duplicação em re-render/HMR).
- Registrar o plugin uma única vez (`gsap.registerPlugin(ScrollTrigger)`),
  de preferência em um util compartilhado, não repetido em cada componente.

### 4.2 Parallax
- Aplicar parallax sutil em imagens de fundo/hero e em elementos decorativos
  (não em texto de leitura — prejudica legibilidade).
- Preferir `ScrollTrigger` com `scrub: true` para o parallax acompanhar o
  scroll de forma suave, em vez de animações "on enter" fixas.
- Testar sempre a performance em mobile: parallax pesado pode travar em
  telas menos potentes. Se necessário, desativar/reduzir parallax abaixo de
  um breakpoint.

### 4.3 Cards de projeto — efeito "tilt" no hover
- Ao passar o mouse sobre um card de projeto, ele deve se mover/inclinar
  sutilmente seguindo a posição do cursor (efeito tilt 3D), como se o card
  tivesse profundidade.
- Implementação de referência: capturar `mousemove` no card, calcular a
  posição relativa do cursor (x, y normalizados de -1 a 1) e aplicar
  `rotateX` / `rotateY` com `gsap.to()` usando `ease` suave (ex.:
  `power2.out`) e um `transform-perspective` no container pai.
- No `mouseleave`, animar de volta para o estado neutro (rotação 0) com uma
  transição um pouco mais lenta que a de entrada, para não parecer abrupto.
- Adicionar um leve `scale up` (ex. 1.02–1.05) e sombra dinâmica reforça a
  sensação de profundidade — usar com moderação.
- Esse efeito deve ser desabilitado em touch devices (não faz sentido sem
  mouse) — checar `matchMedia('(hover: hover)')` ou similar antes de anexar
  os listeners.

### 4.4 Performance e boas práticas
- Respeitar `prefers-reduced-motion`: usuários com essa preferência devem
  receber uma versão sem (ou com bem menos) animação.
- Evitar animar propriedades que causam reflow (`width`, `top`, `left`);
  priorizar `transform` e `opacity`.
- Limpar todos os `ScrollTrigger` e tweens ao desmontar componentes.
- Lazy-load de imagens pesadas de projeto; animação não deve bloquear o
  carregamento do conteúdo.

## 5. Estrutura de pastas sugerida

```
src/
  app/
  components/
    ui/
    sections/         # Hero, About, Projects, Contact...
    project-card/
  lib/
    gsap.ts            # registerPlugin + helpers compartilhados
  hooks/
    useTilt.ts          # hook reutilizável do efeito de tilt
    useScrollReveal.ts   # hook reutilizável de reveal on scroll
public/
  logo.svg
```

Preferir extrair a lógica de animação em hooks reutilizáveis (`useTilt`,
`useScrollReveal`) em vez de duplicar código GSAP em cada componente.

## 6. Convenções de código

- TypeScript estrito, sem `any` sem justificativa.
- Componentes funcionais, nomeados em PascalCase.
- Tailwind: preferir classes utilitárias diretas; extrair para
  `@apply`/componentes só quando o padrão se repetir muito.
- Commits pequenos e descritivos (o agente deve sugerir mensagens de commit
  quando for o caso).

## 7. O que NÃO fazer

- Não trocar GSAP por outra lib de animação sem pedir confirmação.
- Não adicionar animação em todo elemento só porque é possível — cada
  animação deve ter intenção (guiar o olho, dar feedback, criar hierarquia).
- Não sacrificar acessibilidade (contraste, foco de teclado, reduced motion)
  em nome do efeito visual.
- Não deixar `console.log` ou código comentado morto no código final.

## 8. Seções esperadas do site (ponto de partida, ajustável)

1. Hero — nome, título, breve tagline, logo com pequena animação de entrada
2. Sobre — resumo rápido, stack principal
3. Projetos — grid de cards com efeito tilt no hover, filtros opcionais
4. Experiência/Stack — tecnologias, talvez com ícones animados
5. Contato — formulário ou links diretos (GitHub, LinkedIn, e-mail)

## 9. Painel administrativo (área de controle do site)

Além da landing page pública, o projeto tem uma área privada em `/admin`
(ou `/dashboard`) só para o dono do site gerenciar o conteúdo — sem precisar
mexer em código pra trocar um projeto.

### 9.1 Autenticação
- Rota protegida via **Supabase Auth** (um único usuário admin — o dono do
  site — via e-mail/senha ou magic link).
- Middleware do Next.js (`middleware.ts`) checando a sessão e redirecionando
  pra tela de login se não autenticado, antes de renderizar qualquer rota
  sob `/admin`.
- Nunca expor a "service role key" do Supabase no client — operações
  sensíveis (delete, etc.) devem passar por Server Actions ou Route Handlers.

### 9.2 Dados: tabela `projects` (Supabase/Postgres)
Campos sugeridos como ponto de partida (ajustar conforme necessidade):
- `id`, `title`, `slug`, `description`, `cover_image_url`
- `tech_stack` (array de strings ou tabela relacionada)
- `project_url`, `repo_url`
- `featured` (boolean — controla se aparece em destaque na home)
- `order` (int — controla a ordem de exibição no grid)
- `created_at`, `updated_at`

### 9.3 Funcionalidades do painel
- Listagem de todos os projetos (tabela ou grid simples, sem precisar das
  animações pesadas da landing — o admin é funcional, não é vitrine).
- Criar novo projeto (formulário: título, descrição, stack, links, imagem).
- Editar projeto existente (mesmo formulário, pré-preenchido).
- Excluir projeto (com confirmação).
- Reordenar/marcar como "destaque" — controla o que aparece e em que ordem
  na seção de Projetos da landing.
- Upload de imagem de capa direto pro Supabase Storage, com preview antes de
  salvar.
- A landing page pública deve buscar os projetos do Supabase (não de um
  array hardcoded) — assim uma edição no painel reflete direto no site.

### 9.4 Fora de escopo por padrão
- Não construir um CMS genérico ou multi-usuário — é uma ferramenta pessoal
  de uma pessoa só.
- Não é necessário editor de texto rico (WYSIWYG) a menos que peça — campos
  de texto simples/textarea resolvem para descrição de projeto.
