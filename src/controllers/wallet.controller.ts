import { Request, Response } from "express";
import { logger } from "../config/logger";
import { UserRepository } from "../repositories/user.repository";
import { Cache } from "../config/redis";
import { WalletService } from "../services/wallet.service";
import z from "zod";
import { SendNFTSchema, SendSOLSchema, SendSPLTokenSchema } from "../schemas/wallet.schema";

const userRepository = new UserRepository();
const walletService = new WalletService();
const cacheService = new Cache();

export const sendSOL = async (req: Request & { user?: { userId: number } }, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create heir`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { amount, destination } = SendSOLSchema.parse(req.body);
        const user = await cacheService.getOrSet(
            `auth:user${userId}`,
            await userRepository.findById(userId),
            30
        );
        if (!user) {
            logger.warn(`user account not forun for: ${userId}`)
            return res.status(400).json({message: 'User not found'})
        }

        const signature = await walletService.sendSOL({sender: user.wallet_address, destination, amount}, user.wallet_secret)
        if (signature === null) {
            logger.warn(`could not send funds to ${destination} from ${user.wallet_address}`)
            return res.status(400).json({message: 'Could not send funds'})
        }

        logger.info(`funds sent successfully to ${destination} from ${user.wallet_address}`)
        return res.status(200).json({message: 'funds sent successfully', transaction: `https://explorer.solana.com/tx/${signature}?cluster=devnet`})
    } catch(error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for sending funds:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not transfer solana: ${error}`);
        return res.status(400).json({ error: 'Could not transfer funds' });
    }
}

export const sendSPLToken = async (req: Request & { user?: { userId: number } }, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create heir`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { mint, amount, destination } = SendSPLTokenSchema.parse(req.body);
        const user = await cacheService.getOrSet(
            `auth:user${userId}`,
            await userRepository.findById(userId),
            30
        );
        if (!user) {
            logger.warn(`user account not forun for: ${userId}`)
            return res.status(400).json({message: 'User not found'})
        }

        const signature = await walletService.sendSPLToken({sender: user.wallet_address, mint, destination, amount}, user.wallet_secret)
        if (signature === null) {
            logger.warn(`could not send tokens to ${destination} from ${user.wallet_address}`)
            return res.status(400).json({message: 'Could not send funds'})
        }

        logger.info(`SPL Token sent successfully to ${destination} from ${user.wallet_address}`)
        return res.status(200).json({message: 'SPL Token sent successfully', transaction: `https://explorer.solana.com/tx/${signature}?cluster=devnet`})
    } catch(error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for sending SPL Token:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not transfer solana: ${error}`);
        return res.status(400).json({ error: 'Could not transfer SPL Token' });
    }
}

export const sendNFT = async (req: Request & { user?: { userId: number } }, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        logger.warn(`Unauthorized action: cannot create heir`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { mint, destination } = SendNFTSchema.parse(req.body);
        const user = await cacheService.getOrSet(
            `auth:user${userId}`,
            await userRepository.findById(userId),
            30
        );
        if (!user) {
            logger.warn(`user account not forun for: ${userId}`)
            return res.status(400).json({message: 'User not found'})
        }

        const signature = await walletService.sendNFT({sender: user.wallet_address, mint, destination}, user.wallet_secret)
        if (signature === null) {
            logger.warn(`could not transfer NFT to ${destination} from ${user.wallet_address}`)
            return res.status(400).json({message: 'Could not send NFT'})
        }

        logger.info(`NFT sent successfully to ${destination} from ${user.wallet_address}`)
        return res.status(200).json({message: 'NFT sent successfully', transaction: `https://explorer.solana.com/tx/${signature}?cluster=devnet`})
    } catch(error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for sending funds:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`could not transfer solana: ${error}`);
        return res.status(400).json({ error: 'Could not transfer funds' });
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