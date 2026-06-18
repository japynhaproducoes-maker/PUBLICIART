/**
 * Camada de serviços do Publiciart Builder.
 *
 * Esta camada define a SUPERFÍCIE estável que a UI consome.
 * Hoje delega tudo para `lib/api.ts` (mock + localStorage).
 * Amanhã: trocar internals por HTTP/Supabase/Edge sem alterar a UI.
 *
 * Regra: componentes NUNCA devem importar diretamente de `lib/api.ts` ou
 * `lib/data/store.ts`. Sempre passar pelos serviços abaixo.
 */

export { authService } from "./authService";
export { projectsService } from "./projectsService";
export { briefingsService } from "./briefingsService";
export { sitesService } from "./sitesService";
export { templatesService } from "./templatesService";
export { creditsService } from "./creditsService";
export { ordersService } from "./ordersService";
export { aiService } from "./aiService";
export { plansService } from "./plansService";
