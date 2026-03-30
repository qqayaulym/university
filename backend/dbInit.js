import { pool } from "./db.js";

export const initDb = async () => {
  try {
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_at TIMESTAMP");
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_at TIMESTAMP");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS profile_photos (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS course_applications (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(course_id, user_id)
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS course_members (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(course_id, user_id)
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    );

    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50)");
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT");
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false");
    await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()");
  } catch (err) {
    console.error("DB init failed:", err);
  }
};
