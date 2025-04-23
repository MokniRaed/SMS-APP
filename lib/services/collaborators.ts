import api from '@/lib/axios';
import { z } from 'zod';

// Define the function type
export const FonctionContactSchema = z.object({
  _id: z.string(),
  nom_fonc: z.string(),
  description_fonc: z.string()
});

// export type FonctionContact = z.infer<typeof FonctionContactSchema>;

export const CollaboratorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  numero_mobile: z.string().min(1, 'Mobile number is required'),
  adresse_email: z.string().email('Invalid email address'),
  fontion: z.string().min(1, 'Function is required'),
  service: z.string().min(1, 'Service is required'),
  is_user: z.boolean().optional() // optional since it has default in DB
});
export type Collaborator = z.infer<typeof CollaboratorSchema>;

// // Add function to get all functions
// export async function getFonctions(): Promise<FonctionContact[]> {
//   try {
//     const response = await api.get('/clients/fonction-contacts');
//     return response.data;
//   } catch (error) {
//     console.warn('Falling back to mock data for functions');
//     return [];
//   }
// }

export async function getCollaborators(page: string = '1', limit: string = '10'): Promise<any> {
  try {
    const response = await api.get('/collaborators', {
      params: {
        page,
        limit,
      },
    });
    return response;
  } catch (error) {
    console.warn('Falling back to mock data for collaborator contacts');
    return [];
  }
}

export async function getCollaborator(id: string): Promise<Collaborator> {
  try {
    const response = await api.get(`/collaborators/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for client contact');
    const contact = [].find(c => c.id === id);
    if (!contact) throw new Error('Client contact not found');
    return contact;
  }
}

export async function createCollaborator(contact: Omit<Collaborator, 'id'>): Promise<Collaborator> {
  try {
    const response = await api.post('/collaborators', contact);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create client contact');
    return {

      ...contact,
      // id: Math.random().toString(36).substr(2, 9)
    };
  }
}

export async function updateCollaborator(id: string, contact: Partial<Collaborator>): Promise<Collaborator> {
  try {
    const response = await api.patch(`/collaborators/${id}`, contact);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update client contact');
    const existingContact = await getCollaborator(id);
    return {
      ...existingContact,
      ...contact
    };
  }
}

export async function deleteCollaborator(id: string): Promise<void> {
  try {
    await api.delete(`/collaborators/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete collaborator contact');
    return Promise.resolve();
  }
}

// export async function createCollaboratorContact(contact: Omit<Collaborator, 'id'>): Promise<Collaborator> {
//   try {
//     const response = await api.post('/collaborators/contacts', contact);
//     return response.data;
//   } catch (error) {
//     console.warn('Falling back to mock data for create collaborator contact');
//     return {

//       ...contact,
//       // id: Math.random().toString(36).substr(2, 9)
//     };
//   }
// }

// export async function deleteClientContact(id: string): Promise<void> {
//   try {
//     await api.delete(`/clients/contacts/${id}`);
//   } catch (error) {
//     console.warn('Falling back to mock data for delete client contact');
//     return Promise.resolve();
//   }
// }

// export async function uploadContacts(file: File): Promise<void> {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);
//     await api.post('/clients/upload-contacts', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//   } catch (error) {
//     throw new Error('Failed to upload contacts');
//   }
// }
