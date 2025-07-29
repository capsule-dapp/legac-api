import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import { validatePublicKey } from '../helpers/utils'

export const CreateCapsuleSchema = z.object({
    capsule_type: z.enum(
        ['nft', 'cryptocurrency', 'native', 'document', 'message'],
        { message: 'Capsule Typemust be one of: nft, cryptocurrency, native, document, message' }
    ),
    capsule_unique_id: z.string().min(1, {message: 'Capsule unique id is required'}),
    capsule_address: z.string()
        .min(1, { message: 'Capsule address is required'})
        .refine(address => {
            try {
                !validatePublicKey(address)
                true
            } catch(error) {
                false
            }
        }),
    heir_id: z.coerce.number({message: 'Provide a valid heir ID'}),
    multisig_enabled: z.boolean(),
})

export type CreateCapsuleType = z.infer<typeof CreateCapsuleSchema>