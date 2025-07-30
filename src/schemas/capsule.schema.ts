import { validatePublicKey } from '../helpers/utils'
import { z } from 'zod'

export const CreateCapsuleSchema = z.object({
    capsule_type: z.enum(
        ['nft', 'cryptocurrency', 'native', 'document', 'message'],
        { message: 'Capsule Type must be one of: nft, cryptocurrency, native, document, message' }
    ),
    capsule_unique_id: z.string().min(1, {message: 'Capsule unique id is required'}),
    capsule_address: z.string()
        .min(1, { message: 'Capsule address is required'})
        .refine(address => {
            try {
                return !validatePublicKey(address)
            } catch(error) {
                false
            }
        }),
    heir_id: z.coerce.number({message: 'Provide a valid heir ID'}),
    asset_mint: z.string().refine(address => {
        try {
            return validatePublicKey(address)
        } catch(error) {
            false
        }
    }).optional(),
    document_uri: z.url().min(1, {message: 'Provide uploaded document uri'}).optional(),
    message: z.string().min(30, {message: 'Message length expected to be longer than this'}).optional(),
    amount: z.coerce.number().min(0.005, {message: 'amount must be greater than zero'}),
    unlock_type: z.enum(['time_based', 'inactivity_based'], {message: 'Unlock type must be one of: time_based, inactivity_based'}),
    unlock_timestamp: z
      .coerce.date()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime()) && date > new Date();
        },
        { message: 'Unlock timestamp must be a valid future date' }
      ),
    inactivity_period: z
      .coerce
      .number()
      .min(1, { message: 'Inactivity period must be a positive integer (in seconds)' })
      .optional(),
    security_questions: z.array(
        z.object({
            question: z.string().min(1, {message: 'Question is required'}),
            answer: z.string().min(1, {message: 'Answer is required'}),
        })
    ).min(1, { message: 'At least one security question is required' })
})
.superRefine((data, ctx) => {
    if (data.unlock_type === 'time_based' && !data.unlock_timestamp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unlock_timestamp'],
        message: 'Unlock timestamp is required when unlock type is "time_based"',
      });
    }
    if (data.unlock_type === 'inactivity_based' && !data.inactivity_period) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inactivity_period'],
        message: 'Inactivity period is required when unlock type is "inactivity"',
      });
      if (data.capsule_type === 'document' && !data.document_uri) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['document_uri'],
            message: 'Document URI is required when capsule type is "document"',
        });
      }
      if (data.capsule_type === 'message' && !data.message) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['message'],
            message: 'Message is required when capsule type is "message"',
        });
      }
      if (data.capsule_type === 'cryptocurrency' && !data.asset_mint || data.capsule_type === 'native' && !data.asset_mint) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['asset_mint'],
            message: 'Asset Mint is required when capsule type is "cryptocurrency or native"',
        });
      }
      if (data.capsule_type === 'cryptocurrency' && !data.amount || data.capsule_type === 'native' && !data.amount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: 'Amount is required when capsule type is "cryptocurrency or native"',
        });
      }
    }
});

export type CreateCapsuleType = z.infer<typeof CreateCapsuleSchema>