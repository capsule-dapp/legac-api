import { config } from './config';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        secretKey INTEGER,
        wallet_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS heirs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        title VARCHAR(60) NOT NULL,
        age INTEGER NOT NULL,
        wallet_address TEXT NOT NULL,
        wallet_secret TEXT NOT NULL,
        temporary_password TEXT,
        password_expiry TIMESTAMP,
        checked_in TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS capsules (
        id SERIAL PRIMARY KEY,
        capsule_type VARCHAR(255),
        capsule_unique_id VARCHAR(255) NOT NULL,
        capsule_address TEXT NOT NULL,
        heir_id INTEGER NOT NULL REFERENCES heirs(id) ON DELETE RESTRICT,
        multisig_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_capsules (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        capsule_id INTEGER NOT NULL REFERENCES capsules(id) ON DELETE RESTRICT,
        UNIQUE(user_id, capsule_id)
      );
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};