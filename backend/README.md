# Publiciart Builder — API

Backend REST do Publiciart Builder. Node.js + Express + Prisma + PostgreSQL +
JWT + S3-compatible storage. Independente da Lovable, pronto pra rodar em VPS,
Render, Railway, Fly.io ou Docker.

## Stack
- Node.js 20+
- Express 4
- Prisma 5 + PostgreSQL
- JWT (jsonwebtoken) + bcryptjs
- Zod (validação)
- Helmet, CORS, Morgan
- AWS SDK v3 (S3, R2, MinIO, Spaces)

## Como rodar

```bash
# 1. Instalar
cd backend
npm install
cp .env.example .env

# 2. Subir Postgres (exemplo via Docker)
docker run -d --name pg-publiciart -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16

# 3. Migrar + seed
npm run prisma:migrate -- --name init
npm run seed

# 4. Dev
npm run dev

# 5. Build/start (produção)
npm run build
npm start
```

API sobe em `http://localhost:4000`. Health: `GET /health`.

Usuário admin do seed: `admin@publiciart.app` / `admin123`
Usuário demo: `demo@publiciart.app` / `demo123`

## Variáveis de ambiente

Ver `.env.example`. Principais:

| Variável            | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `PORT`              | Porta HTTP (default 4000)                  |
| `CORS_ORIGIN`       | CSV de origens permitidas (`*` libera)     |
| `DATABASE_URL`      | Connection string Postgres                 |
| `JWT_SECRET`        | Segredo para assinar tokens                |
| `JWT_EXPIRES_IN`    | Ex. `7d`, `12h`                            |
| `S3_*`              | Bucket S3-compatível (R2, MinIO, Spaces)   |
| `AI_PROVIDER`       | `mock` (default) ou provider real          |

## Endpoints

### Auth
- `POST /auth/register` `{ name, email, password }`
- `POST /auth/login` `{ email, password }` → `{ token, user }`
- `POST /auth/logout` (stateless — remover token no client)
- `GET /auth/me` (Bearer)

### Projects (Bearer)
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:id/duplicate`

### Briefings (Bearer)
- `GET /projects/:id/briefing`
- `POST /projects/:id/briefing` (upsert)
- `PATCH /briefings/:id`

### Sites
- `GET /projects/:id/site` (Bearer)
- `POST /projects/:id/generate-site` (Bearer, cobra 10 créditos)
- `PATCH /sites/:id` (Bearer)
- `PATCH /sites/:id/sections/:sectionId` (Bearer)
- `POST /sites/:id/publish` (Bearer)
- `POST /sites/:id/unpublish` (Bearer)
- `GET /public/sites/:slug` (público)

### Templates
- `GET /templates` (filtro `?segment=`)
- `GET /templates/:id`

### Credits (Bearer)
- `GET /credits/balance`
- `GET /credits/transactions`
- `POST /credits/consume` `{ amount, description }`

### Orders
- `GET /orders` (Bearer)
- `POST /orders` (Bearer)
- `PATCH /orders/:id/status` (admin) — `{ status, quoted_price?, admin_notes? }`
- `GET /admin/orders` (admin)

### Plans
- `GET /plans`
- `GET /plans/current` (Bearer)
- `POST /plans/upgrade` (Bearer) — `{ plan_id }` (mock; integrar Stripe/MP)

### Assets (Bearer)
- `POST /assets/upload` (multipart `file`, body: `type`, `project_id?`)
- `GET /assets?project_id=`
- `DELETE /assets/:id`

## Autenticação
JWT via header `Authorization: Bearer <token>`. Payload: `{ sub, role }`.
Middlewares:
- `requireAuth` — exige token válido.
- `requireRole('admin')` — restringe por role.

Roles: `user`, `agency`, `admin`.

## Tratamento de erros
Todas as respostas de erro seguem:
```json
{ "code": "VALIDATION", "message": "…", "details": { } }
```
Códigos: `VALIDATION`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`CONFLICT`, `INSUFFICIENT_CREDITS`, `INTERNAL`.

## Deploy

### Render / Railway
- Build: `npm install && npm run build && npx prisma migrate deploy`
- Start: `npm start`
- Configurar `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `S3_*`.

### VPS (PM2)
```bash
npm install && npm run build && npx prisma migrate deploy
pm2 start dist/server.js --name publiciart-api
```

### Docker (sugestão)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json prisma ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 4000
CMD ["npm","start"]
```

## Conectando ao frontend
No frontend (`src/config/app.ts` do Publiciart Builder), defina:

```
VITE_API_BASE_URL="https://api.seudominio.com"
```

A camada `src/lib/api/` já detecta `isRemote` e passa a chamar este backend
automaticamente, sem alterações na UI.

## Próximos passos
- Integrar provider de IA real em `src/services/aiGenerator.ts`.
- Integrar Stripe/Mercado Pago em `POST /plans/upgrade`.
- Endpoint de presigned URL para uploads grandes.
- Refresh tokens / revogação.
- Rate limiting (`express-rate-limit`).
- Testes (Vitest + Supertest).
