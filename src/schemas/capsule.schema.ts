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
    multisig_enabled: z.coerce.boolean(),
    multisig_approval_list: z.array(
        z.object({
            email: z.email({message: 'Provided email address is invalid'}),
            wallet_address: z.string()
                .refine(address => {
                    try {
                        validatePublicKey(address)
                        true
                    } catch(error) {
                        false
                    }
                }
            ),
        })
    ).optional()
})

export type CreateCapsuleType = z.infer<typeof CreateCapsuleSchema>