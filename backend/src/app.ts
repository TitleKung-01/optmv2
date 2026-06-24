import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { requireAuth } from "./middleware/auth";
import apiRoutes from "./routes";
import { lineWebhookHandler } from "./controllers/notify.controller";

const app = express();

app.use(corsMiddleware);

// LINE webhook ต้อง access raw body สำหรับตรวจสอบ signature
app.use(
  "/api/notify/webhook",
  express.raw({ type: "application/json" }),
  (req, _res, next) => {
    (req as express.Request & { rawBody?: string }).rawBody =
      req.body.toString("utf8");
    req.body = JSON.parse(req.body.toString("utf8"));
    next();
  },
  lineWebhookHandler,
);

app.use(express.json());
app.use("/api", requireAuth as express.RequestHandler);
app.use("/api", apiRoutes);

export default app;
