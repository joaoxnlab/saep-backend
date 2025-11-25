import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_PORT = process.env.DB_PORT ? 
    Number(process.env.DB_PORT) : undefined;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: DB_PORT,
});

export default pool;