import z from "zod";
import { logger } from "../config/logger";
import { WalletAddressSchema } from "../schemas/asset.schema";
import { TokenService } from "../services/token.service";
import { Request, Response } from "express";
import { Cache } from "../config/redis";

const tokenService = new TokenService();
const cacheService = new Cache();

export const tokens = async (req: Request, res: Response) => {
    try {
        const { address } = WalletAddressSchema.parse(req.params);
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const tokens = await cacheService.getOrSet(
            `tokens:${address}`,
            await tokenService.getWalletTokens(address),
            60 // Cache for 5 minutes
        );
        return res.status(200).json(tokens);
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for retrieving tokens: ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }
        logger.error(`Token retrieval failed: ${error}`);
        return res.status(500).json({ error: 'Could not fetch token assets at the moment, try again later' });
    }
}

export const nfts = async (req: Request, res: Response) => {
    try {
        const { address } = WalletAddressSchema.parse(req.params);
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const nfts = await cacheService.getOrSet(
            `nfts:${address}`,
            await tokenService.getWalletNFTs(address),
            60 // Cache for 5 minutes
        );
        return res.status(200).json(nfts);
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for retrieving nfts: ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }
        logger.error(`NFT retrieval failed: ${error}`);
        return res.status(500).json({ error: 'Could not fetch nfts assets at the moment, try again later' });
    }
}

export const tokenPrice = async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
        const { address } = WalletAddressSchema.parse(req.params);
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        // const price = await tokenService.getTokenPrice(address);
        // return res.status(200).json({ price });
    } catch (error) {

    }
}