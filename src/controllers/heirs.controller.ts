import { HeirRepository } from '../repositories/heirs.repository';
import { WalletService } from '../services/wallet.service';
import { createHeirSchema } from '../schemas/heirs.schema';
import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { Cache } from '../config/redis'
import { z } from 'zod'

const heirRepository = new HeirRepository();
const walletService = new WalletService();
const cacheService = new Cache();

export const index = async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            logger.warn(`Unauthorized action: cannot create heir`);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const heir = await cacheService.getOrSet(
            `heir:${userId}`,
            await heirRepository.findByUser(userId),
            50
        );
        if (!heir) {
            logger.warn(`Could not find any heir record`);
            return res.status(404).json({ error: 'No heir records found' });
        }

        res.status(200).json({...heir});
    } catch (error) {
        logger.error(`could not retrieve heir record: ${error}`);
        res.status(400).json({ error: 'Could not retrieve heir record' });
    }
}

export const store = async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
        const { fullname, email, title, age } = createHeirSchema.parse(req.body);
        const userId = req.user?.userId;
        if (!userId) {
            logger.warn(`Unauthorized action: cannot create heir`);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const heir = await cacheService.getOrSet(
            `heir:${userId}`,
            await heirRepository.findByUser(userId),
            50
        );
        if (heir) {
            logger.warn(`Heir record previously stored`);
            return res.status(401).json({ error: 'User can only store a single heir' });
        }

        logger.info("generate new wallet for beneficiary");
        const wallet = walletService.create()

        logger.info("storing heir record")
        logger.info(`${fullname} ${email}, ${title}, ${age}, ${userId}, ${wallet.publicKey}, ${wallet.secretKey}`)
        const newHeir = await heirRepository.create({fullname, email, title, age}, userId, wallet.publicKey, wallet.secretKey);
        if (!newHeir) {
            logger.warn("Could not create heir record")
            res.status(500).json({error: 'could not create heir at the moment, try again later'})
        }

        res.status(201).json({message: 'heir record stored'});
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for creating heirs:\n ${z.prettifyError(error)}`)
            res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not store heir record: ${error}`);
        res.status(400).json({ error: 'Could not store heir record' });
    }
}