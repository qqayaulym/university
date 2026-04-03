import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../db.js";
const SECRET = "mysupersecret";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${hashed})`;
    res.status(201).json({ message: "Пайдаланушы құрылды" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = result[0];

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
    const result = await sql`SELECT id, username, email, role FROM users WHERE id = ${req.user.id}`;
    const user = result[0];

    if (!user) return res.status(404).json({ message: "Пайдаланушы табылмады" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const updateMe = async (req, res) => {
  const { username, email } = req.body;
  try {
    const result = await sql`
      UPDATE users SET username = ${username}, email = ${email}
      WHERE id = ${req.user.id}
      RETURNING id, username, email, role
    `;
    res.json(result[0]);
  } catch (err) {
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
    const result = await sql`SELECT password FROM users WHERE id = ${req.user.id}`;
    const user = result[0];

    if (!user) return res.status(404).json({ message: "Пайдаланушы табылмады" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Ағымдағы құпиясөз қате" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password = ${hashed} WHERE id = ${req.user.id}`;

    res.json({ message: "Құпиясөз жаңартылды" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
