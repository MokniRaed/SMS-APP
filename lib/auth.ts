import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import api from './axios';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getUser(req?: NextRequest) {
  console.log('getUser Cookies:', req.cookies.getAll());

  const token = req?.cookies.get('_vercel_jwt')?.value;
  console.log("token ", token);


  if (!token) return null;

  const payload = await verifyToken(token);

  return payload;
}


export async function login(email: string, password: string): Promise<any> {
  const response = await api.post<any>('/auth/login', { email, password });
  return response;
}