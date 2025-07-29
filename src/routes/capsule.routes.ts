import { Router } from "express";
import { store } from "../controllers/capsule.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /capsules:
 *   post:
 *     summary: Store a capsule record
 *     tags: [Capsules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capsule_type: { type: string }
 *               capsule_unique_id: { type: string }
 *               capsule_address: { type: string }
 *               heir_id: { type: number }
 *               multisig_enabled: { type: boolean }
 *     responses:
 *       201: { description: Capsule record stored }
 *       400: { description: Could not store capsule record }
 *       401: { description: Unauthorized access }
 */
router.post('/', authenticateToken, store)

export default router;