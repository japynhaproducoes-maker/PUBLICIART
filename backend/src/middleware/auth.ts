import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "./error.js";
import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "UNAUTHORIZED", "Token ausente."));
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role as UserRole };
    next();
  } catch {
    next(new HttpError(401, "UNAUTHORIZED", "Token inválido ou expirado."));
  }
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "UNAUTHORIZED", "Sem sessão."));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "FORBIDDEN", "Permissão insuficiente."));
    }
    next();
  };
