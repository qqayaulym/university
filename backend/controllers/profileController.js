import path from "path";
import fs from "fs";
import multer from "multer";
import { pool } from "../db.js";

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || "").toLowerCase();
    const base = `${req.user.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}${safeExt}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const fileUrlFromName = (filename) => `/uploads/${filename}`;

export const addProfilePhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл таңдалмады" });
  }

  try {
    const url = fileUrlFromName(req.file.filename);
    const created = await pool.query(
      "INSERT INTO profile_photos (user_id, url) VALUES ($1, $2) RETURNING id, url, created_at",
      [req.user.id, url]
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const getMyProfilePhotos = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, url, created_at FROM profile_photos WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const deleteMyProfilePhoto = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "id дұрыс емес" });
  }

  try {
    const existing = await pool.query(
      "SELECT id, url FROM profile_photos WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Фото табылмады" });
    }

    await pool.query("DELETE FROM profile_photos WHERE id=$1 AND user_id=$2", [id, req.user.id]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
