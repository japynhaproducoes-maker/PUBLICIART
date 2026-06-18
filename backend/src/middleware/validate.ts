import type { RequestHandler } from "express";
import type { ZodTypeAny, z } from "zod";

type Source = "body" | "query" | "params";

export const validate =
  <S extends ZodTypeAny>(schema: S, source: Source = "body"): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) return next(parsed.error);
    (req as unknown as Record<Source, z.infer<S>>)[source] = parsed.data;
    next();
  };
