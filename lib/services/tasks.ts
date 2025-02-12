import { z } from 'zod';
import api from '@/lib/axios';

export const TaskSchema = z.object({
  id: z.string().optional(),
  title_tache: z.string().min(1, 'Title is required'),
  type_tache: z.string().min(1, 'Task type is required'),
  id_client: z.string().min(1, 'Client is required'),
  id_projet: z.string().min(1, 'Project is required'),
  id_collaborateur: z.string().min(1, 'Collaborator is required'),
  date_tache: z.string().min(1, 'Task date is required'),
  description_tache: z.string().optional(),
  adresse_tache: z.string().optional(),
  date_execution_tache: z.string().optional(),
  compte_rendu_tache: z.string().optional(),
  statut_tache: z.string().min(1, 'Status is required'),
  notes_tache: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type Task = z.infer<typeof TaskSchema>;

// Mock data for task types and statuses (these would typically come from the API)
export const taskTypes = [
  { id: '1', name: 'Development' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Testing' },
  { id: '4', name: 'Documentation' },
  { id: '5', name: 'Maintenance' }
];

export const taskStatuses = [
  { id: '1', name: 'New' },
  { id: '2', name: 'In Progress' },
  { id: '3', name: 'Under Review' },
  { id: '4', name: 'Completed' },
  { id: '5', name: 'Cancelled' }
];

export const collaborators = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' }
];

// Mock data for fallback
const mockTasks: Task[] = [
  {
    id: '1',
    title_tache: 'Client Site Maintenance',
    type_tache: '5',
    id_client: 'CLI001',
    id_projet: 'PRJ001',
    id_collaborateur: '1',
    date_tache: '2024-03-25',
    description_tache: 'Perform routine maintenance on client website',
    adresse_tache: '123 Client St, Business District',
    statut_tache: '1',
    notes_tache: 'Monthly maintenance schedule',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title_tache: 'Database Optimization',
    type_tache: '1',
    id_client: 'CLI002',
    id_projet: 'PRJ002',
    id_collaborateur: '2',
    date_tache: '2024-03-26',
    description_tache: 'Optimize database queries for better performance',
    statut_tache: '2',
    date_execution_tache: '2024-03-26T14:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title_tache: 'UI Design Review',
    type_tache: '2',
    id_client: 'CLI003',
    id_projet: 'PRJ003',
    id_collaborateur: '3',
    date_tache: '2024-03-25',
    description_tache: 'Review and update UI designs for mobile app',
    statut_tache: '3',
    date_execution_tache: '2024-03-25T10:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title_tache: 'Security Audit',
    type_tache: '3',
    id_client: 'CLI001',
    id_projet: 'PRJ004',
    id_collaborateur: '1',
    date_tache: '2024-03-27',
    description_tache: 'Conduct security audit of the application',
    statut_tache: '1',
    date_execution_tache: '2024-03-27T09:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    title_tache: 'API Documentation',
    type_tache: '4',
    id_client: 'CLI002',
    id_projet: 'PRJ002',
    id_collaborateur: '2',
    date_tache: '2024-03-28',
    description_tache: 'Update API documentation with new endpoints',
    statut_tache: '2',
    date_execution_tache: '2024-03-28T13:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    title_tache: 'Feature Implementation',
    type_tache: '1',
    id_client: 'CLI003',
    id_projet: 'PRJ003',
    id_collaborateur: '3',
    date_tache: '2024-03-29',
    description_tache: 'Implement new user authentication features',
    statut_tache: '2',
    date_execution_tache: '2024-03-29T11:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    title_tache: 'Performance Testing',
    type_tache: '3',
    id_client: 'CLI001',
    id_projet: 'PRJ001',
    id_collaborateur: '1',
    date_tache: '2024-03-30',
    description_tache: 'Conduct performance testing on production environment',
    statut_tache: '1',
    date_execution_tache: '2024-03-30T15:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    title_tache: 'Bug Fixes',
    type_tache: '1',
    id_client: 'CLI002',
    id_projet: 'PRJ002',
    id_collaborateur: '2',
    date_tache: '2024-03-25',
    description_tache: 'Fix reported login issues and form validation bugs',
    statut_tache: '4',
    date_execution_tache: '2024-03-25T09:00:00Z',
    compte_rendu_tache: 'All reported bugs have been fixed and tested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    title_tache: 'Client Meeting',
    type_tache: '5',
    id_client: 'CLI003',
    id_projet: 'PRJ003',
    id_collaborateur: '3',
    date_tache: '2024-03-26',
    description_tache: 'Project progress review meeting with client',
    adresse_tache: '456 Meeting Ave, Conference Room 3',
    statut_tache: '4',
    date_execution_tache: '2024-03-26T16:00:00Z',
    compte_rendu_tache: 'Meeting completed successfully, new requirements documented',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '10',
    title_tache: 'Deployment Planning',
    type_tache: '1',
    id_client: 'CLI001',
    id_projet: 'PRJ004',
    id_collaborateur: '1',
    date_tache: '2024-03-27',
    description_tache: 'Plan deployment strategy for new features',
    statut_tache: '3',
    date_execution_tache: '2024-03-27T14:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await api.get('/api/tasks');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for tasks');
    return mockTasks;
  }
}

export async function getTask(id: string): Promise<Task> {
  try {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for task');
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  }
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  try {
    const response = await api.post('/api/tasks', task);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create task');
    return {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  try {
    const response = await api.patch(`/api/tasks/${id}`, task);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update task');
    const existingTask = await getTask(id);
    return {
      ...existingTask,
      ...task,
      updatedAt: new Date().toISOString()
    };
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await api.delete(`/api/tasks/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete task');
    return Promise.resolve();
  }
}

// Task phase transition functions
export async function assignTask(id: string, collaboratorId: string): Promise<Task> {
  return updateTask(id, {
    statut_tache: '2',
    id_collaborateur: collaboratorId
  });
}

export async function acceptTask(id: string): Promise<Task> {
  return updateTask(id, {
    statut_tache: '2'
  });
}

export async function planTask(
  id: string, 
  plannedStartDate: string, 
  plannedEndDate: string
): Promise<Task> {
  return updateTask(id, {
    statut_tache: '2',
    date_execution_tache: plannedStartDate
  });
}

export async function startTask(id: string): Promise<Task> {
  return updateTask(id, {
    statut_tache: '2',
    date_execution_tache: new Date().toISOString()
  });
}

export async function completeTask(
  id: string, 
  report: { content: string }
): Promise<Task> {
  return updateTask(id, {
    statut_tache: '4',
    compte_rendu_tache: report.content
  });
}

export async function cancelTask(
  id: string, 
  reason: string
): Promise<Task> {
  return updateTask(id, {
    statut_tache: '5',
    compte_rendu_tache: reason
  });
}