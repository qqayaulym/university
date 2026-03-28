import jwt from "jsonwebtoken";
const SECRET = "mysupersecret";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Нет токена" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Нет токена" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id, role: decoded.role }; 
    next();
  } catch (err) {
    res.status(403).json({ message: "Неверный токен" });
  }
};