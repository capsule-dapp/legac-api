import { z } from 'zod'
import { validatePublicKey } from '../helpers/utils';

export const AuthSchema = z.object({
    email: z.email({message: 'email address is invalid'}),
    password: z.string()
        .refine(
            value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%\^\&\*\(\)])(?=.{6,})/.test(value),
            {message: 'password must contain uppercase, lowercase, special symbols and numbers'}
        )
});

export const UpdateWalletSchema = z.object({
    walletAddress: z.string()
        .min(1, {message: "wallet address is required"})
        .refine(address => {
        try {
            validatePublicKey(address)
            return true;
        } catch {
            return false;
        }
    }, {message: 'wallet address is invalid'})
})

export type AuthRequest = z.infer<typeof AuthSchema>;