import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import { pool } from "./db.js"
import coursesRoutes from "./routes/courses.js"
import adminRoutes from "./routes/admin.js";

const app = express()
const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

app.use("/api/courses", coursesRoutes)

app.use("/api/admin", adminRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("HTTP server error:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL connection: OK"))
  .catch((err) => console.error("PostgreSQL connection failed:", err.message));