import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../services/email.service';
import { JwtService } from '../services/jwt.service';
import { Request, Response } from 'express';
import { config } from '../config/config';
import { logger } from '../config/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod'

import {
  LoginSchema,
  RegisterSchema,
  UpdateWalletSchema
} from '../schemas/auth.schema';

const userRepository = new UserRepository();
const emailService = new EmailService();
const jwtService = new JwtService();

export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, email, password } = RegisterSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ fullname, email, password: hashedPassword });

    // generate access and refresh tokens
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Send welcome email
    await emailService.sendWelcomeEmail(email, email.split('@')[0]);

    logger.info(`User registered: ${email} (ID: ${user.id})`);
    return res.status(201).json({ message: 'User created', accessToken, refreshToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`validation failed for creating heirs: ${z.prettifyError(error)}`)
      return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
    }
    logger.error(`Registration failed: ${error}`);
    return res.status(400).json({ error: 'User already exists' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await userRepository.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      logger.warn(`Invalid login attempt for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // generate access and refresh token
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    logger.info(`User logged in: ${email} (ID: ${user.id})`);
    return res.json({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`validation failed for creating heirs: ${z.prettifyError(error)}`)
      return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
    }
    logger.error(`Login failed: ${error}`);
    return res.status(400).json({ error: 'Login failed' });
  }
};

export const updateWallet = async (req: Request & { user?: { userId: number } }, res: Response) => {
  try {
    const { walletAddress } = UpdateWalletSchema.parse(req.body);
    const userId = req.user?.userId;
    if (!userId) {
      logger.warn(`Unauthorized wallet update attempt`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await userRepository.updateWalletAddress(userId, walletAddress);
    if (!user) {
      logger.warn(`User not found for wallet update: ID ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet_address && user.wallet_address !== walletAddress) {
      logger.info(`Wallet update skipped for user ID ${userId}: wallet already set to ${user.wallet_address}`);
      return res.status(400).json({ error: 'Wallet address already set and cannot be updated' });
    }
    logger.info(`Wallet updated for user ID ${userId}`);
    return res.json({ message: 'Wallet updated' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.warn(`validation failed for creating heirs: ${z.prettifyError(error)}`)
      return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
    }
    logger.error(`Wallet update failed for user: ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: number };
    const isValid = await jwtService.validateRefreshToken(refreshToken);
    if (!isValid) {
      logger.warn(`Invalid refresh token for user ID ${decoded.userId}`);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwtService.generateAccessToken(decoded.userId);
    logger.info(`Access token refreshed for user ID ${decoded.userId}`);
    return res.json({ accessToken });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`validation failed for creating heirs: ${z.prettifyError(error)}`)
      return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
    }
    logger.error(`Refresh token failed: ${error}`);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const getAuthenticatedUser = async (req: Request & { user?: { userId: number } }, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    logger.warn(`Unauthorized attempt to fetch user details`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      logger.warn(`User not found for ID ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Fetched details for user ID ${userId}: ${user.email}, ${user.wallet_address}`);
    return res.json({
      id: user.id,
      email: user.email,
      walletAddress: user.wallet_address,
    });
  } catch (error: any) {
    logger.error(`Failed to fetch user details for ID ${userId}: ${error.message}`);
    return res.status(400).json({ error: 'Failed to fetch user details' });
  }
};