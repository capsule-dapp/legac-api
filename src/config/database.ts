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
        wallet_address TEXT,
        wallet_secret TEXT,
        security_pin TEXT,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(60) UNIQUE NOT NULL,
        code TEXT NOT NULL,
        expires_in TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS heirs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        title VARCHAR(60) NOT NULL,
        age INTEGER NOT NULL,
        state VARCHAR(70) NOT NULL,
        country VARCHAR(70) NOT NULL,
        dob VARCHAR(100) NOT NULL,
        wallet_address TEXT NOT NULL,
        wallet_secret TEXT NOT NULL,
        temporary_password TEXT,
        checked_in TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS capsules (
        id SERIAL PRIMARY KEY,
        capsule_type VARCHAR(255),
        capsule_unique_id VARCHAR(255) NOT NULL UNIQUE,
        capsule_address TEXT NOT NULL,
        status VARCHAR(50) CHECK (status IN ('locked', 'pending', 'claimed')) DEFAULT 'locked',
        heir_id INTEGER NOT NULL REFERENCES heirs(id) ON DELETE RESTRICT,
        security_question_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_capsules (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        capsule_id INTEGER NOT NULL REFERENCES capsules(id) ON DELETE RESTRICT,
        UNIQUE(user_id, capsule_id)
      );

      CREATE TABLE IF NOT EXISTS capsule_security_questions (
        id SERIAL PRIMARY KEY,
        capsule_id INTEGER NOT NULL REFERENCES capsules(id) ON DELETE RESTRICT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};