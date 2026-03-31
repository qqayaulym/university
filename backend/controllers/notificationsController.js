import { pool } from "../db.js";

const ensureNotificationsSchema = async () => {
  try {
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50)");
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT");
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false");
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()");
  } catch (_err) {
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const afterIdRaw = req.query.afterId;
    const afterId = afterIdRaw !== undefined ? Number(afterIdRaw) : null;

    try {
      const result = await pool.query(
        `SELECT id, type, message, is_read, created_at
         FROM notifications
         WHERE user_id=$1
           AND ($2::int IS NULL OR id > $2)
         ORDER BY id ASC
         LIMIT 50`,
        [req.user.id, Number.isFinite(afterId) ? afterId : null]
      );
      return res.json(result.rows);
    } catch (err) {
      if (err && err.code === "42703") {
        await ensureNotificationsSchema();
        const result = await pool.query(
          `SELECT id, type, message, is_read, created_at
           FROM notifications
           WHERE user_id=$1
             AND ($2::int IS NULL OR id > $2)
           ORDER BY id ASC
           LIMIT 50`,
          [req.user.id, Number.isFinite(afterId) ? afterId : null]
        );
        return res.json(result.rows);
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const markNotificationRead = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "id дұрыс емес" });
  }

  try {
    let updated;
    try {
      updated = await pool.query(
        "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2 RETURNING id, type, message, is_read, created_at",
        [id, req.user.id]
      );
    } catch (err) {
      if (err && err.code === "42703") {
        await ensureNotificationsSchema();
        updated = await pool.query(
          "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2 RETURNING id, type, message, is_read, created_at",
          [id, req.user.id]
        );
      } else {
        throw err;
      }
    }

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Хабарландыру табылмады" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
