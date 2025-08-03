import { Router } from 'express';
import { register, login, refreshToken, getAuthenticatedUser, verifyEmail, createWallet, setPin, heirLogin, verifyPin } from '../controllers/auth.controller';
import { authenticateToken, restrictToRole } from '../middlewares/auth.middleware';

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
 *               fullname: { type: string }
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
 * /auth/heir-login:
 *   post:
 *     summary: Login heir
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
 *               capsule_address: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/heir-login', heirLogin);

/**
 * @swagger
 * /auth/create-wallet:
 *   post:
 *     summary: Create wallet address and secret key
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wallet Created }
 *       400: { description: Wallet address already set or invalid request }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 */
router.post('/create-wallet', authenticateToken, createWallet);

/**
 * @swagger
 * /auth/set-pin:
 *   post:
 *     summary: Set security pin
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin: { type: string }
 *     responses:
 *       200: { description: Security pin saved }
 *       400: { description: Security pin set or invalid request }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 */
router.post('/set-pin', authenticateToken, setPin);

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
 * /auth/verify-email:
 *   post:
 *     summary: Verify email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/verify-email', verifyEmail)

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
 *                 role: { type: string }
 *                 email: { type: string }
 *                 walletAddress: { type: string, nullable: true }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 *       400: { description: Failed to fetch user details }
 */
router.get('/me', authenticateToken, restrictToRole(['user', 'heir']), getAuthenticatedUser);

/**
 * @swagger
 * /auth/verify-pin:
 *   post:
 *     summary: Verify security pin
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               security_pin: { type: string }
 *     responses:
 *       200: { description: Security pin verified }
 *       401: { description: Invalid security pin }
 */
router.post('/verify-pin', authenticateToken, verifyPin)

export default router;