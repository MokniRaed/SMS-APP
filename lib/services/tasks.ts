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

// Updated task types
export const taskTypes = [
  { id: '1', name: 'Development' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Testing' },
  { id: '4', name: 'Documentation' },
  { id: '5', name: 'Maintenance' }
];

// Updated task statuses to match French workflow
export const taskStatuses = [
  { id: 'SAISIE', name: 'Saisie' },
  { id: 'AFFECTEE', name: 'Afféctée' },
  { id: 'ACCEPTEE', name: 'Accéptée' },
  { id: 'PLANIFIEE', name: 'Planifiée' },
  { id: 'REPORTEE', name: 'Reportée' },
  { id: 'CLOTUREE', name: 'Clôturée' },
  { id: 'ANNULEE', name: 'Annulée' }
];

export const collaborators = [
  { id: '1', name: 'John Doe', role: 'Senior Developer', email: 'john.doe@company.com' },
  { id: '2', name: 'Jane Smith', role: 'Project Manager', email: 'jane.smith@company.com' },
  { id: '3', name: 'Mike Johnson', role: 'UI/UX Designer', email: 'mike.johnson@company.com' },
  { id: '4', name: 'Sarah Wilson', role: 'Business Analyst', email: 'sarah.wilson@company.com' },
  { id: '5', name: 'David Brown', role: 'QA Engineer', email: 'david.brown@company.com' }
];

export function getCollaboratorName(id: string): string {
  const collaborator = collaborators.find(c => c.id === id);
  return collaborator?.name || 'Unknown Collaborator';
}

// Mock data with updated statuses and more varied examples
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
    statut_tache: 'SAISIE',
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
    statut_tache: 'AFFECTEE',
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
    statut_tache: 'ACCEPTEE',
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
    statut_tache: 'PLANIFIEE',
    date_execution_tache: '2024-03-27T09:00:00Z',
    adresse_tache: '456 Security Ave, Tech District',
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
    statut_tache: 'REPORTEE',
    date_execution_tache: '2024-03-28T13:00:00Z',
    compte_rendu_tache: 'Documentation updates completed, pending review',
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
    statut_tache: 'CLOTUREE',
    date_execution_tache: '2024-03-29T11:00:00Z',
    compte_rendu_tache: 'All features implemented and tested successfully',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    title_tache: 'Performance Testing',
    type_tache: '3',
    id_client: 'CLI001',
    id_projet: 'PRJ001',
    id_collaborateur: '4',
    date_tache: '2024-03-30',
    description_tache: 'Conduct performance testing on production environment',
    statut_tache: 'ANNULEE',
    date_execution_tache: '2024-03-30T15:00:00Z',
    compte_rendu_tache: 'Cancelled due to environment unavailability',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    title_tache: 'Client Training Session',
    type_tache: '5',
    id_client: 'CLI004',
    id_projet: 'PRJ005',
    id_collaborateur: '5',
    date_tache: '2024-03-31',
    description_tache: 'Conduct training session for new system features',
    statut_tache: 'PLANIFIEE',
    date_execution_tache: '2024-03-31T10:00:00Z',
    adresse_tache: '789 Training Center, Education Block',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    title_tache: 'Data Migration',
    type_tache: '1',
    id_client: 'CLI005',
    id_projet: 'PRJ006',
    id_collaborateur: '1',
    date_tache: '2024-04-01',
    description_tache: 'Migrate client data to new database system',
    statut_tache: 'ACCEPTEE',
    date_execution_tache: '2024-04-01T08:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '10',
    title_tache: 'System Integration',
    type_tache: '1',
    id_client: 'CLI006',
    id_projet: 'PRJ007',
    id_collaborateur: '2',
    date_tache: '2024-04-02',
    description_tache: 'Integrate new payment processing system',
    statut_tache: 'AFFECTEE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Task status transition functions
export async function assignTask(id: string, collaboratorId: string): Promise<Task> {
  return updateTask(id, {
    statut_tache: 'AFFECTEE',
    id_collaborateur: collaboratorId
  });
}

export async function acceptTask(id: string): Promise<Task> {
  return updateTask(id, {
    statut_tache: 'ACCEPTEE'
  });
}

export async function planTask(
    id: string,
    data: { date_execution_tache: string; adresse_tache?: string }
): Promise<Task> {
  return updateTask(id, {
    statut_tache: 'PLANIFIEE',
    date_execution_tache: data.date_execution_tache,
    adresse_tache: data.adresse_tache
  });
}

export async function reportTask(
    id: string,
    report: { content: string }
): Promise<Task> {
  return updateTask(id, {
    statut_tache: 'REPORTEE',
    compte_rendu_tache: report.content
  });
}

export async function completeTask(
    id: string,
    report: { content: string }
): Promise<Task> {
  return updateTask(id, {
    statut_tache: 'CLOTUREE',
    compte_rendu_tache: report.content
  });
}

export async function cancelTask(
    id: string,
    reason: string
): Promise<Task> {
  return updateTask(id, {
    statut_tache: 'ANNULEE',
    compte_rendu_tache: reason
  });
}

// Base CRUD operations
export async function getTasks(): Promise<Task[]> {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for tasks');
    return mockTasks;
  }
}

export async function getTask(id: string): Promise<Task> {
  try {
    const response = await api.get(`/tasks/${id}`);
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
    const response = await api.post('/tasks', task);
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
    const response = await api.patch(`/tasks/${id}`, task);
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
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete task');
    return Promise.resolve();
  }
}