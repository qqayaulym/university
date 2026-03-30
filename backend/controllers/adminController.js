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
    res.status(500).json({ message: "Сервер қатесі", error: err.message });
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

  if (isNaN(Number(id))) {
    return res.status(400).json({ message: "Қолданушы ID дұрыс емес" });
  }

  try {
    const targetUserResult = await pool.query(
      "SELECT id, role FROM users WHERE id=$1",
      [id]
    );

    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ message: "Қолданушы табылмады" });
    }

    const targetUser = targetUserResult.rows[0];

    if (Number(req.user.id) === Number(id) && role !== "admin") {
      return res.status(400).json({ message: "Өз рөліңізді admin-нан түсіре алмайсыз" });
    }

    if (targetUser.role === role) {
      const sameRoleUser = await pool.query(
        "SELECT id, username, email, role FROM users WHERE id=$1",
        [id]
      );
      return res.json(sameRoleUser.rows[0]);
    }

    const result = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role",
      [role, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі", error: err.message });
  }
};