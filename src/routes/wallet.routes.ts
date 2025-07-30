import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { sendSOL, walletInfo } from "../controllers/wallet.controller";

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

export default router;