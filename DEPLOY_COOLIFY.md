# Deploy do Publiciart Builder no Coolify

Este guia leva do ZIP no GitHub até o ambiente rodando em VPS via Coolify
usando o `docker-compose.yml` na raiz do projeto.

## 1. Subir o repositório no GitHub

```bash
git init
git add .
git commit -m "chore: initial deploy"
git branch -M main
git remote add origin git@github.com:SEU-USUARIO/publiciart-builder.git
git push -u origin main
```

> Confira que `.env`, `node_modules`, `.output`, `dist`, `.wrangler` e
> `backend/dist` estão no `.gitignore` antes de subir.

## 2. Criar o app no Coolify

1. No painel: **+ New → Resource → Application**.
2. Source: **GitHub** (autorize a Lovable App ou GitHub App padrão).
3. Repositório: `SEU-USUARIO/publiciart-builder`, branch `main`.
4. Build pack: **Docker Compose**.
5. Compose file path: `docker-compose.yml`.

O Coolify detectará 3 serviços: `postgres`, `backend`, `frontend`.

## 3. Variáveis de ambiente

Cole no painel (Environment Variables) o conteúdo de `.env.example`
adaptado. Obrigatórias em produção:

- `APP_URL` — URL pública do site (ex.: `https://app.seudominio.com`)
- `VITE_APP_URL` — mesma URL acima (build-time)
- `VITE_API_BASE_URL` — URL pública do backend (ex.: `https://api.seudominio.com`)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL` — `postgresql://USER:PASS@postgres:5432/DB`
- `JWT_SECRET` — string aleatória ≥ 32 caracteres
- `SMTP_*` — opcional (sem SMTP, link de reset cai no log)
- `AI_PROVIDER`, `AI_API_KEY`, `AI_API_URL` — opcional (`mock` por padrão)

## 4. Migrations Prisma

O container `backend` roda `npx prisma migrate deploy` automaticamente no
start (ver `backend/Dockerfile`). Para forçar manualmente:

```bash
# dentro do container backend
npx prisma migrate deploy
npx prisma db seed     # opcional
```

## 5. Domínios

No Coolify, em cada serviço:
- `frontend` → domínio principal (`app.seudominio.com`), porta `3000`.
- `backend` → subdomínio de API (`api.seudominio.com`), porta `4000`.

O Coolify emite TLS via Let's Encrypt automaticamente.

## 6. Logs e healthchecks

- Backend: `GET https://api.seudominio.com/health` deve retornar
  `{ "status": "ok", "app": "Publiciart Builder", ... }`.
- Frontend: a home `/` deve carregar a landing.
- Logs: aba **Logs** de cada serviço no Coolify.

## 7. Testes pós-deploy

- Cadastro de usuário → login → acessa `/app`.
- Criar projeto → preencher briefing → gerar site (consumirá créditos
  via `POST /credits/consume-action`).
- Publicar site → abrir `https://api.seudominio.com/public/sites/<slug>`.
- Admin → conferir auditoria de créditos.

## 8. Atualizações

Push na branch `main` → Coolify faz build e redeploy automaticamente
(habilite Auto Deploy nas configurações do app).
