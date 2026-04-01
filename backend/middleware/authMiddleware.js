import jwt from "jsonwebtoken";
import sql from "../db.js";
const SECRET = "mysupersecret";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Токен жоқ" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Токен жоқ" });

  (async () => {
    try {
      const decoded = jwt.verify(token, SECRET);
      const userId = Number(decoded.id);

      if (!Number.isFinite(userId)) {
        return res.status(403).json({ message: "Токен қате" });
      }

      const result = await sql`SELECT role FROM users WHERE id = ${userId}`;
      const user = result[0];

      if (!user) {
        return res.status(401).json({ message: "Пайдаланушы табылмады" });
      }

      req.user = { id: userId, role: user.role };
      next();
    } catch (_err) {
      res.status(403).json({ message: "Токен қате" });
    }
  })();
};
