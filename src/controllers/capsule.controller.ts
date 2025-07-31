import { CapsuleRepository } from "../repositories/capsule.repository";
import { HeirRepository } from "../repositories/heirs.repository";
import { CapsuleAddressSchema, CreateCapsuleSchema } from "../schemas/capsule.schema";
import { Request, Response } from "express";
import { logger } from "../config/logger";
import { Cache } from "../config/redis";
import z from "zod";
import { CapsuleService } from "../services/capsule.service";
import { UserRepository } from "../repositories/user.repository";
import { decrypt } from "../helpers/crypto";
import { PublicKey } from "@solana/web3.js";

const capsuleRepository = new CapsuleRepository();
const heirRepository = new HeirRepository();
const userRepository = new UserRepository();
const cacheService = new Cache();

export const index = async (req: Request & { user?: { userId: number } }, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create capsule`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const capsules = await cacheService.getOrSet(
        `capsules_${userId}:all`,
        await capsuleRepository.findAll(userId),
        50
    );

    return res.status(200).json(capsules)
}

export const store = async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
        const payload = CreateCapsuleSchema.parse(req.body)
        const userId = req.user?.userId;
        if (!userId) {
            logger.warn(`Unauthorized action: cannot create capsule`);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await cacheService.getOrSet(
            `user_capsule:${userId}`,
            await userRepository.findById(userId),
            50
        );

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

        const capsuleService = new CapsuleService(decrypt(user.wallet_secret));
        if (payload.capsule_type == 'cryptocurrency') {
            logger.info('creating cryptocurrency capsule')
            const response = await capsuleService.create_crypto_capsule(
                new PublicKey(user.wallet_address),
                new PublicKey(payload.asset_mint as string),
                payload.amount,
                payload.unlock_type,
                payload.unlock_timestamp ? Math.floor(payload.unlock_timestamp?.getTime() / 1000) : null,
                payload.inactivity_period ? payload.inactivity_period as number : null,
                new PublicKey(heir.wallet_address)
            )

            console.log(response)
        }

        // logger.info("store capsule information")
        // await capsuleRepository.create(userId, payload)

        // logger.info('invalidating capsule cache')
        // await cacheService.delete(`capsules_${userId}:all`)

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

export const securityQuestions = async (req: Request & { user?: { userId: number } }, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create capsule`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { capsule_address } = CapsuleAddressSchema.parse(req.params);

        logger.info('retrieving capsule record')
        const capsule = await cacheService.getOrSet(
            `capsule:${capsule_address}`,
            await capsuleRepository.findByAddress(capsule_address),
            20
        );
        if (!capsule) {
            logger.warn('capsule record not found')
            return res.status(404).json({message: 'Capsule record not found'})
        }

        logger.info('fetching security questions')
        const securityQuestions = await cacheService.getOrSet(
            `capsule:security_${capsule_address}`,
            await capsuleRepository.findSecurityQuestions(capsule.id),
            20
        );
        logger.info('successfully retrieved security questions')
        return res.status(200).json(securityQuestions)

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for retriving questions:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not retrieve security questions: ${error}`);
        return res.status(400).json({ error: 'Could not retrieve security questions' });
    }
}

export const getCapsule = async (req: Request & { user?: { userId: number } }, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create capsule`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { capsule_address } = CapsuleAddressSchema.parse(req.params);

        logger.info('retrieving capsule record')
        const capsule = await cacheService.getOrSet(
            `capsule:${capsule_address}`,
            await capsuleRepository.findByAddress(capsule_address),
            20
        );
        if (!capsule) {
            logger.warn('capsule record not found')
            return res.status(404).json({message: 'Capsule record not found'})
        }

        logger.info('successfully retrieved capsule')
        return res.status(200).json(capsule)

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for retriving questions:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not retrieve security questions: ${error}`);
        return res.status(400).json({ error: 'Could not retrieve security questions' });
    }
}