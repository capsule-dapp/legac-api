import { z } from 'zod'
import { validatePublicKey } from '../helpers/utils';

export const RegisterSchema = z.object({
    fullname: z.string().min(1, {message: 'fullname is required'}),
    email: z.email({message: 'email address is invalid'}),
    password: z.string()
        .refine(
            value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%\^\&\*\(\)])(?=.{6,})/.test(value),
            {message: 'password must contain uppercase, lowercase, special symbols and numbers'}
        )
});

export const LoginSchema = z.object({
    email: z.email({message: 'email address is invalid'}),
    password: z.string()
        .refine(
            value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%\^\&\*\(\)])(?=.{6,})/.test(value),
            {message: 'password must contain uppercase, lowercase, special symbols and numbers'}
        )
});

export const SetPinSchema = z.object({
    pin: z.string().length(6, {message: 'Security pin must be 6 digits'}).regex(/^\d+$/, { message: 'Verification code must be numeric' })
})

export const VerifyEmailSchema = z.object({
    email: z.email({ message: 'email address is invalid' }),
    code: z.string().length(6, { message: 'Verification code must be 6 digits' }).regex(/^\d+$/, { message: 'Verification code must be numeric' }),
});

export const VerifySecurityPinSchema = z.object({
    pin: z.string().length(6, {message: 'Security pin must be 6 digits'}).regex(/^\d+$/, { message: 'Verification code must be numeric' })
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;