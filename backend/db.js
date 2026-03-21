import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'courseProject',
  password: '123456',
  port: 5433
});