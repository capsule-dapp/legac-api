import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { tokenInformation, walletBalance, walletTokens } from "../controllers/wallet.controller";

const router = Router();

router.get('/:address/balance', authenticateToken, walletBalance)

/**
* @swagger
* /wallets:
*   get:
*     summary: Get wallet balance
*     tags: [Wallets]
*     security: [{ bearerAuth: [] }]
*     responses:
*       200:
*          description: Get wallet total balance in USD
*          content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   mint: { type: string }
*                   decimal: { type: number }
*                   symbol: { type: string }
*                   name: { type: string }
*                   uri: { type: string }
*                   balance: { type: string }
*       401: { description: Unauthorized access }
*/
router.get('/:address/tokens', authenticateToken, walletTokens)

router.get('/:address/:mint/info', authenticateToken, tokenInformation)

export default router;