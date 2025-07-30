import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { sendSOL, sendSPLToken, walletInfo } from "../controllers/wallet.controller";

const router = Router();

/**
 * @swagger
 * /wallets/info:
 *   get:
 *     summary: Fetch authenticated user wallet info
 *     tags: [Wallets]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Get wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance: { type: number }
 *                 balanceInUSD: { type: number }
 *                 solanaPrice: { type: number }
 *                 solanaPriceInUSD: { type: number }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 *       400: { description: Failed to fetch wallet info }
 */
router.get('/info', authenticateToken, walletInfo)

/**
 * @swagger
 * /wallets/transfer:
 *   post:
 *     summary: Transfer funds to a wallet
 *     tags: [Wallets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination: { type: string }
 *               amount: { type: integer }
 *     responses:
 *       200: { description: Funds transferred successfully }
 *       400: { description: Could not store record at the moment }
 *       404: { description: User not found }
 *       401: { description: Unauthorized access }
 */
router.post('/transfer', authenticateToken, sendSOL)

/**
 * @swagger
 * /wallets/transfer-nft:
 *   post:
 *     summary: Transfer NFT
 *     tags: [Wallets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination: { type: string }
 *               mint: { type: string }
 *     responses:
 *       200: { description: Funds transferred successfully }
 *       400: { description: Could not store record at the moment }
 *       404: { description: User not found }
 *       401: { description: Unauthorized access }
 */
router.post('/transfer-nft', authenticateToken, sendSOL)

/**
 * @swagger
 * /wallets/transfer-spl:
 *   post:
 *     summary: Transfer SPL tokens
 *     tags: [Wallets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination: { type: string }
 *               amount: { type: integer }
 *               mint: { type: string }
 *     responses:
 *       200: { description: Funds transferred successfully }
 *       400: { description: Could not store record at the moment }
 *       404: { description: User not found }
 *       401: { description: Unauthorized access }
 */
router.post('/transfer-spl', authenticateToken, sendSPLToken)

export default router;