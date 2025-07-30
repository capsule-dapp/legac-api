import { pool } from '../config/database';
import { QueryResult } from 'pg';
import { RegisterRequest } from '../schemas/auth.schema';

interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  security_pin?: string;
  email_verified: boolean;
  wallet_address?: string;
}

export class UserRepository {
  async create(user: RegisterRequest): Promise<User> {
    const query = `
      INSERT INTO users (fullname, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [user.fullname, user.email, user.password];
    const result: QueryResult<User> = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: QueryResult<User> = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result: QueryResult<User> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateEmailStatus(email: string) {
    const query = `
      UPDATE users SET email_verified = $1
      WHERE email = $2
    `
    await pool.query(query, [true, email])
  }

  async updateWalletAddress(userId: number, wallet_address: string, wallet_secret: string): Promise<User> {
    const query = `
      UPDATE users
      SET wallet_address = $1, wallet_secret = $2
      WHERE id = $3
    `;
    const values = [wallet_address, wallet_secret, userId];
    const result: QueryResult<User> = await pool.query(query, values);
    return result.rows[0];
  }

  async updateSecurityPin(userId: number, security_pin: string): Promise<User> {
    const query = `
      UPDATE users
      SET security_pin = $1
      WHERE id = $2
    `;
    const values = [security_pin, userId];
    const result: QueryResult<User> = await pool.query(query, values);
    return result.rows[0];
  }
}