import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error.js";

import authRoutes from "./routes/auth.js";
import projectsRoutes from "./routes/projects.js";
import briefingsRoutes from "./routes/briefings.js";
import sitesRoutes from "./routes/sites.js";
import templatesRoutes from "./routes/templates.js";
import creditsRoutes from "./routes/credits.js";
import ordersRoutes, { adminRouter } from "./routes/orders.js";
import plansRoutes from "./routes/plans.js";
import assetsRoutes from "./routes/assets.js";
import prdRoutes from "./routes/prd.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error(`Origin não permitida: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(config.env === "production" ? "tiny" : "dev"));

  app.get("/health", (_req, res) =>
    res.json({
      status: "ok",
      app: "Publiciart Builder",
      env: config.env,
      timestamp: new Date().toISOString(),
    }),
  );

  app.use("/auth", authRoutes);
  app.use("/projects", projectsRoutes);
  app.use("/", briefingsRoutes);   // /projects/:id/briefing + /briefings/:id
  app.use("/", sitesRoutes);       // /projects/:id/site, /sites/:id, /public/sites/:slug
  app.use("/templates", templatesRoutes);
  app.use("/credits", creditsRoutes);
  app.use("/orders", ordersRoutes);
  app.use("/admin", adminRouter);
  app.use("/plans", plansRoutes);
  app.use("/assets", assetsRoutes);
  app.use("/", prdRoutes);        // /projects/:id/prd

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
