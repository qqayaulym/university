import sql from "../db.js";

const ensureNotificationsSchema = async () => {
  try {
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50)`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()`;
  } catch (_err) {
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const afterIdRaw = req.query.afterId;
    const afterId = afterIdRaw !== undefined ? Number(afterIdRaw) : null;

    try {
      const result = await sql`
        SELECT id, type, message, is_read, created_at
         FROM notifications
         WHERE user_id=${req.user.id}
           AND (${Number.isFinite(afterId) ? sql`id > ${afterId}` : sql`true`})
         ORDER BY id ASC
         LIMIT 50
      `;
      return res.json(result);
    } catch (err) {
      if (err && err.code === "42703") {
        await ensureNotificationsSchema();
        const result = await sql`
          SELECT id, type, message, is_read, created_at
           FROM notifications
           WHERE user_id=${req.user.id}
             AND (${Number.isFinite(afterId) ? sql`id > ${afterId}` : sql`true`})
           ORDER BY id ASC
           LIMIT 50
        `;
        return res.json(result);
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const clearMyNotifications = async (req, res) => {
  try {
    await sql`DELETE FROM notifications WHERE user_id=${req.user.id}`;
    res.json({ message: "Хабарландырулар тазартылды" });
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
      updated = await sql`
        UPDATE notifications SET is_read=true WHERE id=${id} AND user_id=${req.user.id} RETURNING id, type, message, is_read, created_at
      `;
    } catch (err) {
      if (err && err.code === "42703") {
        await ensureNotificationsSchema();
        updated = await sql`
          UPDATE notifications SET is_read=true WHERE id=${id} AND user_id=${req.user.id} RETURNING id, type, message, is_read, created_at
        `;
      } else {
        throw err;
      }
    }

    if (updated.length === 0) {
      return res.status(404).json({ message: "Хабарландыру табылмады" });
    }

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
