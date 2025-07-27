import { Router } from "express";
import { index, store } from "../controllers/heirs.controller";

const router = Router();

router.get('/', index);

/**
 * @swagger
 * /heirs:
 *   post:
 *     summary: Store heir record
 *     tags: [Heirs]
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
 *     responses:
 *       201: { description: Heir record stored }
 *       400: { description: Heir record stored }
 *       401: { description: Unauthorized access }
 */
router.post('/', store);

export default router;