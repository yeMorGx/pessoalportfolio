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
- Ultimo commit publicado: `c3ba232` (`feat: add signature footer wordmark`).
- Deploy: Vercel conectado a `main`; o deploy do commit acima foi acionado.
- Producao conhecida: `https://pessoalportfolio.vercel.app`.
- Banco e autenticacao: Supabase Postgres, Auth e Storage.
- Contato provisorio: `gabrielmcgoes@gmail.com`.
- Contato futuro: `contact@gabrielmorgado.dev` quando o dominio for comprado.
- Redes: GitHub `https://github.com/yeMorGx` e LinkedIn
  `https://www.linkedin.com/in/gabrielmcgoes`.
- O arquivo gerado `tsconfig.tsbuildinfo` esta modificado localmente e nao deve
  ser incluido em commit sem necessidade.

## Trabalho em andamento - local / nao publicado

As mudancas abaixo estao no workspace, passaram pelas verificacoes descritas,
mas ainda nao receberam commit nem push.

### Continuidade entre IAs e dispositivos

- Arquivos: `CHANGELOG.md` e `AGENTS.md`.
- Este documento foi criado como fonte de passagem de contexto.
- O `AGENTS.md` agora obriga futuras IAs a ler e atualizar o changelog em
  qualquer alteracao do projeto.
- Esta documentacao sera publicada separadamente; os itens tecnicos seguintes
  continuarao locais ate a conclusao do fluxo em andamento.

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

### Verificacoes ja executadas nessas mudancas

- `npm run typecheck`: aprovado apos remover a rota temporaria de QA.
- `npm run lint`: aprovado antes do ultimo ajuste documental.
- QA visual do 3D, header, modal e admin realizado no navegador local.
- Uma rota temporaria `src/app/qa-admin/page.tsx` foi criada para testes e ja
  foi removida. O cache correspondente em `.next/types/app/qa-admin` tambem
  foi removido.
- Ainda falta executar a rodada final de lint, typecheck e build depois que as
  proximas decisoes forem implementadas.

## Decisoes pendentes do usuario

O trabalho parou aguardando estas respostas:

1. Autorizar **Resend + Supabase** para formulario de contato e notificacoes.
2. Confirmar se a solicitacao de curriculo deve exigir e-mail corporativo,
   empresa, site ou LinkedIn e justificativa, com aprovacao manual no admin.
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

1. Receber as tres respostas acima.
2. Criar formulario de contato no site, com feedback de envio e protecao
   contra abuso.
3. Criar tabela e fluxo de solicitacao de curriculo no Supabase.
4. Adicionar uma fila de solicitacoes ao admin, com aprovar e recusar.
5. Gerar link de download temporario somente apos aprovacao.
6. Executar QA completo de desktop, mobile, autenticacao, envio e download.
7. Rodar lint, typecheck e build.
8. Atualizar este arquivo, criar commit e enviar para `main` somente depois da
   aprovacao do usuario.

## Funcionalidades publicadas importantes

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
