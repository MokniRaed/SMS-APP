import api from '@/lib/axios';
import { z } from 'zod';

export const ProjectSchema = z.object({
  // _id: z.string().min(1, 'Project ID is required'),
  nom_projet: z.string().min(1, 'Project name is required'),
  type_projet: z.string().min(1, 'Project type is required'),
  produit_cible: z.string().optional(),
  description_projet: z.string().optional(),
  objectif_ca: z.number().optional(),
  objectif_qte: z.number().optional(),
  zone_cible: z.array(z.string()).optional(),
  periode_date_debut: z.string().min(1, 'Date is required'),
  periode_date_fin: z.string().min(1, 'Date is required'),
  statut_projet: z.string().optional(),
  notes_projet: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema> & {
  _id: string;
};

export type ZoneOption = {
  _id: string;
  zone_cible: string;
  sous_Zone_cible: string;
};

// Mock data for projects
const mockProjects: Project[] = [
  {
    _id: '1',
    type_projet: 'DEVELOPMENT',
    produit_cible: 'Mobile App Development',
    description_projet: 'Develop a new mobile application for client management',
    objectif_ca: 150000,
    objectif_qte: 1,
    zone_cible: ['North America'],
    periode_date_debut: '2024-03-01T00:00:00Z',
    periode_date_fin: '2024-06-30T00:00:00Z',
    statut_projet: 'IN_PROGRESS',
    notes_projet: 'High priority project for Q2'
  },
  {
    _id: '2',
    type_projet: 'RESEARCH',
    produit_cible: 'Market Analysis',
    description_projet: 'Conduct market research for expansion opportunities',
    objectif_ca: 50000,
    objectif_qte: 1,
    zone_cible: ['Europe'],
    periode_date_debut: '2024-04-01T00:00:00Z',
    periode_date_fin: '2024-05-31T00:00:00Z',
    statut_projet: 'PLANNED',
    notes_projet: 'Strategic initiative for international expansion'
  },
  {
    _id: '3',
    type_projet: 'MAINTENANCE',
    produit_cible: 'Legacy System Update',
    description_projet: 'Upgrade and maintain existing client systems',
    objectif_ca: 75000,
    objectif_qte: 5,
    zone_cible: ['Global'],
    periode_date_debut: '2024-03-15T00:00:00Z',
    periode_date_fin: '2024-12-31T00:00:00Z',
    statut_projet: 'IN_PROGRESS',
    notes_projet: 'Ongoing maintenance contract'
  },
  {
    _id: '4',
    type_projet: 'DEVELOPMENT',
    produit_cible: 'E-commerce Platform',
    description_projet: 'Build a new e-commerce platform with advanced features',
    objectif_ca: 200000,
    objectif_qte: 1,
    zone_cible: ['Asia Pacific'],
    periode_date_debut: '2024-05-01T00:00:00Z',
    periode_date_fin: '2024-11-30T00:00:00Z',
    statut_projet: 'PLANNED',
    notes_projet: 'Major project for retail client'
  },
  {
    _id: '5',
    type_projet: 'RESEARCH',
    produit_cible: 'AI Implementation',
    description_projet: 'Research and implement AI solutions for automation',
    objectif_ca: 100000,
    objectif_qte: 2,
    zone_cible: ['Global'],
    periode_date_debut: '2024-04-15T00:00:00Z',
    periode_date_fin: '2024-08-31T00:00:00Z',
    statut_projet: 'IN_PROGRESS',
    notes_projet: 'Innovation initiative'
  },
  {
    _id: '6',
    type_projet: 'MAINTENANCE',
    produit_cible: 'Security Updates',
    description_projet: 'Implement security updates across client systems',
    objectif_ca: 80000,
    objectif_qte: 10,
    zone_cible: ['North America'],
    periode_date_debut: '2024-03-01T00:00:00Z',
    periode_date_fin: '2024-05-31T00:00:00Z',
    statut_projet: 'COMPLETED',
    notes_projet: 'Critical security maintenance'
  }
];

export async function getProjects(page: string = '1', limit: string = '10'): Promise<any> {
  try {
    const response = await api.get('/projects', {
      params: {
        page,
        limit,
      },
    });
    return response;
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return mockProjects;
  }
}


export async function getProject(id: string): Promise<Project> {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for project');
    const project = mockProjects.find(p => p._id === id);
    if (!project) throw new Error('Project not found');
    return project;
  }
}

export async function createProject(project: Omit<Project, '_id'>): Promise<Project> {
  try {
    const response = await api.post('/projects', project);
    return response.data;
  } catch (error) {
    console.log("err", error);
    return error.response.data

  }
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  try {
    const response = await api.patch(`/projects/${id}`, project);
    return response.data;
  } catch (error) {
    return error.response.data

  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await api.delete(`/projects/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete project');
    return Promise.resolve();
  }
}


export async function getProjectsTypes(): Promise<Project[]> {
  try {
    const response = await api.get('/projects/type');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return mockProjects;
  }
}

export async function getProjectsStatus(): Promise<Project[]> {
  try {
    const response = await api.get('/projects/status');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return mockProjects;
  }
}


export async function getProjectsProductCible(): Promise<Project[]> {
  try {
    const response = await api.get('/projects/produit-cible');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return mockProjects;
  }
}

export async function getProjectsZones(): Promise<Project[]> {
  try {
    const response = await api.get('/projects/zones');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return mockProjects;
  }
}
export async function getProjectsZonesDropdown({
  pageParam = 1,
  search,
}: {
  pageParam?: number;
  search?: string;
}): Promise<{ data: Project[]; nextPage: number | null }> {
  try {
    const response = await api.get('/projects/zones/dropdown', {
      params: {
        page: pageParam,
        limit: 10,
        search, // Add search parameter to API call
      },
    });
    console.log("response", response);


    return {
      data: response.data,
      nextPage: response.nextPage,
    };
  } catch (error) {
    console.warn('Falling back to mock data for projects');
    return { data: mockProjects, nextPage: null };
  }
}

// export async function getProjectsZones({ pageParam = 1 }): Promise<{ data: Project[]; nextPage: number | null }> {
//   try {
//     const response = await api.get('/projects/zones', {
//       params: {
//         page: pageParam,
//         limit: 20, // or any chunk size
//       },
//     });

//     const hasMore = response.data.length === 20;
//     return {
//       data: response.data,
//       nextPage: hasMore ? pageParam + 1 : null,
//     };
//   } catch (error) {
//     console.warn('Falling back to mock data for projects');
//     return { data: mockProjects, nextPage: null };
//   }
// }
