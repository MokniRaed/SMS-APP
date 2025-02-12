import { z } from 'zod';
import api from '@/lib/axios';

export const ProjectSchema = z.object({
  Id_projet: z.string().min(1, 'Project ID is required'),
  Type_projet: z.string().min(1, 'Project type is required'),
  Produit_cible: z.string().optional(),
  Description_projet: z.string().optional(),
  Objectif_CA: z.number().optional(),
  Objectif_Qte: z.number().optional(),
  Zone_cible: z.string().optional(),
  Periode_Date_debut: z.string().datetime(),
  Periode_Date_fin: z.string().datetime(),
  Statut_projet: z.string().min(1, 'Project status is required'),
  Notes_projet: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Mock data for fallback
const mockProjects: Project[] = [/* ... existing mock projects ... */];

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await api.get('/api/projects');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return mockProjects;
  }
}

export async function getProject(id: string): Promise<Project> {
  try {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for project');
    const project = mockProjects.find(p => p.Id_projet === id);
    if (!project) throw new Error('Project not found');
    return project;
  }
}

export async function createProject(project: Project): Promise<Project> {
  try {
    const response = await api.post('/api/projects', project);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create project');
    return {
      ...project,
      Id_projet: Math.random().toString(36).substr(2, 9)
    };
  }
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  try {
    const response = await api.patch(`/api/projects/${id}`, project);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update project');
    const existingProject = await getProject(id);
    return {
      ...existingProject,
      ...project
    };
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await api.delete(`/api/projects/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete project');
    return Promise.resolve();
  }
}

export async function uploadZones(file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/api/projects/upload-zones', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    throw new Error('Failed to upload zones');
  }
}