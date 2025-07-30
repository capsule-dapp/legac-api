import z from "zod";
import { validatePublicKey } from "../helpers/utils";

export const WalletAddressSchema = z.object({
    address: z.string()
        .min(1, {message: "wallet address is required"})
        .refine(address => {
        try {
            return validatePublicKey(address)
        } catch {
            console.error(`Invalid wallet address: ${address}`);
            return false;
        }
    }, {message: 'wallet address is invalid'})
})

export const MintAddressSchema = z.object({
    mint: z.string()
        .min(1, {message: "mint address is required"})
        .refine(mint => {
        try {
            return validatePublicKey(mint)
        } catch {
            console.error(`Invalid mint address: ${mint}`);
            return false;
        }
    }, {message: 'mint address is invalid'})
})