# Supabase setup

## Com CLI

1. Gere um access token em https://supabase.com/dashboard/account/tokens.
2. Rode `npx supabase login`.
3. Rode `npm run db:link`.
4. Digite a senha do Postgres quando a CLI pedir.
5. Rode `npm run db:push` para aplicar as migrations, incluindo os projetos iniciais.

O project ref ja foi preenchido no script `db:link`.

## Sem CLI

1. Abra o projeto no Supabase.
2. Va em SQL Editor.
3. Rode o conteudo de `schema.sql`.
4. Rode o conteudo de `seed.sql` para criar os projetos iniciais.
5. Em Authentication, crie o usuario admin por email/senha.

O bucket usado pelo painel chama `project-covers`.

## Google SSO

1. No Google Cloud Console, crie um OAuth Client ID do tipo Web application.
2. Em Authorized JavaScript origins, adicione a origem do app, por exemplo `http://localhost:3002`.
3. Em Authorized redirect URIs, adicione o callback mostrado pelo Supabase na pagina do provedor Google.
4. No Supabase Dashboard, va em Authentication > Sign In / Providers > Google.
5. Ative o provider e cole o Client ID e Client Secret do Google.
6. Em Authentication > URL Configuration, adicione `http://localhost:3002/auth/callback` em Redirect URLs.
7. No `.env`, preencha `ADMIN_EMAIL` com o email Google que pode acessar o painel.
