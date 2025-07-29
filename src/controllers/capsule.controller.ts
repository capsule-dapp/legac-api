import { CapsuleRepository } from "../repositories/capsule.repository";
import { HeirRepository } from "../repositories/heirs.repository";
import { CreateCapsuleSchema } from "../schemas/capsule.schema";
import { Request, Response } from "express";
import { logger } from "../config/logger";
import { Cache } from "../config/redis";
import z from "zod";

const capsuleRepository = new CapsuleRepository();
const heirRepository = new HeirRepository();
const cacheService = new Cache();

export const store = async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
        const payload = CreateCapsuleSchema.parse(req.body)
        const userId = req.user?.userId;
        if (!userId) {
            logger.warn(`Unauthorized action: cannot create capsule`);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const capsule = await cacheService.getOrSet(
            `capsule:${userId}_${payload.capsule_address}`,
            await capsuleRepository.findByUniqueIdAndAddress(payload.capsule_address, payload.capsule_unique_id),
            30
        )
        if (capsule) return res.status(400).json({message: 'capsule record already exists'})

        const heir = await cacheService.getOrSet(
            `heir_capsule:${userId}`,
            await heirRepository.find(payload.heir_id, userId),
            50
        );
        if (!heir) return res.status(400).json({message: 'Heir record not found'})

        logger.info("store capsule information")
        await capsuleRepository.create(userId, payload)
        return res.status(201).json({message: 'Capsule created successfully'})
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for creating capsule:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not store capsule record: ${error}`);
        return res.status(400).json({ error: 'Could not store capsule record' });
    }
}