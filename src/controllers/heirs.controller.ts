import { createHeirSchema } from '../schemas/heirs.schema';
import { Request, Response } from 'express';
import { z } from 'zod'
import { logger } from '../config/logger';

export const index = async (req: Request, res: Response) => {

}

export const store = async (req: Request, res: Response) => {
    try {
        const { fullname, email, title } = createHeirSchema.parse(req.body);
        res.status(201).json({message: 'all good'});
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`validation failed for creating heirs:\n ${z.prettifyError(error)}`)
            res.status(400).json({error: 'validation failed', details: z.treeifyError(error)})
        }
    }
}