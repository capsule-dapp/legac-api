import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized access' });

  try {
    const verified = jwt.verify(token, config.jwtSecret) as { userId: number; role: string };
    if (!verified) return res.status(401).json({ error: 'Unauthorized access' });
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

export const restrictToRole = (roles: string[]) => {
  return (req: Request & { user?: { userId: number; role: string } }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access restricted to ${roles.join(' or ')} roles` });
    }

    next();
  };
};