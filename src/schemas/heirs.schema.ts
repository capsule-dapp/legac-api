import { z } from 'zod'

export const createHeirSchema = z.object({
    fullname: z.string().min(6, 'Provide heir fullname'),
    email: z.email({message: 'invalid email address'}),
    title: z.enum(
        ['son', 'daughter', 'brother', 'sister', 'niece', 'nephew'],
        { message: 'Title must be one of: son, daughter, brother, sister, niece, nephew' }
    ),
    age: z.coerce.number().gte(15, {message: 'heir must be of 15 years of age or more'})
});

export type CreateHeir = z.infer<typeof createHeirSchema>