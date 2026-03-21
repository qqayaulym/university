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

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};