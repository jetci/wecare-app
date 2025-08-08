import * as z from 'zod';

export const patientFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().int().positive({ message: 'Age must be a positive number.' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  condition: z.string().nonempty({ message: 'Condition is required.' }),
  address: z.string().nonempty({ message: 'Address is required.' }),
  phoneNumber: z.string().regex(/^\d{9,10}$/, { message: 'Phone number must be 9 or 10 digits.' }),
});
