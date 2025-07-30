import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { walletInfo } from "../controllers/wallet.controller";

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

export default router;