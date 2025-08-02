import { CapsuleRepository } from "../repositories/capsule.repository";
import { HeirRepository } from "../repositories/heirs.repository";
import { CapsuleAddressSchema, CreateCapsuleSchema, VerifyQuestionSchema } from "../schemas/capsule.schema";
import { Request, Response } from "express";
import { logger } from "../config/logger";
import { Cache } from "../config/redis";
import bcrypt from 'bcryptjs';
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

        const heir = await cacheService.getOrSet(
            `heir_capsule:${userId}`,
            await heirRepository.find(payload.heir_id, userId),
            50
        );
        if (!heir) return res.status(400).json({message: 'Heir record not found'})

        let response;
        const capsuleService = new CapsuleService(decrypt(user.wallet_secret));
        if (payload.capsule_type == 'cryptocurrency') {
            if (!payload.asset_mint) {
                logger.warn('Asset mint is required for cryptocurrency capsule');
                return res.status(400).json({message: 'Asset mint is required for cryptocurrency capsule'})
            }

            if (payload.amount == undefined || payload.amount <= 0) {
                logger.warn('Amount must be greater than zero');
                return res.status(400).json({message: 'Amount must be greater than zero'})
            }

            logger.info('creating cryptocurrency capsule')
            response = await capsuleService.create_crypto_capsule(
                new PublicKey(user.wallet_address),
                new PublicKey(payload.asset_mint as string),
                payload.amount,
                payload.unlock_type,
                payload.unlock_timestamp ? Math.floor(payload.unlock_timestamp?.getTime() / 1000) : null,
                payload.inactivity_period ? payload.inactivity_period as number : null,
                new PublicKey(heir.wallet_address)
            )
        }

        if (payload.capsule_type == 'native') {
            if (payload.amount == undefined || payload.amount <= 0) {
                logger.warn('Amount must be greater than zero');
                return res.status(400).json({message: 'Amount must be greater than zero'})
            }

            logger.info('creating native capsule')
            response = await capsuleService.create_native_capsule(
                new PublicKey(user.wallet_address),
                payload.amount,
                payload.unlock_type,
                payload.unlock_timestamp ? Math.floor(payload.unlock_timestamp?.getTime() / 1000) : null,
                payload.inactivity_period ? payload.inactivity_period as number : null,
                new PublicKey(heir.wallet_address)
            )
        }

        if (payload.capsule_type == 'nft') {
            if (!payload.asset_mint) {
                logger.warn('Asset mint is required for nft capsule');
                return res.status(400).json({message: 'Asset mint is required for nft capsule'})
            }

            logger.info('creating nft capsule')
            response = await capsuleService.create_nft_capsule(
                new PublicKey(user.wallet_address),
                new PublicKey(payload.asset_mint as string),
                payload.unlock_type,
                payload.unlock_timestamp ? Math.floor(payload.unlock_timestamp?.getTime() / 1000) : null,
                payload.inactivity_period ? payload.inactivity_period as number : null,
                new PublicKey(heir.wallet_address)
            )
        }

        if (response == undefined) {
            return res.status(400).json({message: 'there was an error creating capsule'})
        }

        logger.info("store capsule information")
        await capsuleRepository.create(userId, {...payload, capsule_unique_id: response.capsuleID, capsule_address: response.capsulePDA })

        // logger.info('invalidating capsule cache')
        await cacheService.delete('capsules:all')
        await cacheService.delete(`capsules_${userId}:all`)

        return res.status(201).json({message: 'Capsule created successfully', signature: `https://explorer.solana.com/tx/${response.signature}`})
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

export const verifySecurityQuestions = async (req: Request & { user?: { userId: number; role: string } }, res: Response) => {
    const {userId, role} = req.user!;
    if (!userId || !role) {
        logger.warn(`Unauthorized action: cannot create capsule`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (role !== 'heir') {
        logger.warn(`Unauthorized action: user does not have permission to verify security questions`);
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { answers } = VerifyQuestionSchema.parse(req.body);
        const { capsule_address } = CapsuleAddressSchema.parse(req.params);

        const heir = await cacheService.getOrSet(
            `heir_capsule:${userId}`,
            await heirRepository.findById(userId),
            50
        );
        if (!heir) return res.status(400).json({message: 'Heir record not found'})

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

        const questions = await cacheService.getOrSet(
            `capsule:questions${capsule_address}`,
            await capsuleRepository.findSecurityQuestionsAndAnswers(capsule.id),
            10
        )
        if (!questions || questions.length == 0) {
            return res.status(404).json({message: 'Security question could not be retrieved'})
        }

        if (answers.length == 0 || answers.length !== questions.length) {
            logger.warn(`Invalid number of answers provided for casule ${capsule.id}`)
            return res.status(400).json({message: `Invalid request, provide answers for questions (${questions.length})`});
        }

        for (let i = 0; i < questions.length; i++) {
            const security_question = questions[i];
            const security_answer = answers[i];

            if (security_answer.question_id !== security_question.id) {
                logger.warn('could not find any question associated with answer')
                return res.status(400).json({message: `Could not find a question associated with answer for no. ${security_answer.question_id}`})
            }

            if (!security_answer.answer) {
                logger.warn(`Missing answer for question ${security_question.id}`)
                return res.status(400).json({message: `Answer for question ${security_question.id} is required`})
            }

            const isValid = await bcrypt.compare(security_answer.answer.trim().toLowerCase(), security_question.answer);
            if (!isValid) {
                logger.warn(`Incorrect answer for question ${security_question.id}`)
                return res.status(401).json({message: `Incorrect answer for question ${security_question.id}`})
            }
        }

        // unlock capsule asset ans send to beneficiary

        logger.info(`Security questions verified for capsule ${capsule.id} by user ${heir.email}`)
        return res.status(200).json({ message: 'Security questions verified successfully' });
    } catch(error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for retriving questions:\n ${z.prettifyError(error)}`)
            return res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }

        logger.error(`Error verifying security questions: ${error}`);
        return res.status(500).json({ error: `Error verifying answers ${error}` });
    }
}