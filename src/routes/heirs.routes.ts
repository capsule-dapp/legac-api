import { Router } from "express";
import { index, store } from "../controllers/heirs.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

/**
* @swagger
* /heirs:
*   get:
*     summary: Retrieve heir record
*     tags: [Heirs]
*     security: [{ bearerAuth: [] }]
*     responses:
*       200:
*          description: Retrieve heir record
*          content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   fullname: { type: string }
*                   email: { type: string }
*                   title: { type: string }
*                   age: { type: number }
*                   wallet_address: { type: string }
*       201: { description: Heir record stored }
*       404: { description: No heir record found }
*       401: { description: Unauthorized access }
*/
router.get('/', authenticateToken, index);

/**
 * @swagger
 * /heirs:
 *   post:
 *     summary: Store heir record
 *     tags: [Heirs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname: { type: string }
 *               email: { type: string }
 *               title: { type: string }
 *               age: { type: number }
 *     responses:
 *       201: { description: Heir record stored }
 *       400: { description: Could not store record at the moment }
 *       401: { description: Unauthorized access }
 */
router.post('/', authenticateToken, store);

export default router;