import path from "path";
import fs from "fs";
import multer from "multer";
import sql from "../db.js";

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
    const created = await sql`INSERT INTO profile_photos (user_id, url) VALUES (${req.user.id}, ${url}) RETURNING id, url, created_at`;
    res.status(201).json(created[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const getMyProfilePhotos = async (req, res) => {
  try {
    const result = await sql`SELECT id, url, created_at FROM profile_photos WHERE user_id=${req.user.id} ORDER BY created_at DESC`;
    res.json(result);
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
    const existing = await sql`SELECT id, url FROM profile_photos WHERE id=${id} AND user_id=${req.user.id}`;

    if (existing.length === 0) {
      return res.status(404).json({ message: "Фото табылмады" });
    }

    await sql`DELETE FROM profile_photos WHERE id=${id} AND user_id=${req.user.id}`;

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
