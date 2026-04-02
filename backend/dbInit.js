import sql from "./db.js";

export const initDb = async () => {
  try {
    console.log("Database initialization started...");

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        who_created INTEGER REFERENCES users(id),
        start_at TIMESTAMP,
        deadline TIMESTAMP,
        course_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Migration: add course_type if it doesn't exist yet
    await sql`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type VARCHAR(100)
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS course_members (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(course_id, user_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS course_applications (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS profile_photos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("Database initialization completed successfully");
  } catch (err) {
    console.error("DB init failed:", err);
  }
};