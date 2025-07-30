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
  VerifyEmailSchema
} from '../schemas/auth.schema';
import { OtpRepository } from '../repositories/otp.repository';
import { WalletService } from '../services/wallet.service';
import { encrypt } from '../helpers/crypto';

const userRepository = new UserRepository();
const walletService = new WalletService();
const otpRepository = new OtpRepository();
const emailService = new EmailService();
const jwtService = new JwtService();

export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, email, password } = RegisterSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ fullname, email, password: hashedPassword });

    // store otp data
    const expires_in = new Date(Date.now() + 60 * 60 * 1000)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await otpRepository.create(email, code, expires_in)

    // generate access and refresh tokens
    const accessToken = jwtService.generateAccessToken(user.id, 'user');
    const refreshToken = jwtService.generateRefreshToken(user.id);

    await emailService.sendVerificationEmail(email, fullname, code)

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

    if (!user.email_verified)
        return res.status(400).json({message: 'Email address not verified'})

    // generate access and refresh token
    const accessToken = jwtService.generateAccessToken(user.id, 'user');
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

export const createWallet = async (req: Request & { user?: { userId: number; role: string } }, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    logger.warn(`Unauthorized wallet update attempt`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      logger.warn(`User not found: ID ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet_address != null) {
      logger.warn('wallet alreay generated for account')
      return res.status(400).json({message: 'Wallet already generated for account'})
    }

    logger.info('Generating wallet for user')
    const generatedWallet = walletService.create();
    await userRepository.updateWalletAddress(
      userId,
      generatedWallet.publicKey,
      encrypt(generatedWallet.secretKey)
    )

    logger.info(`Wallet updated for user ID ${userId}`);
    return res.json({ message: 'Wallet created' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.warn(`validation failed for creating heirs: ${z.prettifyError(error)}`)
      return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
    }
    logger.error(`Wallet update failed for user: ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = VerifyEmailSchema.parse(req.body);

    logger.info('verify that user with email exists')
    const user = await userRepository.findByEmail(email)
    if (!user) {
      logger.warn('User not found')
      return res.status(400).json({message: 'No account associated with email found'})
    }

    if (user.email_verified) {
      logger.warn(`Email verification failed: Email verified for ${email}`)
      return res.status(400).json({ error: 'Email already verified' });
    }

    logger.info('Retrieve otp information');
    const record = await otpRepository.findByEmail(email)
    if (!record) {
      logger.warn('Otp record not found')
      return res.status(400).json({message: 'invalid request'})
    }

    if (code !== record.code) {
      logger.warn(`Email verification failed: Invalid OTP for user ID ${user.id}`);
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    logger.info('update user email status')
    await userRepository.updateEmailStatus(email)

    logger.info('delete otp record')
    await otpRepository.delete(email)
    return res.status(200).json({message: 'Email verified successfully'})
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`validation failed for creating heirs: ${z.prettifyError(error)}`)
      return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
    }
    logger.error(`Email verification failed: ${error}`);
    res.status(400).json({ error: 'Email verification failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: number };
    const isValid = await jwtService.validateRefreshToken(refreshToken);
    if (!isValid) {
      logger.warn(`Invalid refresh token for user ID ${decoded.userId}`);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwtService.generateAccessToken(decoded.userId, 'user');
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