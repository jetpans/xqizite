import { z } from 'zod'

export const registerFormSchema = z
  .object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginFormSchema = z.object({
  username: z.string(),
    password: z.string().min(6),
}).refine((data) => data.username !== '', {
  message: 'Username is required', 
})           