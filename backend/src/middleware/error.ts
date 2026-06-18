import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ code: "NOT_FOUND", message: "Rota não encontrada." });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      code: "VALIDATION",
      message: "Dados inválidos.",
      details: err.flatten(),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }
  // Prisma known errors
  const anyErr = err as { code?: string; meta?: unknown; message?: string };
  if (anyErr?.code === "P2002") {
    return res.status(409).json({ code: "CONFLICT", message: "Registro já existe.", details: anyErr.meta });
  }
  if (anyErr?.code === "P2025") {
    return res.status(404).json({ code: "NOT_FOUND", message: "Registro não encontrado." });
  }
  console.error("[unhandled]", err);
  res.status(500).json({ code: "INTERNAL", message: "Erro interno do servidor." });
};
