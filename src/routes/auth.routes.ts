import { Router } from 'express';
import { register, login, updateWallet, refreshToken, getAuthenticatedUser } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: User created }
 *       400: { description: User already exists }
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/update-wallet:
 *   post:
 *     summary: Update wallet address and secret key
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress: { type: string }
 *     responses:
 *       200: { description: Wallet updated }
 *       400: { description: Wallet address already set or invalid request }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 */
router.post('/update-wallet', authenticateToken, updateWallet);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New access token generated }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Fetch authenticated user details
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Authenticated user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: number }
 *                 email: { type: string }
 *                 walletAddress: { type: string, nullable: true }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 *       400: { description: Failed to fetch user details }
 */
router.get('/me', authenticateToken, getAuthenticatedUser);

export default router;