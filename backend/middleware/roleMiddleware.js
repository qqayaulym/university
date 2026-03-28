export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Доступ запрещен" });
  next();
};

export const requireCreator = (req, res, next) => {
  if (req.user.role !== "creator" && req.user.role !== "admin")
    return res.status(403).json({ message: "Доступ запрещен" });
  next();
};