import { Request, Response } from "express";
import { logger } from "../config/logger";
import { UserRepository } from "../repositories/user.repository";
import { Cache } from "../config/redis";
import { WalletService } from "../services/wallet.service";

const userRepository = new UserRepository();
const walletService = new WalletService();
const cacheService = new Cache();

export const sendSOL = async (req: Request & { user?: { userId: number } }, res: Response) => {
     const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create heir`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await cacheService.getOrSet(
        `auth:user${userId}`,
        await userRepository.findById(userId),
        30
    );
    if (!user) {
        logger.warn(`user account not forun for: ${userId}`)
        return res.status(400).json({message: 'User not found'})
    }


}

export const walletInfo = async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            logger.warn(`Unauthorized action: cannot create heir`);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await cacheService.getOrSet(
            `auth:user${userId}`,
            await userRepository.findById(userId),
            30
        );
        if (!user) {
            logger.warn(`user account not forun for: ${userId}`)
            return res.status(400).json({message: 'User not found'})
        }

        logger.info('retrieving user wallet balance')
        const walletBalance = await cacheService.getOrSet(
            `wallet:info${user.wallet_address}`,
            await walletService.getWalletBalance(user.wallet_address),
            1
        )
        return res.status(200).json({...walletBalance});
    } catch(error) {
        logger.warn(`There was an error fetching user's wallet balance ${error}`)
        return res.status(400).json({message: 'Could not fetch wallet balance'})
    }
}