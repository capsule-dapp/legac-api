import z from "zod";
import { validatePublicKey } from "../helpers/utils";

export const SendSOLSchema = z.object({
    amount: z.coerce.number().refine(amount => amount > 0, {message: 'provide an actual amount to send'}),
    destination: z.string().min(1, {message: 'destination address is required'}).refine(destination => {
        try {
            return validatePublicKey(destination)
        } catch {
            return false;
        }
    }, {message: 'destination address is invalid'})
});

export const SendSPLTokenSchema = z.object({
    amount: z.coerce.number().refine(amount => amount > 0, {message: 'provide an actual amount to send'}),
    destination: z.string().min(1, {message: 'destination address is required'}).refine(destination => {
        try {
            return validatePublicKey(destination)
        } catch {
            console.error(`Invalid destination address: ${destination}`);
            return false;
        }
    }, {message: 'destination address is invalid'}),
    mint: z.string().min(1, {message: 'mint address is required'}).refine(mint => {
        try {
            return validatePublicKey(mint)
        } catch {
            console.error(`Invalid mint address: ${mint}`);
            return false;
        }
    }, {message: 'destination address is invalid'})
})

export const SendNFTSchema = z.object({
    destination: z.string().min(1, {message: 'destination address is required'}).refine(destination => {
        try {
            return validatePublicKey(destination)
        } catch {
            return false;
        }
    }, {message: 'destination address is invalid'}),
    mint: z.string().min(1, {message: 'mint address is required'}).refine(mint => {
        try {
            return validatePublicKey(mint)
        } catch {
            return false;
        }
    }, {message: 'destination address is invalid'})
})