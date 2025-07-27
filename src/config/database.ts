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
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        secretKey INTEGER,
        wallet_address TEXT
      );

      CREATE TABLE IF NOT EXISTS heirs (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        title VARCHAR(60) NOT NULL,
        wallet_address VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS capsules (
        id SERIAL PRIMARY KEY,
        capsuleAddress VARCHAR(255) NOT NULL,
        unlockType VARCHAR(255),
        userId INTEGER REFERENCES users(id),
        unlockTimestamp TIMESTAMP,
        inactivityPeriod INTEGER,
        assetType VARCHAR(255)
      );
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};