import { pool } from '../config/database';
import { QueryResult } from 'pg';

interface User {
  id: number;
  email: string;
  password: string;
  secretKey?: string;
  wallet_address?: string;
}

export class UserRepository {
  async create(user: Omit<User, 'id'>): Promise<User> {
    const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [user.email, user.password];
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
    console.log(result)
    return result.rows[0] || null;
  }

  async updateWalletAddress(userId: number, walletAddress: string): Promise<User> {
    const query = `
      UPDATE users
      SET wallet_address = CASE
        WHEN wallet_address IS NULL THEN COALESCE($1, wallet_address)
        ELSE wallet_address
      END
      WHERE id = $2
      RETURNING *;
    `;
    const values = [walletAddress, userId];
    const result: QueryResult<User> = await pool.query(query, values);
    return result.rows[0];
  }
}