import z from "zod";
import { validatePublicKey } from "../helpers/utils";

export const SendSOLSchema = z.object({
    amount: z.coerce.number().refine(amount => amount > 0, {message: 'provide an actual amount to send'}),
    destination: z.string().refine(mint => {
        try {
            return validatePublicKey(mint)
        } catch {
            console.error(`Invalid mint address: ${mint}`);
            return false;
        }
    }, {message: 'destination address is invalid'})
});