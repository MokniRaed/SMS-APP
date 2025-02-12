import { z } from 'zod';
import api from '@/lib/axios';

export const NotificationSchema = z.object({
    id: z.string(),
    title: z.string(),
    message: z.string(),
    type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
    read: z.boolean(),
    link: z.string().optional(),
    createdAt: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Mock notifications for development
const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'New Task Assigned',
        message: 'You have been assigned to the task "Database Optimization"',
        type: 'INFO',
        read: false,
        link: '/dashboard/tasks/2',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Project Update',
        message: 'Project "Mobile App Development" has been marked as completed',
        type: 'SUCCESS',
        read: false,
        link: '/dashboard/projects/1',
        createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: '3',
        title: 'Task Due Soon',
        message: 'Task "Security Audit" is due in 2 days',
        type: 'WARNING',
        read: false,
        link: '/dashboard/tasks/4',
        createdAt: new Date(Date.now() - 7200000).toISOString()
    }
];

export async function getNotifications(): Promise<Notification[]> {
    try {
        const response = await api.get('/api/notifications');
        return response.data;
    } catch (error) {
        console.warn('Falling back to mock notifications');
        return mockNotifications;
    }
}

export async function markAsRead(id: string): Promise<void> {
    try {
        await api.patch(`/api/notifications/${id}`, { read: true });
    } catch (error) {
        console.warn('Falling back to mock notification update');
    }
}

export async function markAllAsRead(): Promise<void> {
    try {
        await api.post('/api/notifications/mark-all-read');
    } catch (error) {
        console.warn('Falling back to mock notifications update');
    }
}

export async function deleteNotification(id: string): Promise<void> {
    try {
        await api.delete(`/api/notifications/${id}`);
    } catch (error) {
        console.warn('Falling back to mock notification delete');
    }
}