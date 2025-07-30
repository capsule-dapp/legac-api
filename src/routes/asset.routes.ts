import { Router } from "express";
import { nfts, tokens } from "../controllers/assets.controller";

const router = Router();

/**
* @swagger
* /assets/{address}/tokens:
*   get:
*     summary: Get wallet tokens
*     tags: [Assets]
*     parameters:
*       - in: path
*         name: address
*         schema:
*           type: string
*         required: true
*     responses:
*       200:
*          description: Get wallet tokens
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
router.get('/:address/tokens', tokens)

/**
* @swagger
* /assets/{address}/nfts:
*   get:
*     summary: Get wallet NFTs
*     tags: [Assets]
*     parameters:
*       - in: path
*         name: address
*         schema:
*           type: string
*         required: true
*     responses:
*       200:
*          description: Get wallet NFTs
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
router.get('/:address/nfts', nfts)

// router.get('/:mint/price', tokenPrice)

export default router;