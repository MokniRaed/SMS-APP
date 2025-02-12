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

// Mock data for projects
const mockProjects: Project[] = [
  {
    Id_projet: '1',
    Type_projet: 'DEVELOPMENT',
    Produit_cible: 'Mobile App Development',
    Description_projet: 'Develop a new mobile application for client management',
    Objectif_CA: 150000,
    Objectif_Qte: 1,
    Zone_cible: 'North America',
    Periode_Date_debut: '2024-03-01T00:00:00Z',
    Periode_Date_fin: '2024-06-30T00:00:00Z',
    Statut_projet: 'IN_PROGRESS',
    Notes_projet: 'High priority project for Q2'
  },
  {
    Id_projet: '2',
    Type_projet: 'RESEARCH',
    Produit_cible: 'Market Analysis',
    Description_projet: 'Conduct market research for expansion opportunities',
    Objectif_CA: 50000,
    Objectif_Qte: 1,
    Zone_cible: 'Europe',
    Periode_Date_debut: '2024-04-01T00:00:00Z',
    Periode_Date_fin: '2024-05-31T00:00:00Z',
    Statut_projet: 'PLANNED',
    Notes_projet: 'Strategic initiative for international expansion'
  },
  {
    Id_projet: '3',
    Type_projet: 'MAINTENANCE',
    Produit_cible: 'Legacy System Update',
    Description_projet: 'Upgrade and maintain existing client systems',
    Objectif_CA: 75000,
    Objectif_Qte: 5,
    Zone_cible: 'Global',
    Periode_Date_debut: '2024-03-15T00:00:00Z',
    Periode_Date_fin: '2024-12-31T00:00:00Z',
    Statut_projet: 'IN_PROGRESS',
    Notes_projet: 'Ongoing maintenance contract'
  },
  {
    Id_projet: '4',
    Type_projet: 'DEVELOPMENT',
    Produit_cible: 'E-commerce Platform',
    Description_projet: 'Build a new e-commerce platform with advanced features',
    Objectif_CA: 200000,
    Objectif_Qte: 1,
    Zone_cible: 'Asia Pacific',
    Periode_Date_debut: '2024-05-01T00:00:00Z',
    Periode_Date_fin: '2024-11-30T00:00:00Z',
    Statut_projet: 'PLANNED',
    Notes_projet: 'Major project for retail client'
  },
  {
    Id_projet: '5',
    Type_projet: 'RESEARCH',
    Produit_cible: 'AI Implementation',
    Description_projet: 'Research and implement AI solutions for automation',
    Objectif_CA: 100000,
    Objectif_Qte: 2,
    Zone_cible: 'Global',
    Periode_Date_debut: '2024-04-15T00:00:00Z',
    Periode_Date_fin: '2024-08-31T00:00:00Z',
    Statut_projet: 'IN_PROGRESS',
    Notes_projet: 'Innovation initiative'
  },
  {
    Id_projet: '6',
    Type_projet: 'MAINTENANCE',
    Produit_cible: 'Security Updates',
    Description_projet: 'Implement security updates across client systems',
    Objectif_CA: 80000,
    Objectif_Qte: 10,
    Zone_cible: 'North America',
    Periode_Date_debut: '2024-03-01T00:00:00Z',
    Periode_Date_fin: '2024-05-31T00:00:00Z',
    Statut_projet: 'COMPLETED',
    Notes_projet: 'Critical security maintenance'
  }
];

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

export async function createProject(project: Omit<Project, 'Id_projet'>): Promise<Project> {
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