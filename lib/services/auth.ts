import api from '@/lib/axios';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type LoginCredentials = z.infer<typeof LoginSchema>;

export async function login(credentials: LoginCredentials) {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    throw new Error('Login failed');
  }
}