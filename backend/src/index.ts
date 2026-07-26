import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import cvRoutes from "./routes/cv.routes";
import interviewRoutes from "./routes/interview.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import historyRoutes from "./routes/history.routes";
import questionBankRoutes from "./routes/questionBank.routes";
import { initSocket } from "./socket";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/question-bank", questionBankRoutes);

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  },
);

initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Backend + Socket.IO chạy tại http://localhost:${PORT}`);
});
