import type { ProjectStatus } from "./types";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  briefing_pending: "Briefing pendente",
  generating: "Gerando",
  editing: "Em edição",
  review: "Em revisão",
  published: "Publicado",
  archived: "Arquivado",
};

export type StatusTone = "neutral" | "brand" | "success" | "warning" | "violet" | "gold";

export const PROJECT_STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  draft: "neutral",
  briefing_pending: "warning",
  generating: "violet",
  editing: "brand",
  review: "gold",
  published: "success",
  archived: "neutral",
};

export const PROJECT_STATUS_DOT: Record<ProjectStatus, string> = {
  draft: "bg-muted-foreground",
  briefing_pending: "bg-warning",
  generating: "bg-violet",
  editing: "bg-brand",
  review: "bg-gold",
  published: "bg-success",
  archived: "bg-muted-foreground/60",
};

export const KANBAN_COLUMNS: { id: ProjectStatus; title: string; sub: string }[] = [
  { id: "briefing_pending", title: "Novo briefing", sub: "Aguardando respostas" },
  { id: "generating", title: "Gerando site", sub: "IA trabalhando" },
  { id: "editing", title: "Ajustes", sub: "Edição em curso" },
  { id: "review", title: "Revisão final", sub: "Aprovação do cliente" },
  { id: "published", title: "Publicado", sub: "No ar" },
  { id: "archived", title: "Upsell e extras", sub: "Pós-publicação" },
];
