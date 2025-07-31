import { Router } from "express";
import { getCapsule, index, securityQuestions, store } from "../controllers/capsule.controller";
import { authenticateToken, restrictToRole } from "../middlewares/auth.middleware";

const router = Router();

/**
* @swagger
* /capsules:
*   get:
*     summary: Retrieve user capsules
*     tags: [Capsules]
*     security: [{ bearerAuth: [] }]
*     responses:
*       200:
*          description: Retrieve user capsules
*          content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   id: { type: number }
*                   capsule_type: { type: string }
*                   capsule_unique_id: { type: string }
*                   capsule_address: { type: string }
*                   heir_id: { type: number }
*       401: { description: Unauthorized access }
*/
router.get(
    '/',
    authenticateToken,
    restrictToRole(['user']),
    index
)

/**
 * @swagger
 * /capsules:
 *   post:
 *     summary: Create a new capsule
 *     description: |
 *       Creates a new capsule for the authenticated user, linked to their Solana wallet and an heir.
 *       The `unlock_type` determines whether `unlock_timestamp` (for time-based) or `inactivity_period` (for inactivity-based) is required.
 *       At least one security question with an answer is required.
 *     tags: [Capsules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capsule_type
 *               - capsule_unique_id
 *               - capsule_address
 *               - heir_id
 *               - unlock_type
 *               - security_questions
 *             properties:
 *               capsule_type:
 *                 type: string
 *                 description: The type of capsule (e.g., "vault", "legacy").
 *               capsule_unique_id:
 *                 type: string
 *                 description: A unique identifier for the capsule.
 *               capsule_address:
 *                 type: string
 *                 description: The Solana address of the capsule.
 *               heir_id:
 *                 type: integer
 *                 description: The ID of the heir associated with the capsule.
 *               unlock_type:
 *                 type: string
 *                 enum: [timebased, inactivity]
 *                 description: The type of unlock condition ("timebased" or "inactivity").
 *               unlock_timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Required for "timebased" unlock; must be a future ISO date-time (e.g., 2025-12-31T23:59:59Z).
 *               inactivity_period:
 *                 type: integer
 *                 description: Required for "inactivity" unlock; must be a positive integer in seconds (e.g., 604800 for 7 days).
 *               security_questions:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of security questions and answers (at least one required).
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - answer
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: The security question (must be non-empty).
 *                     answer:
 *                       type: string
 *                       description: The answer to the security question (must be non-empty).
 *               document_uri:
 *                 type: string
 *                 nullable: true
 *                 description: URI of a document associated with the capsule (optional, must be non-empty if provided).
 *               message:
 *                 type: string
 *                 nullable: true
 *                 description: A message for the heir (optional, must be non-empty if provided).
 *               asset_mint:
 *                 type: string
 *                 nullable: true
 *                 description: The Solana mint address of the asset (optional, must be non-empty if provided).
 *               amount:
 *                 type: number
 *                 nullable: true
 *                 description: The amount of the asset (optional, must be non-negative if provided).
 *     responses:
 *       201:
 *         description: Capsule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the capsule.
 *                 capsule_type:
 *                   type: string
 *                   description: The type of capsule.
 *                 capsule_unique_id:
 *                   type: string
 *                   description: The unique identifier for the capsule.
 *                 capsule_address:
 *                   type: string
 *                   description: The Solana address of the capsule.
 *                 heir_id:
 *                   type: integer
 *                   description: The ID of the heir.
 *                 unlock_type:
 *                   type: string
 *                   enum: [timebased, inactivity]
 *                   description: The unlock condition type.
 *                 unlock_timestamp:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: The unlock timestamp for time-based capsules.
 *                 inactivity_period:
 *                   type: integer
 *                   nullable: true
 *                   description: The inactivity period in seconds for inactivity-based capsules.
 *                 document_uri:
 *                   type: string
 *                   nullable: true
 *                   description: The URI of the associated document.
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: The message for the heir.
 *                 asset_mint:
 *                   type: string
 *                   nullable: true
 *                   description: The Solana mint address of the asset.
 *                 amount:
 *                   type: number
 *                   nullable: true
 *                   description: The amount of the asset.
 *                 security_questions:
 *                   type: array
 *                   description: Array of security questions and answers.
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                         description: The security question.
 *                       answer:
 *                         type: string
 *                         description: The answer to the security question.
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user who created the capsule.
 *       400:
 *         description: Validation failed or error in capsule creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Validation error details (if applicable).
 *       401:
 *         description: Unauthorized (missing or invalid JWT)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
router.post(
    '/',
    authenticateToken,
    restrictToRole(['user']),
    store
)

/**
* @swagger
* /capsules/{capsule_address}:
*   get:
*     summary: Retrieve a capsule
*     tags: [Capsules]
*     security: [{ bearerAuth: [] }]
*     parameters:
*       - in: path
*         name: capsule_address
*         schema:
*           type: string
*         required: true
*     responses:
*       200:
*          description: Retrieve a capsule
*          content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   id: { type: number }
*                   capsule_type: { type: string }
*                   capsule_unique_id: { type: string }
*                   capsule_address: { type: string }
*                   heir_id: { type: number }
*       401: { description: Unauthorized access }
*       404: { description: Capsule not found }
*/
router.get(
    '/:capsule_address',
    authenticateToken,
    restrictToRole(['user', 'role']),
    getCapsule
)

/**
* @swagger
* '/capsules/{capsule_address}/security-questions':
*   get:
*     summary: Get capsule security questions
*     tags: [Capsules]
*     security: [{ bearerAuth: [] }]
*     parameters:
*       - in: path
*         name: capsule_address
*         schema:
*           type: string
*         required: true
*     responses:
*       200:
*          description: Get capsule security questions
*          content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   security_questions:
*                       type: array
*                       description: Array of security questions and answers.
*                       items:
*                           type: object
*                           properties:
*                               question:
*                                   type: string
*                                   description: The security question.
*                               answer:
*                                   type: string
*                                   description: The answer to the security question.
*       401: { description: Unauthorized access }
*       400: { description: Capsule Not found }
*/
router.get(
    '/:capsule_address/security-questions',
    authenticateToken,
    restrictToRole(['user', 'role']),
    securityQuestions
)

export default router;