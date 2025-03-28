'use client';

import api from '@/lib/axios';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Invalid password, 8 caractére at least'),
  role: z.string(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  lastLogin: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Mock data for users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'ADMIN',
    permissions: ['users.all', 'projects.all', 'tasks.all'],
    isActive: true,
    lastLogin: '2024-03-25T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-25T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'MANAGER',
    permissions: ['projects.view', 'projects.create', 'tasks.all'],
    isActive: true,
    lastLogin: '2024-03-24T15:45:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-24T15:45:00Z'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'USER',
    permissions: ['tasks.view', 'tasks.create'],
    isActive: true,
    lastLogin: '2024-03-23T09:15:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-23T09:15:00Z'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'MANAGER',
    permissions: ['projects.all', 'tasks.all'],
    isActive: false,
    lastLogin: '2024-03-20T14:20:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-20T14:20:00Z'
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'USER',
    permissions: ['tasks.view'],
    isActive: true,
    lastLogin: '2024-03-25T08:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-25T08:00:00Z'
  }
];

export const AVAILABLE_PERMISSIONS = {
  users: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.all'],
  projects: ['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.all'],
  tasks: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.all'],
  clients: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.all'],
  reports: ['reports.view', 'reports.create', 'reports.export', 'reports.all'],
  settings: ['settings.view', 'settings.edit', 'settings.all']
} as const;

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
