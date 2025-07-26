import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../services/email.service';
import { JwtService } from '../services/jwt.service';
import { validatePublicKey } from '../helpers/utils';
import { Request, Response } from 'express';
import { config } from '../config/config';
import { logger } from '../config/logger';
import * as web3 from '@solana/web3.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userRepository = new UserRepository();
const emailService = new EmailService();
const jwtService = new JwtService();

export const register = async (req: Request, res: Response) => {
  const { email, password, secretKey, walletAddress } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, password: hashedPassword });

    // generate access and refresh tokens
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Send welcome email
    await emailService.sendWelcomeEmail(email, email.split('@')[0]);

    logger.info(`User registered: ${email} (ID: ${user.id})`);
    res.status(201).json({ message: 'User created', accessToken, refreshToken });
  } catch (error) {
    logger.error(`Registration failed for ${email}: ${error}`);
    res.status(400).json({ error: 'User already exists' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await userRepository.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      logger.warn(`Invalid login attempt for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // generate access and refresh token
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    logger.info(`User logged in: ${email} (ID: ${user.id})`);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error(`Login failed for ${email}: ${error}`);
    res.status(400).json({ error: 'Login failed' });
  }
};

export const updateWallet = async (req: Request & { user?: { userId: number } }, res: Response) => {
  const { walletAddress } = req.body;
  const userId = req.user?.userId;
  if (!userId) {
    logger.warn(`Unauthorized wallet update attempt`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (!validatePublicKey(walletAddress)) {
      return res.status(400).json({message: 'wallet address is invalid'})
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
    res.json({ message: 'Wallet updated' });
  } catch (error: any) {
    logger.error(`Wallet update failed for user ID ${userId}: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    logger.warn(`Refresh token missing in request`);
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: number };
    const isValid = await jwtService.validateRefreshToken(refreshToken);
    if (!isValid) {
      logger.warn(`Invalid refresh token for user ID ${decoded.userId}`);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwtService.generateAccessToken(decoded.userId);
    logger.info(`Access token refreshed for user ID ${decoded.userId}`);
    res.json({ accessToken });
  } catch (error) {
    logger.error(`Refresh token failed: ${error}`);
    res.status(401).json({ error: 'Invalid refresh token' });
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
    console.log(user)
    logger.info(`Fetched details for user ID ${userId}: ${user.email}, ${user.wallet_address}`);
    res.json({
      id: user.id,
      email: user.email,
      walletAddress: user.wallet_address,
    });
  } catch (error: any) {
    logger.error(`Failed to fetch user details for ID ${userId}: ${error.message}`);
    res.status(400).json({ error: 'Failed to fetch user details' });
  }
};