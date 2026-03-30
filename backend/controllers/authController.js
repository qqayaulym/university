import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = "mysupersecret"; 

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashed]
    );
    res.status(201).json({ message: "Пайдаланушы құрылды" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Пайдаланушы табылмады" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Құпиясөз дұрыс емес!" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id=$1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пайдаланушы табылмады" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const updateMe = async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: "Пайдаланушы аты және email міндетті" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET username=$1, email=$2 WHERE id=$3 RETURNING id, username, email, role",
      [username.trim(), email.trim(), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пайдаланушы табылмады" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (String(err.message).toLowerCase().includes("unique")) {
      return res.status(400).json({ message: "Бұл email бос емес" });
    }
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Құпиясөздер міндетті" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Жаңа құпиясөз кемінде 6 таңба болуы керек" });
  }

  try {
    const result = await pool.query("SELECT password FROM users WHERE id=$1", [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Пайдаланушы табылмады" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Ағымдағы құпиясөз қате" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashed, req.user.id]);

    res.json({ message: "Құпиясөз жаңартылды" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};