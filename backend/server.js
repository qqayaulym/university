import express from "express"
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js"
import { pool } from "./db.js"
import { initDb } from "./dbInit.js";
import coursesRoutes from "./routes/courses.js"
import adminRoutes from "./routes/admin.js";
import courseApplicationsRoutes from "./routes/courseApplications.js";
import notificationsRoutes from "./routes/notifications.js";
import profileRoutes from "./routes/profile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes)

app.use("/api/courses", coursesRoutes)

app.use("/api/course-applications", courseApplicationsRoutes);

app.use("/api/notifications", notificationsRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/admin", adminRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
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

const start = async () => {
  await initDb();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    console.error("HTTP server error:", err);
  });
};

start();