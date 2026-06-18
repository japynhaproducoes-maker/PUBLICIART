# Plano de Migração — Saída da Lovable

O Publiciart Builder foi nascido na Lovable e agora roda 100% independente.
Este documento registra o que foi removido, o que foi mantido e os passos
de validação antes/depois de cada deploy.

## O que foi removido

- `@lovable.dev/vite-tanstack-config` (devDependency).
- Wrappers de error reporting específicos da Lovable.
- Excludes da Lovable em `bunfig.toml`.
- Referências técnicas à Lovable em config e README.

## O que foi preservado

- Todas as rotas, páginas, componentes, estilos e dados de seed.
- Backend Express + Prisma completo, com Auth, Projects, Briefings, Sites,
  Templates, Credits, Orders, Plans, Assets.
- Engine de créditos com margem mínima 3x (frontend e backend).
- Esteira estratégica: Briefing → Análise → BRD → Recomendações → Decisão
  → Geração.
- Admin com auditoria de créditos e margem.
- Modo mock via `VITE_API_BASE_URL` vazio (continua funcionando sem backend).

## Checklist — Build local

- [ ] `npm install` na raiz roda sem erros.
- [ ] `npm run dev` abre em `http://localhost:5173`.
- [ ] `npm run build` gera `.output/` sem erros.
- [ ] `npm run preview` serve o build.
- [ ] `cd backend && npm install` roda sem erros.
- [ ] `npm run prisma:generate` gera o Prisma Client.
- [ ] `npm run build && npm run start` sobe a API em `:4000`.
- [ ] `GET http://localhost:4000/health` retorna `status: ok`.

## Checklist — GitHub

- [ ] `.gitignore` cobre `node_modules`, `dist`, `.output`, `.env`, `.wrangler`.
- [ ] `.env` **não** está commitado (apenas `.env.example`).
- [ ] `JWT_SECRET` e senhas reais **não** estão no repo.
- [ ] Branch `main` protegida (recomendado).
- [ ] README + DEPLOY_COOLIFY commitados.

## Checklist — Coolify

- [ ] App criado apontando para o repo + branch `main`.
- [ ] Build pack = Docker Compose, arquivo = `docker-compose.yml`.
- [ ] Variáveis preenchidas (ver `.env.example`).
- [ ] Domínios configurados em `frontend` (3000) e `backend` (4000).
- [ ] Primeiro deploy concluído sem erro.
- [ ] `GET /health` no domínio do backend retorna OK.
- [ ] Frontend carrega a landing pública.

## Pós-deploy

- [ ] Rodar `npx prisma db seed` dentro do container backend (opcional —
      planos e templates iniciais).
- [ ] Criar primeiro usuário admin manualmente no banco
      (`UPDATE "User" SET role='admin' WHERE email='...';`).
- [ ] Configurar SMTP real para envio de reset de senha.
- [ ] Configurar provedor de IA real (`AI_PROVIDER=openai|gemini|...`).
- [ ] Configurar storage S3/R2 para assets em produção.
- [ ] Integrar gateway de pagamento (Stripe/Mercado Pago) no
      `POST /plans/upgrade` e `POST /credits/top-up`.
- [ ] Monitorar margem via tela admin de créditos.
