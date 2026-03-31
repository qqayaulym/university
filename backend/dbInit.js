import { pool } from "./db.js";

export const initDb = async () => {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user'
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_at TIMESTAMP
      )`
    );

    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'");

    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS name VARCHAR(255)");
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS bio TEXT");
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE");
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_at TIMESTAMP");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS profile_photos (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    );

    await pool.query("ALTER TABLE profile_photos ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE");
    await pool.query("ALTER TABLE profile_photos ADD COLUMN IF NOT EXISTS url TEXT");
    await pool.query("ALTER TABLE profile_photos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()");

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

    await pool.query("ALTER TABLE course_applications ADD COLUMN IF NOT EXISTS course_id INT REFERENCES courses(id) ON DELETE CASCADE");
    await pool.query("ALTER TABLE course_applications ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE");
    await pool.query("ALTER TABLE course_applications ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'");
    await pool.query("ALTER TABLE course_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()");
    await pool.query("ALTER TABLE course_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS course_members (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(course_id, user_id)
      )`
    );

    await pool.query("ALTER TABLE course_members ADD COLUMN IF NOT EXISTS course_id INT REFERENCES courses(id) ON DELETE CASCADE");
    await pool.query("ALTER TABLE course_members ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE");
    await pool.query("ALTER TABLE course_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()");

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

    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(email)");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS course_applications_course_user_unique_idx ON course_applications(course_id, user_id)");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS course_members_course_user_unique_idx ON course_members(course_id, user_id)");
  } catch (err) {
    console.error("DB init failed:", err);
  }
};
