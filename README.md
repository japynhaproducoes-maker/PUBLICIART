# Publiciart Builder

Plataforma SaaS de criação de sites com IA estratégica.
Esteira: Briefing → Análise → BRD → Recomendações → Decisão → Geração.

## Stack

- **Frontend:** React 19, TypeScript, TanStack Start, Tailwind CSS v4, Vite 8
- **Backend:** Node 20, Express, Prisma, PostgreSQL, JWT, bcrypt, Nodemailer
- **Infra:** Docker Compose (frontend + backend + postgres), pronto para Coolify

## Rodando local (sem Docker)

### Frontend

```bash
cp .env.example .env.local        # ajuste VITE_API_BASE_URL
npm install
npm run dev                       # http://localhost:5173
npm run build
npm run preview
```

Modos:
- `VITE_API_BASE_URL` **vazio** → modo **mock** (localStorage, sem backend).
- `VITE_API_BASE_URL` **preenchido** → consome backend real.

### Backend

```bash
cd backend
cp .env.example .env              # configure DATABASE_URL e JWT_SECRET
npm install
npm run prisma:generate
npm run prisma:migrate            # cria/atualiza o schema em dev
npm run prisma:seed               # opcional: planos + templates iniciais
npm run dev                       # http://localhost:4000
```

Build de produção:
```bash
npm run build
npm run start
```

## Rodando com Docker

```bash
cp .env.example .env              # preencher segredos
docker compose up --build
```

Sobe `postgres`, `backend` (porta 4000, aplica `prisma migrate deploy` no boot)
e `frontend` (porta 3000).

## Endpoints principais (backend)

- **Auth:** `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- **Projects:** `GET|POST /projects`, `GET|PATCH|DELETE /projects/:id`, `POST /projects/:id/duplicate`, `POST /projects/:id/generate-site`
- **Briefings:** `GET|POST /projects/:id/briefing`, `PATCH /briefings/:id`
- **Sites:** `GET /projects/:id/site`, `PATCH /sites/:id`, `PATCH /sites/:id/sections/:sectionId`, `POST /sites/:id/publish`, `POST /sites/:id/unpublish`, `GET /public/sites/:slug`
- **Credits:** `GET /credits/balance`, `GET /credits/transactions`, `POST /credits/estimate`, `POST /credits/consume-action`, `GET /credits/pricing-rules`, `POST /credits/top-up`
- **Plans:** `GET /plans`, `GET /plans/current`, `POST /plans/upgrade`
- **Orders:** `GET|POST /orders`, `PATCH /orders/:id/status`, `GET /admin/orders`
- **Templates:** `GET /templates`, `GET /templates/:id`
- **Health:** `GET /health` → `{ status, app, env, timestamp }`

## Modelo SaaS

- Créditos com margem mínima de **3x** garantida no backend (`backend/src/services/creditEngine.ts`).
- Limite diário de 8 ações no plano grátis.
- Domínio próprio e remoção de badge só em planos pagos.
- Site publicado depende de `subscription_status ∈ {active, trialing}`.

## Deploy

Guia completo em [DEPLOY_COOLIFY.md](./DEPLOY_COOLIFY.md). Plano de migração
de saída da Lovable em [MIGRATION_PLAN.md](./MIGRATION_PLAN.md).

## GitHub

```bash
git init
git add .
git commit -m "chore: bootstrap Publiciart Builder"
git branch -M main
git remote add origin git@github.com:SEU-USUARIO/publiciart-builder.git
git push -u origin main
```
