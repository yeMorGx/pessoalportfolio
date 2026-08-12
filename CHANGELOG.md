# CHANGELOG - Continuidade do projeto

Este arquivo e a fonte de contexto para continuar o portfolio em outro chat,
outra IA ou outro dispositivo. Leia junto com `AGENTS.md` antes de alterar o
codigo.

## Como retomar

1. Ler `AGENTS.md` e este arquivo por completo.
2. Executar `git status --short` antes de editar qualquer arquivo.
3. Preservar mudancas locais que nao pertencem a tarefa atual.
4. Consultar primeiro **Trabalho em andamento** e **Decisoes pendentes**.
5. Atualizar este arquivo sempre que o codigo, banco, configuracao, assets ou
   comportamento forem alterados.

## Estado atual

- Data do registro: 2026-08-12.
- Branch: `main`.
- Ultimo commit funcional publicado: `a14d95c`
  (`feat: refine portfolio experience and admin`).
- Documento de continuidade publicado inicialmente no commit `2e8a69f`.
- Deploy: Vercel conectado a `main`; o lote `a14d95c` foi enviado e verificado
  em producao em 2026-08-12.
- Producao: `https://pessoalportfolio.vercel.app`, respondendo `200` e servindo
  o novo header e a localizacao da Baixada Santista.
- Banco e autenticacao: Supabase Postgres, Auth e Storage.
- Contato provisorio: `gabrielmcgoes@gmail.com`.
- Contato futuro: `contact@gabrielmorgado.dev` quando o dominio for comprado.
- Redes: GitHub `https://github.com/yeMorGx` e LinkedIn
  `https://www.linkedin.com/in/gabrielmcgoes`.
- O arquivo gerado `tsconfig.tsbuildinfo` esta modificado localmente e nao deve
  ser incluido em commit sem necessidade.

## Lote publicado em 2026-08-12

As mudancas abaixo foram publicadas no commit funcional `a14d95c` depois das
verificacoes descritas nesta secao.

### Continuidade entre IAs e dispositivos

- Arquivos: `CHANGELOG.md` e `AGENTS.md`.
- Este documento foi criado como fonte de passagem de contexto.
- O `AGENTS.md` agora obriga futuras IAs a ler e atualizar o changelog em
  qualquer alteracao do projeto.
- Esta documentacao e os itens tecnicos seguintes estao publicados no
  repositorio.

### Logo 3D metalico

- Arquivo: `src/components/three/LogoScene.tsx`.
- As tres camadas extrudadas que se atravessavam durante o scroll foram
  substituidas por uma unica peca 3D.
- Material metalico claro com reflexo mint e luz coral sutil.
- O movimento por ponteiro e scroll foi preservado.
- Validado visualmente no inicio do hero e durante o scroll; canvas visivel e
  sem intersecoes entre camadas.

### Header publico

- Arquivo: `src/components/sections/SiteHeader.tsx`.
- Removidos todos os links publicos para `/admin`.
- A rota `/admin` continua existente e protegida pelo middleware; subdominio
  pode ser avaliado no futuro, mas nao e necessario para seguranca.
- Novo header modular com navegacao numerada e CTA de contato no desktop.
- Menu mobile foi simplificado e nao expoe o painel administrativo.
- Header validado visualmente em desktop.

### Estabilidade do editor de projetos

- Arquivo: `src/components/admin/AdminProjects.tsx`.
- O modal nao fecha mais ao clicar no fundo escuro.
- Na etapa de revisao, o modal permaneceu aberto apos avancar, esperar seis
  segundos e clicar fora.
- Saidas permitidas: botoes explicitos, tecla Escape ou salvamento.

### Redesign da pagina administrativa

- Arquivo: `src/components/admin/AdminProjects.tsx`.
- Nova estrutura de console editorial com identidade e navegacao lateral.
- Indicadores de projetos publicados, destaques e imagens de galeria.
- Busca por titulo, slug ou tecnologia.
- Filtro entre todos os projetos e destaques.
- Lista mostra ordem, capa, rota, stacks, quantidade de telas, status e acoes.
- Validada visualmente em desktop e mobile; busca testada com sucesso.

### Divisores da secao de contato

- Arquivos: `src/components/sections/Contact.tsx` e
  `src/components/sections/FooterWordmark.tsx`.
- A lista de Email, GitHub e LinkedIn agora usa uma unica moldura horizontal;
  os itens internos possuem apenas um divisor, evitando emendas ou linhas
  interrompidas no iOS.
- Removida a borda inferior duplicada do wordmark. A linha animada com o
  marcador coral passou a ser o unico fechamento visual do bloco `MORGADO`.
- O fundo do novo header foi corrigido para manter o contraste sobre a secao
  clara de contato, inclusive no Safari/iOS.
- A altura de linha do wordmark foi normalizada para impedir recortes nas
  letras arredondadas junto a regua inferior.
- QA em viewport de iPhone confirmou linhas alinhadas e ausencia de overflow
  horizontal.
- `npm run lint`, `npm run typecheck` e `git diff --check` aprovados depois do
  ajuste. `npm run build` tambem aprovado e a alteracao esta publicada.

### Localizacao 3D e recorte do footer

- Arquivos: `src/components/three/LocationGlobe.tsx`,
  `src/components/sections/FooterLocation.tsx`, `Contact.tsx` e
  `FooterWordmark.tsx`.
- Nova faixa clicavel de localizacao com globo 3D metalico, continentes em
  pontos, grade geografica e marcador na Baixada Santista.
- O bloco identifica Santos / Sao Vicente e abre o Google Maps nas
  coordenadas aproximadas `-23.962, -46.363`.
- O wordmark `MORGADO` agora termina recortado e desaparece por mascara suave
  na base, seguindo a referencia sem copiar sua composicao.
- O globo reage de forma sutil ao ponteiro e permanece estatico quando o
  usuario prefere movimento reduzido. Sua geometria tambem e descartada ao
  sair da pagina para evitar acumulo de memoria.
- QA visual aprovado em desktop e viewport de iPhone. O globo, o marcador, o
  recorte do wordmark e o link do Google Maps renderizaram sem sobreposicao ou
  overflow horizontal.
- Ajuste posterior solicitado pelo usuario: a superficie abstrata preta e os
  continentes aproximados foram substituidos por texturas terrestres reais de
  cor e relevo, armazenadas localmente em `public/earth-atmos-2048.jpg` e
  `public/earth-normal-2048.jpg`.
- A grade tecnica foi suavizada, a iluminacao foi recalibrada e a orientacao
  inicial agora coloca a Baixada Santista na face visivel do globo. O marcador
  coral e a interacao por ponteiro foram preservados.
- QA visual confirmou continentes e relevo reconheciveis, com a America do Sul
  e o marcador coral visiveis no enquadramento. O ultimo ajuste clareou a
  textura, reduziu o reflexo verde e manteve a direcao escura do componente.
- `npm run lint`, `npm run typecheck`, `git diff --check` e `npm run build`
  aprovados depois da troca da superficie. Alteracao publicada.

### Catalogo ampliado de tecnologias

- Arquivos: `src/components/admin/AdminProjects.tsx` e
  `src/components/ui/StackLogo.tsx`.
- O primeiro estagio do editor de projetos agora organiza as sugestoes em
  Frontend, Backend, Mobile, Dados, Plataforma e APIs e Seguranca.
- Foram adicionadas opcoes como Tailwind CSS, Vue.js, Angular, Svelte, Node.js,
  Java, Spring Boot, C#, .NET, Go, Ruby, Perl, Flutter, MongoDB, Redis, Docker,
  Kubernetes e provedores de nuvem, entre outras.
- O campo livre continua disponivel para qualquer tecnologia fora do catalogo.
- As novas opcoes usam logos via CDN quando ha um icone correspondente e
  mantem o fallback textual para tecnologias personalizadas. AWS e Azure usam
  o catalogo Dashboard Icons porque nao estao disponiveis nos identificadores
  atuais do Simple Icons.
- Selecao multipla validada com Tailwind CSS e Go; o campo foi atualizado para
  `Tailwind CSS, Go` e ambos os botoes mantiveram o estado selecionado.
- Layout aprovado em desktop e viewport mobile de 390 x 844, sem overflow
  horizontal. A rota temporaria `src/app/qa-stacks/page.tsx` foi removida apos
  o teste. O cache correspondente em `.next/types/app/qa-stacks` tambem foi
  removido.
- `npm run lint`, `npm run typecheck` e `npm run build` aprovados apos a
  remocao da rota de QA. Alteracao publicada.

### Verificacoes ja executadas nessas mudancas

- `npm run typecheck`: aprovado na rodada final de 2026-08-12.
- `npm run lint`: aprovado; a compilacao de producao tambem repetiu a
  verificacao de lint e tipos com sucesso.
- `npm run build`: aprovado na rodada final de 2026-08-12, com as oito paginas
  geradas e sem erro de compilacao.
- `git diff --check`: aprovado, sem erros de espaco em branco.
- QA visual do 3D, header, modal e admin realizado no navegador local.
- QA final do rodape realizado em viewport mobile de 390 x 844: dois canvases
  3D carregados, nenhum erro ou aviso no navegador e link de localizacao
  apontando para `https://www.google.com/maps/search/?api=1&query=-23.962,-46.363`.
- Uma rota temporaria `src/app/qa-admin/page.tsx` foi criada para testes e ja
  foi removida. O cache correspondente em `.next/types/app/qa-admin` tambem
  foi removido.
- Uma nova rodada completa devera ser executada depois que as decisoes de
  contato e curriculo forem implementadas.

### QA consolidado do lote - 2026-08-12

- Pagina publica validada em desktop: dois canvases 3D renderizados, logo
  metalico sem camadas se atravessando, globo de localizacao visivel, nenhuma
  imagem quebrada, nenhum link publico para `/admin` e ausencia de overflow
  horizontal.
- Pagina publica validada em viewport mobile de 390 x 844: hero 3D enquadrado,
  dois canvases carregados, nenhuma imagem quebrada e menu movel abrindo e
  fechando com Sobre, Projetos, Stack e Contato.
- Pagina de projeto validada em desktop e mobile sem overflow ou imagens
  quebradas. O modal da galeria abriu com imagem, titulo, descricao e controle
  de fechamento corretos.
- Os projetos atuais do Supabase possuem uma tela de galeria cada. Por isso, o
  loop automatico com multiplas imagens nao foi reexecutado neste QA
  consolidado; o comportamento havia sido validado no trabalho anterior do
  carrossel e seu codigo nao foi alterado neste lote.
- A rota `/admin` redirecionou corretamente para `/admin/login`. Os campos de
  e-mail e senha continuam obrigatorios e o acesso Google aponta para
  `/auth/google`. Nenhum erro ou aviso apareceu no navegador.
- O painel autenticado e o editor guiado ja haviam sido validados por rota
  temporaria de QA, removida depois do teste. Nesta rodada nao foi realizada
  autenticacao real nem alteracao de dados no Supabase.
- `npm run lint`, `npm run typecheck` e `npm run build` ja estavam aprovados
  depois da ultima mudanca de codigo. Depois deles, somente este planejamento e
  os resultados de QA foram adicionados ao changelog.
- O usuario aprovou o lancamento. O commit `a14d95c` foi enviado para `main` e
  a pagina publica da Vercel confirmou a nova versao com resposta `200`.

## Decisoes pendentes do usuario

Ordem definida pelo usuario em 2026-08-12: o formulario de contato e o fluxo
de curriculo para recrutadores serao as duas ultimas funcionalidades. Como o
site ainda esta em teste, essas decisoes nao bloqueiam o fechamento e a
publicacao do conjunto visual e administrativo que ja esta pronto.

Quando essas duas etapas finais forem retomadas, ainda sera necessario:

1. Autorizar e configurar **Resend + Supabase** para o formulario de contato.
2. Confirmar os dados exigidos na solicitacao de curriculo e a aprovacao
   manual no admin.
3. Enviar o curriculo em PDF para testar o download protegido final.

Recomendacao atual:

- Usar Resend para e-mail transacional e Supabase para armazenar mensagens,
  solicitacoes, status de aprovacao e tokens de download.
- Enquanto `gabrielmorgado.dev` nao estiver comprado e verificado, o Resend
  fica limitado ao fluxo de testes. Depois, usar
  `contact@gabrielmorgado.dev` como remetente.
- A "comprovacao" do recrutador deve ser coleta de sinais e revisao manual,
  nao uma promessa automatica de validar juridicamente uma empresa.

## Proximos passos planejados

1. Como penultima funcionalidade, implementar o formulario de contato com
   envio, feedback e protecao contra abuso.
2. Como ultima funcionalidade, implementar solicitacao, aprovacao e download
   protegido do curriculo para recrutadores.
3. Executar QA final dos fluxos de contato e curriculo antes da publicacao
   definitiva dessas funcionalidades.

## Funcionalidades publicadas importantes

### Commit `a14d95c` - experiencia publica e admin refinados

- Logo 3D consolidado em uma unica peca metalica.
- Header publico reorganizado sem expor o acesso ao admin.
- Painel administrativo redesenhado e editor de projetos estabilizado.
- Catalogo ampliado de tecnologias com grupos e logos.
- Divisores da secao de contato corrigidos para desktop e iOS.
- Localizacao 3D da Baixada Santista com texturas terrestres reais, marcador
  coral e link para o Google Maps.
- Footer `MORGADO` recortado com fade na base.
- Lint, typecheck, build e QA visual desktop/mobile aprovados antes do push.

### Commit `c3ba232` - footer de assinatura

- Footer existente preservado.
- Wordmark grande `MORGADO`, com `G` coral.
- Entrada com GSAP e marcador ligado ao scroll.
- Layout responsivo e suporte a `prefers-reduced-motion`.

### Commit `7272a10` - editor guiado de projetos

- Modal de criacao e edicao dividido em quatro etapas: Essencial, Produto,
  Midia e Revisao.
- Validacao nativa antes de avancar.
- Preview final com card, links, stacks, status e galeria.
- Valores preservados ao voltar entre etapas.

### Commit `69227ba` - carrossel da galeria

- Carrossel continuo com pausa no hover.
- Imagem em foco sobe e as vizinhas recebem blur.
- Clique abre modal explicativo da tela.
- Descricoes da galeria armazenadas no projeto.

### Commit `36f59c4` - redesign e pagina de projeto

- Redesign completo do portfolio com GSAP e Three.js.
- Paginas individuais de projeto com produto, stack, imagens, videos e
  informacoes detalhadas.
- Foto real de Gabriel em `public/gabriel-morgado.jpg`.

## Banco de dados

Migracoes presentes em `supabase/migrations`:

- `20260810135700_init_projects.sql`
- `20260810135800_seed_projects.sql`
- `20260810142000_add_project_cover_display.sql`
- `20260810150000_add_project_showcase_fields.sql`
- `20260810151500_add_gallery_image_sizes.sql`
- `20260811224500_add_gallery_image_descriptions.sql`

A migracao de descricoes da galeria foi aplicada ao projeto Supabase durante o
trabalho anterior. Qualquer nova tabela deve ser criada por migracao e refletida
em `supabase/schema.sql` quando aplicavel.

## Ambiente e publicacao

Variaveis documentadas em `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`

Nao registrar os valores reais neste arquivo. Futuramente, o envio de e-mail
deve adicionar ao exemplo apenas os nomes das variaveis necessarias, como
`RESEND_API_KEY` e enderecos de remetente/destino.

Fluxo de publicacao usado no projeto:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. Revisao de `git diff` e `git status`
5. Commit descritivo
6. Push para `main`, acionando o deploy da Vercel

## Regra para novas entradas

Ao alterar o projeto, atualizar no minimo:

- **Estado atual**, se branch, commit ou deploy mudarem.
- **Trabalho em andamento**, enquanto algo estiver local.
- **Funcionalidades publicadas**, depois do push.
- **Decisoes pendentes** e **Proximos passos**, quando o plano mudar.
- Verificacoes executadas e qualquer risco ou bloqueio ainda existente.
