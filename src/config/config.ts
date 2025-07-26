import dotenv from 'dotenv';
import { Connection } from '@solana/web3.js'

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/database',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || 'your_email@gmail.com',
  smtpPass: process.env.SMTP_PASS || 'your_app_specific_password',
  rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
};

export const connection = new Connection(config.rpcEndpoint)