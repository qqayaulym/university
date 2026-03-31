import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DB_URL;

const useSsl =
  String(process.env.DB_SSL).toLowerCase() === "true" ||
  Boolean(connectionString && /supabase\.co/i.test(connectionString));

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "courseProject",
        password: process.env.DB_PASSWORD || "123456",
        port: Number(process.env.DB_PORT) || 5433,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
);