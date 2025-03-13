import api from '@/lib/axios';
import { z } from 'zod';

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

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    title_tache: 'Implement Login Feature',
    type_tache: '1',
    id_client: 'client1',
    id_projet: 'project1',
    id_collaborateur: '1',
    date_tache: '2024-03-25',
    statut_tache: 'SAISIE',
    description_tache: 'Implement user authentication system'
  },
  {
    id: '2',
    title_tache: 'Design Homepage',
    type_tache: '2',
    id_client: 'client2',
    id_projet: 'project1',
    id_collaborateur: '2',
    date_tache: '2024-03-26',
    statut_tache: 'AFFECTEE',
    description_tache: 'Create new homepage design'
  },
  {
    id: '3',
    title_tache: 'Database Optimization',
    type_tache: '1',
    id_client: 'client1',
    id_projet: 'project2',
    id_collaborateur: '1',
    date_tache: '2024-03-27',
    statut_tache: 'ACCEPTEE',
    description_tache: 'Optimize database queries'
  },
  {
    id: '4',
    title_tache: 'User Testing',
    type_tache: '3',
    id_client: 'client3',
    id_projet: 'project1',
    id_collaborateur: '3',
    date_tache: '2024-03-28',
    statut_tache: 'PLANIFIEE',
    description_tache: 'Conduct user testing sessions'
  },
  {
    id: '5',
    title_tache: 'Bug Fixes',
    type_tache: '1',
    id_client: 'client2',
    id_projet: 'project3',
    id_collaborateur: '1',
    date_tache: '2024-03-29',
    statut_tache: 'REPORTEE',
    description_tache: 'Fix reported bugs'
  },
  {
    id: '6',
    title_tache: 'Documentation Update',
    type_tache: '4',
    id_client: 'client1',
    id_projet: 'project2',
    id_collaborateur: '4',
    date_tache: '2024-03-30',
    statut_tache: 'CLOTUREE',
    description_tache: 'Update API documentation'
  },
  {
    id: '7',
    title_tache: 'Feature Deployment',
    type_tache: '1',
    id_client: 'client3',
    id_projet: 'project1',
    id_collaborateur: '1',
    date_tache: '2024-03-31',
    statut_tache: 'ANNULEE',
    description_tache: 'Deploy new features to production'
  }
];

export function getCollaboratorName(id: string): string {
  const collaborator = collaborators.find(c => c.id === id);
  return collaborator?.name || 'Unknown Collaborator';
}

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
export async function getTasks(collaboratorId?: string): Promise<Task[]> {
  try {
    const response = await api.get('/tasks', {
      params: {
        id_collaborateur: collaboratorId,
      },
    });
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for tasks');
    return mockTasks; // Return mock data while API is not ready
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
    if (error instanceof Error) {
      return error.response.data;
    } else {
      console.error("An unexpected error occurred:", error);
      throw new Error('Failed to create task');
    }
  }
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  try {
    const response = await api.patch(`/tasks/${id}`, task);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update task');
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    throw new Error('Failed to delete task');
  }
}



export async function getAllTaskTypes(): Promise<any[]> {
  try {
    const response = await api.get(`/tasks/taskType`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for article command status');

  }
}

export async function getAllTaskStatus(): Promise<any[]> {
  try {
    const response = await api.get(`/tasks/taskStatus`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for article command status');

  }
}
