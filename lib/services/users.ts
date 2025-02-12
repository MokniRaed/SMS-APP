import { z } from 'zod';
import api from '@/lib/axios';

export const RoleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Role name is required'),
  permissions: z.array(z.string())
});

export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  lastLogin: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Role = z.infer<typeof RoleSchema>;
export type User = z.infer<typeof UserSchema>;

// Mock data for fallback
const mockUsers: User[] = [/* ... existing mock users ... */];
const mockRoles: Role[] = [/* ... existing mock roles ... */];

// Role endpoints
export async function getRoles(): Promise<Role[]> {
  try {
    const response = await api.get('/api/users/roles');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for roles');
    return mockRoles;
  }
}

export async function getRole(id: string): Promise<Role> {
  try {
    const response = await api.get(`/api/users/roles/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for role');
    const role = mockRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');
    return role;
  }
}

export async function createRole(role: Omit<Role, 'id'>): Promise<Role> {
  try {
    const response = await api.post('/api/users/roles', role);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create role');
    return {
      ...role,
      id: Math.random().toString(36).substr(2, 9)
    };
  }
}

export async function updateRole(id: string, role: Partial<Role>): Promise<Role> {
  try {
    const response = await api.patch(`/api/users/roles/${id}`, role);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update role');
    const existingRole = await getRole(id);
    return {
      ...existingRole,
      ...role
    };
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    await api.delete(`/api/users/roles/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete role');
    return Promise.resolve();
  }
}

// User endpoints
export async function getUsers(): Promise<User[]> {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for users');
    return mockUsers;
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for user');
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  }
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  try {
    const response = await api.post('/api/users', user);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create user');
    return {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  try {
    const response = await api.patch(`/api/users/${id}`, user);
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
    await api.delete(`/api/users/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete user');
    return Promise.resolve();
  }
}

export const AVAILABLE_PERMISSIONS = {
  users: ['users.view', 'users.create', 'users.edit', 'users.delete'],
  projects: ['projects.view', 'projects.create', 'projects.edit', 'projects.delete'],
  tasks: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete'],
  clients: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete'],
  reports: ['reports.view', 'reports.create', 'reports.export'],
  settings: ['settings.view', 'settings.edit'],
} as const;