import { z } from 'zod'

export const createHeirSchema = z.object({
    fullname: z.string().min(6, 'Provide heir fullname'),
    email: z.email({message: 'invalid email address'}),
    title: z.enum(
        ['son', 'daughter', 'brother', 'sister', 'niece', 'nephew'],
        { message: 'Title must be one of: son, daughter, brother, sister, niece, nephew' }
    ),
    state: z.string().min(1, {message: 'State of origin required'}),
    country: z.string().min(1, {message: 'Country required'}),
    dob: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
    .refine(
      (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      { message: 'Date of birth must be a valid date and not in the future' }
    ),
    age: z.coerce.number().gte(15, {message: 'heir must be of 15 years of age or more'})
});

export type CreateHeir = z.infer<typeof createHeirSchema>