import { pool } from "../db.js";

export const getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Тек админ қолдана алады" });
  }

  try {
    const result = await pool.query("SELECT id, username, email, role FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const updateUserRole = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Тек админ қолдана алады" });
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "creator", "admin"].includes(role)) {
    return res.status(400).json({ message: "Роль дұрыс емес" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role",
      [role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};