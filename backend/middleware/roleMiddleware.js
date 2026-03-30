export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Қол жеткізуге тыйым салынған" });
  next();
};

export const requireCreator = (req, res, next) => {
  if (req.user.role !== "creator" && req.user.role !== "admin")
    return res.status(403).json({ message: "Қол жеткізуге тыйым салынған" });
  next();
};