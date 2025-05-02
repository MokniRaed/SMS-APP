'use client';

import api from '@/lib/axios';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

// ✅ Base schema with shared fields
const BaseUserSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string(),
  lastLogin: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ✅ Create schema (password required)
export const CreateUserSchema = BaseUserSchema.extend({
  password: z.string().min(8, 'Invalid password, 8 characters at least'),
});

// ✅ Update schema (password optional)
export const UpdateUserSchema = BaseUserSchema.extend({
  password: z.string().min(8).optional(),
});

// Types
export type User = z.infer<typeof BaseUserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Mock data for users
const mockUsers: User[] = [
  {
    id: '1',
    username: 'John Doe',
    email: 'john.doe@example.com',
    role: 'ADMIN',
    permissions: ['users.all', 'projects.all', 'tasks.all'],
    isActive: true,
    lastLogin: '2024-03-25T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-25T10:30:00Z'
  },

];

// export const AVAILABLE_PERMISSIONS = {
//   users: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.all'],
//   projects: ['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.all'],
//   tasks: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.all'],
//   clients: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.all'],
//   reports: ['reports.view', 'reports.create', 'reports.export', 'reports.all'],
//   settings: ['settings.view', 'settings.edit', 'settings.all']
// } as const;

export async function getUsers(page: string = '1', limit: string = '10'): Promise<any> {
  try {
    const response = await api.get('/users', {
      params: {
        page,
        limit,
      },
    });
    return response;
  } catch (error) {
    console.warn('Falling back to mock data for users');
    return mockUsers;
  }
}

export async function getUsersByRole(roleId: string): Promise<User[]> {
  try {
    const response = await api.get(`/users/role/${roleId}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for users');
    return mockUsers;
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for user');
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  }
}
export async function getUserProfile(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/profile/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for user');
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  }
}

export async function updateUserPassword(id: string, data: any): Promise<User> {
  try {
    const response = await api.post(`/users/profile/password/${id}`, data);
    return response.data;
  } catch (error) {
    console.log("error", error);
    return error.response.data
  }
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  try {
    const response = await api.post('/users', user);
    return response.data;
  } catch (error) {
    console.log("error", error);
    return error.response.data
    // console.warn('Falling back to mock data for create user');
    // return {
    //   ...user,
    //   id: Math.random().toString(36).substr(2, 9),
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString()
    // };
  }
}

export async function MakeCollaboratorUser(id_collab: string): Promise<AxiosResponse | any> {
  try {
    const response = await api.post(`/users/createFromCollab/${id_collab}`);
    return response;
  } catch (error) {
    console.log("error", error);
    return error.response.data
    // console.warn('Falling back to mock data for create user');
    // return {
    //   ...user,
    //   id: Math.random().toString(36).substr(2, 9),
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString()
    // };
  }
}

export async function MakeClientUser(clientId: string): Promise<AxiosResponse | any> {
  try {
    const response = await api.post(`/users/createFromClient/${clientId}`);
    return response;
  } catch (error) {
    console.log("error", error);
    return error.response.data
    // console.warn('Falling back to mock data for create user');
    // return {
    //   ...user,
    //   id: Math.random().toString(36).substr(2, 9),
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString()
    // };
  }
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  try {
    const response = await api.patch(`/users/${id}`, user);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update user');
    const existingUser = await getUser(id);
    return {
      ...existingUser,
      ...user,
      updatedAt: new Date().toISOString()
    };
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete user');
    return Promise.resolve();
  }
}

export async function getRoles(): Promise<User[]> {
  try {
    const response = await api.get('/users/roles');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for users');
    return mockUsers;
  }
}
