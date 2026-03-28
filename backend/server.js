import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import { pool } from "./db.js"
import coursesRoutes from "./routes/courses.js"
import adminRoutes from "./routes/admin.js";

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

app.use("/api/courses", coursesRoutes)

app.use("/api/admin", adminRoutes);

app.listen(8000, () => console.log("Server running on port 8000"))