import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { config } from '../config/config';

interface TokenPayload {
  userId: number;
}

export class JwtService {

  generateAccessToken(userId: number): string {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
  }

  generateRefreshToken(userId: number): string {
    return jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: '7d' });
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      jwt.verify(refreshToken, config.jwtRefreshSecret);
      return true;
    } catch (error) {
      return false;
    }
  }
}