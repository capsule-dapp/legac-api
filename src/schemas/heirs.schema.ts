import { z } from 'zod'

export const createHeirSchema = z.object({
    fullname: z.string().min(6, 'Provide heir fullname'),
    email: z.email({message: 'invalid email address'}),
    title: z.enum(
        ['son', 'daughter', 'brother', 'sister', 'niece', 'nephew'],
        { message: 'Title must be one of: son, daughter, brother, sister, niece, nephew' }
    )
});

export type CreateHeir = z.infer<typeof createHeirSchema>