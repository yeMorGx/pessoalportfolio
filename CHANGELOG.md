# CHANGELOG - Continuidade do projeto

Contexto tecnico para retomar o portfolio em outro chat, IA ou dispositivo.
Leia junto com `AGENTS.md` antes de alterar o codigo.

## Como retomar

1. Ler `AGENTS.md` e este arquivo.
2. Executar `git status --short` e preservar mudancas locais do usuario.
3. Consultar o projeto **Portfolio Pessoal** no Linear para tarefas, ideias,
   prioridades, revisoes, correcoes e cancelamentos.
4. Atualizar o Linear e este arquivo em toda alteracao relevante.

## Papel do Linear e deste arquivo

- Linear: fonte operacional do trabalho, com Kanban, prioridades, dependencias
  e detalhes das tarefas.
- `CHANGELOG.md`: fonte tecnica versionada, com estado publicado, decisoes,
  banco, verificacoes e ponto de retomada.
- Projeto Linear: `Portfolio Pessoal`.
- Documento Linear: `Continuidade do projeto`.
- Uma tarefa so passa para concluida depois de implementacao e verificacao.
- Commit, push e deploy so sao registrados depois de confirmados.

## Estado atual

- Atualizado em: 2026-08-14.
- Branch: `main`.
- HEAD funcional publicado: `ca360ea` (`fix: simplify hero logo interaction`).
- Ultimo commit funcional: `ca360ea` (`fix: simplify hero logo interaction`).
- Producao: `https://pessoalportfolio.vercel.app`.
- Deploy: Vercel conectado a `main`.
- Dados: Supabase Postgres, Auth e Storage.
- Contato provisorio: `gabrielmcgoes@gmail.com`.
- Contato futuro: `contact@gabrielmorgado.dev`.
- GitHub: `https://github.com/yeMorGx`.
- LinkedIn: `https://www.linkedin.com/in/gabrielmcgoes`.
- `tsconfig.tsbuildinfo` esta modificado localmente e nao deve ser incluido sem
  necessidade.

## Trabalho planejado

O acompanhamento detalhado esta no Kanban do Linear. Ordem final definida pelo
usuario:

1. Ativar a notificacao por e-mail do formulario com a chave do Resend
   (`GAB-6`); persistencia e painel ja estao publicados.
2. Enviar o PDF final pelo painel e ativar os avisos do fluxo de curriculo
   (`GAB-7`); solicitacao, aprovacao e acesso ja estao publicados.
3. QA final e publicacao definitiva (`GAB-5`).

Dependencias ainda necessarias:

- Criar/configurar `RESEND_API_KEY`; o Supabase do formulario ja esta ativo.
- Comprar e verificar `gabrielmorgado.dev` para o remetente definitivo.
- Fornecer o curriculo final em PDF.

Ideias futuras registradas no Linear:

- `GAB-11` (media): icone ou logo por projeto.
- `GAB-12` (media): stacks e ferramentas de IA.
- `GAB-13` (baixa): globo interativo com retorno a Santos.

## Trabalho local / nao publicado

- 2026-08-14: nova rodada de refinamento do hero: a tela de carregamento foi
  removida, assim como o texto de apoio `3D / interativa` e a instrução para
  passar o mouse sobre a marca. `LogoScene` agora usa `OrbitControls` para
  permitir rotação por arraste, com damping, zoom/pan desativados e cursor de
  interação; o fallback estático para `prefers-reduced-motion` foi preservado.
  `PortfolioHome`, `Hero`, `LogoScene`, `i18n` e os componentes antigos
  `PageLoader`/`AnimatedLogo` foram ajustados ou removidos.
- Linear: tarefa `GAB-16` concluída após implementação, validação, commit, push
  e deploy confirmados.
- Validações locais: `npm run lint`, `npm run typecheck`, `npm run build`,
  `git diff --check` e smoke test aprovados. O runtime local respondeu `200` em
  `/` e o alias público respondeu `200`, sem o loader ou os textos removidos.
- Estado: **publicado** no commit `ca360ea`; o deploy
  `https://pessoalportfolio-i4a23upm0-yemorgxs-projects.vercel.app` ficou
  `Ready` em produção em 2026-08-14. `tsconfig.tsbuildinfo` permanece
  modificado localmente e fora do commit.
- 2026-08-14: a home ganhou uma tela de carregamento com a marca SVG animada,
  interacao de arraste e clique na logo 3D do hero, favicon automatico a partir
  do `project_url`/`repo_url` quando nao existe logo enviada e um quarto trilho
  publico para IA e automacao com OpenAI, Codex, Claude, Gemini, n8n, LangChain,
  Hugging Face, Ollama e MCP. As mudancas cobrem `PageLoader`, `AnimatedLogo`,
  `LogoScene`, `ProjectLogo`, `ProjectCard`, acervo, case, admin, `Experience`,
  `PortfolioHome`, `Hero` e textos bilingues em `i18n`.
- Linear: tarefa `GAB-15` criada no projeto `Portfolio Pessoal` e concluída após
  acompanhar esta entrega.
- Validacoes locais: `npm run lint`, `npm run typecheck` e `npm run build`
  aprovados; runtime local respondeu 200 em `/` e `/pt` e confirmou loader,
  interacao e trilho de IA nas duas linguas.
- Estado: **publicado** no commit `770da1f`; `tsconfig.tsbuildinfo` continua
  modificado localmente e fora do commit.
- Deploy de producao: `https://pessoalportfolio-bh2js4o2z-yemorgxs-projects.vercel.app`
  ficou `Ready` em 50 segundos; o alias `https://pessoalportfolio.vercel.app`
  respondeu `200` em 2026-08-14.
- Linear: `GAB-15` concluida com commit, push e deploy confirmados.
- Retomada: fazer QA visual de desktop/mobile quando houver uma nova rodada de
  refinamentos ou publicar outras tarefas do projeto.
- O `CHANGELOG.md` permanece como ponto de continuidade versionado do projeto.
- `tsconfig.tsbuildinfo` continua modificado localmente e fora dos commits.

## Entregas publicadas

### `1569254` + `2383e80` + `b3d9c01` + `8ec7d79` - Acesso protegido ao curriculo (`GAB-7`)

- `/resume` e `/pt/curriculo` recebem nome, e-mail profissional, empresa,
  cargo, LinkedIn opcional e contexto da oportunidade, com validacao no
  servidor, honeypot, tempo minimo e limite de tres solicitacoes por dia.
- O visitante recebe um token privado de acompanhamento; o painel
  `/admin/resume` permite revisar, anotar, aprovar, recusar, renovar, revogar e
  excluir solicitacoes, alem de enviar ou substituir o PDF final.
- O PDF usa o bucket privado `private-resume`; aprovacoes geram token aleatorio
  armazenado apenas como hash, link de 72 horas e URL assinada de 60 segundos.
  O segredo fica no fragmento do navegador e nao entra nos logs da Vercel.
- O Gmail atual abre uma resposta pronta com o link quando o Resend nao esta
  configurado. Com chave e remetente verificado, os avisos automaticos ja estao
  implementados.
- O login administrativo e o Gmail de contato agora sao responsabilidades
  separadas: `ADMIN_EMAIL` autoriza a conta real do painel, enquanto o Gmail
  continua como destino das mensagens. O registro dinamico `portfolio_admins`
  substitui as politicas RLS que dependiam de um e-mail fixo.
- O envio e a remocao do PDF passam pela Edge Function `resume-file-admin`, que
  valida a sessao administrativa e entrega uma URL assinada ao navegador. Isso
  corrige o erro `new row violates row-level security policy` sem tornar o
  bucket publico.
- Migracoes `20260813170000`, `20260813173000` e `20260813180000` aplicadas;
  Edge Functions `submit-resume-request`, `resume-access`,
  `review-resume-request` e `resume-file-admin` publicadas.
- Typecheck, lint e build aprovados. QA remoto confirmou tres solicitacoes,
  bloqueio da quarta, acompanhamento, barreiras antispam, revisao publica
  negada e RPC interno oculto; todos os registros artificiais foram removidos.
- QA desktop/mobile passou sem overflow ou erros. O deploy da correcao
  `pessoalportfolio-a1yzeo4e0-yemorgxs-projects.vercel.app` ficou pronto em 45 s;
  PT/EN, acesso privado e protecao do painel foram confirmados no alias publico.

### `ebd01de` - Formulario e caixa de contato protegidos (`GAB-6`)

- O contato bilingue agora envia mensagens para uma Edge Function do Supabase,
  com validacao no servidor, honeypot, tempo minimo e limite de tres envios por
  IP a cada 15 minutos.
- As mensagens ficam persistidas com RLS restrita a
  `gabrielmcgoes@gmail.com`; `/admin/messages` permite buscar, ler, responder,
  arquivar e excluir, com contador integrado ao painel de projetos.
- O aviso pelo Resend esta preparado para usar o Gmail atual e
  `onboarding@resend.dev`; sem `RESEND_API_KEY`, o envio continua funcionando e
  a mensagem fica marcada como `not_configured` no painel.
- Migracoes `20260813152500`, `20260813154500`, `20260813160000` e
  `20260813162000` aplicadas; a Edge Function `submit-contact` foi publicada.
- Typecheck, lint e build aprovados. QA remoto confirmou tres envios aceitos,
  quarto envio bloqueado, validacoes antispam e RPC publico indisponivel; os
  registros artificiais foram removidos.
- Deploy `pessoalportfolio-finb6jdst-yemorgxs-projects.vercel.app` ficou pronto
  em 42 s. O alias publico foi validado em PT/EN sem erros, e a caixa
  administrativa redireciona visitantes nao autenticados para o login.

### `e04ec13` - Globo interativo (`GAB-13`)

- O globo da localizacao aceita arraste por mouse/toque, usa inercia curta e
  retorna automaticamente para a orientacao inicial da Baixada Santista.
- O CTA do Maps foi separado da area 3D para evitar abertura durante o gesto;
  movimento reduzido preserva a versao estatica sem montar controles.
- Lint, typecheck, build e QA desktop/mobile aprovados. Deploy
  `pessoalportfolio-ji3v0in3w-yemorgxs-projects.vercel.app` ficou pronto em 51 s
  e o alias publico foi validado sem overflow ou erros visuais.

### `c538c37` + `dddadac` - Logos dos projetos (`GAB-11`)

- O modelo e o editor aceitam logo opcional por projeto, com upload direto ao
  Storage, preview, remocao e uso em cards, acervo e pagina do case.
- PNG/WebP quadrado entre 128 e 2048 px, ate 2 MB; sem arquivo, um monograma do
  titulo preserva a identidade visual. O fallback de `+Ctrl` foi refinado para
  `+C` no commit complementar.
- A migracao `20260813141000_add_project_logo.sql` foi aplicada ao Supabase.
  Lint, typecheck, build e QA de producao desktop/mobile foram aprovados com os
  quatro projetos reais, sem overflow ou erros de navegador.
- Deploy final `pessoalportfolio-8u5mq8m36-yemorgxs-projects.vercel.app` ficou
  pronto em 44 s e assumiu o alias publico.

### `c6ba7c5` - Catalogo de IA e automacao (`GAB-12`)

- O editor ganhou a categoria `IA e automacao` com OpenAI, Codex, Claude,
  Gemini, n8n, LangChain, Hugging Face, Ollama e MCP.
- `StackLogo` resolve as marcas via Simple Icons ou Dashboard Icons e usa o
  monograma textual quando uma imagem externa falha.
- Logos responderam nas CDNs configuradas; lint, typecheck e build aprovados.
- Deploy `pessoalportfolio-6l3kq33s9-yemorgxs-projects.vercel.app` ficou pronto
  em 42 s. Alias publico e protecao do painel foram validados; a categoria nao
  foi aberta visualmente em producao por exigir login do usuario.

### `2c8aae7` - Portfolio bilingue (`GAB-10`)

- `/` e `/projects` usam ingles; `/pt` e `/pt/projetos` preservam portugues.
  Home, acervo, cases, galeria, navegacao e metadados foram internacionalizados
  sem alterar Supabase ou admin.
- O seletor EN/PT preserva a pagina equivalente e atualiza o idioma do
  documento. URLs antigas em `/projetos` redirecionam para a versao em
  portugues; canonical, `hreflang` e `x-default` sao definidos por rota.
- Lint, typecheck e build aprovados. QA de producao desktop/mobile confirmou os
  quatro projetos reais, trilho horizontal, troca de idioma, redirects, zero
  overflow e nenhum erro de navegador.
- Deploy `pessoalportfolio-g2ocpgltq-yemorgxs-projects.vercel.app` ficou pronto
  em 47 s e o alias publico foi validado.

### `fe8ea8b` - Acervo horizontal de projetos (`GAB-9`)

- A home mostra tres projetos e um acesso para o acervo completo.
- `/projetos` usa trilho horizontal pinado no desktop, com quatro projetos
  reais, progresso, setas e navegacao pelas teclas direcionais.
- Mobile e movimento reduzido usam leitura vertical sem controles flutuantes.
- Rota com 4,91 kB e 162 kB de First Load JS; lint, tipos e build aprovados.
- Deploy `pessoalportfolio-f1drlm2xt-yemorgxs-projects.vercel.app` ficou pronto
  em 43 s; alias publico e QA desktop/mobile aprovados sem erros ou overflow.

### `93680f0` - Performance inicial (`GAB-8`)

- O globo 3D e suas texturas de 829,5 kB agora carregam apenas ao se aproximar
  da secao de localizacao; o topo monta somente o canvas do hero.
- Os canvases pausam a renderizacao continua fora da area visivel.
- O favicon servido caiu de 361,4 kB para 0,6 kB.
- Build final: home com 168 kB de First Load JS e oito rotas.
- Lighthouse mobile em producao: Performance 80, Acessibilidade 89, Boas
  praticas 100, SEO 100, FCP 1,1 s, LCP 2,1 s, TBT 730 ms e CLS 0.
- Deploy `pessoalportfolio-lnomne7ux-yemorgxs-projects.vercel.app` pronto em
  43 s; alias publico respondeu 200 e o QA mobile nao encontrou erros.

### `d0f6f95` - Header mobile progressivo (`GAB-14`)

- No topo mobile, o header mostra somente o menu; depois de 48 px de scroll,
  revela a barra completa e a pequena logo.
- O retorno ao topo recompata a barra e o desktop permanece inalterado.
- QA aprovado em 390 x 844, 700 x 844 e 1440 x 900, sem overflow.

### `a7b6617` - Hero e header mobile

- Removeu `GM` do header mobile e preservou o nome completo no desktop.
- Reenquadrou a logo 3D e estabilizou os CTAs em 390 x 844 e 320 x 740.
- Publicado e verificado na Vercel; sem overflow ou erros de navegador.

### `f2a8813` - Espacamento da logo 3D

- Deslocou o palco 3D para a direita somente no desktop.
- QA desktop e mobile aprovado sem recorte ou alteracao de enquadramento mobile.

### `cf5ca18` - Upload de projetos

- Corrigiu o erro `413 Body exceeded 1 MB limit` da etapa final do admin.
- O navegador envia arquivos diretamente ao Supabase por URLs assinadas; a
  Server Action recebe apenas dados textuais e URLs.
- Mantem o modal aberto em falhas, mostra progresso e remove midia orfa.
- Capa e galeria aceitam ate 20 MB por arquivo.
- Lint, typecheck, build e QA de previews aprovados; deploy sem erros.

### `a14d95c` - Experiencia publica e admin refinados

- Logo 3D consolidada em uma peca metalica, sem camadas se atravessando.
- Header publico reorganizado e sem link para `/admin`.
- Admin redesenhado com busca, filtros, indicadores e editor mais estavel.
- Modal do editor deixa de fechar ao clicar no fundo durante a revisao.
- Catalogo de stacks ampliado e agrupado, com logos via CDN e fallback.
- Divisores de contato corrigidos para desktop e iOS.
- Globo 3D com texturas reais, relevo, marcador da Baixada Santista e Maps.
- Footer `MORGADO` com recorte e fade na base.
- QA publico, admin, projetos e mobile aprovado antes do push.

### `c3ba232` - Footer de assinatura

- Adicionou wordmark grande `MORGADO`, entrada GSAP e marcador ligado ao scroll.
- Incluiu responsividade e suporte a `prefers-reduced-motion`.

### `7272a10` - Editor guiado de projetos

- Dividiu criacao e edicao em Essencial, Produto, Midia e Revisao.
- Adicionou validacao, preview final e preservacao de valores entre etapas.

### `69227ba` - Galeria de projetos

- Carrossel continuo com pausa no hover, foco elevado e blur nas vizinhas.
- Clique abre modal com imagem, titulo e descricao da tela.

### `36f59c4` - Redesign e paginas de projeto

- Redesign do portfolio com GSAP e Three.js.
- Paginas individuais com produto, stacks, imagens, videos e detalhes.
- Foto real em `public/gabriel-morgado.jpg`.

## Banco de dados

Migracoes em `supabase/migrations`:

- `20260810135700_init_projects.sql`
- `20260810135800_seed_projects.sql`
- `20260810142000_add_project_cover_display.sql`
- `20260810150000_add_project_showcase_fields.sql`
- `20260810151500_add_gallery_image_sizes.sql`
- `20260811224500_add_gallery_image_descriptions.sql`
- `20260813141000_add_project_logo.sql`
- `20260813152500_create_contact_messages.sql`
- `20260813154500_contact_admin_access.sql`
- `20260813160000_contact_rate_limit.sql`
- `20260813162000_contact_notification_status.sql`
- `20260813170000_create_resume_requests.sql`
- `20260813173000_resume_access.sql`
- `20260813180000_dynamic_admin_access.sql`

A migracao das descricoes da galeria ja foi aplicada. Novas tabelas ou campos
devem usar migracao e atualizar `supabase/schema.sql` quando aplicavel.

## Ambiente e publicacao

Variaveis documentadas em `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`

Nao registrar segredos neste arquivo. O envio de e-mail devera documentar apenas
os nomes de novas variaveis, como `RESEND_API_KEY` e enderecos de envio.

Fluxo de publicacao:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. Revisar `git diff` e `git status`
5. Commit descritivo
6. Push para `main`
7. Confirmar deploy e producao antes de atualizar o status no Linear

## Regra para novas entradas

Manter este arquivo curto e sem repetir detalhes que ja estejam no Linear ou no
historico Git. Em cada ciclo, registrar somente:

- estado local ou publicado;
- arquivos ou areas afetadas;
- comportamento alterado e decisoes importantes;
- verificacoes executadas;
- commit/deploy, quando realmente concluidos;
- proximo ponto concreto de retomada.
