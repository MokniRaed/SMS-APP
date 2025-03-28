import api from '@/lib/axios';
import { z } from 'zod';

// Define the function type
export const FonctionContactSchema = z.object({
  _id: z.string(),
  nom_fonc: z.string(),
  description_fonc: z.string()
});

export type FonctionContact = z.infer<typeof FonctionContactSchema>;

export const ClientContactSchema = z.object({
  id_client: z.string().min(1, 'Client ID is required'),
  nom_prenom_contact: z.string().min(1, 'Name is required'),
  fonction_contact: z.string().min(1, 'Function is required'),
  numero_fix: z.string().optional(),
  numero_mobile: z.string().optional(),
  adresse_email: z.string().email().optional(),
  compte_facebook: z.string().optional(),
  compte_instagram: z.string().optional(),
  compte_linkedin: z.string().optional(),
  compte_whatsapp: z.string().optional(),
  compte_whatsapp_num: z.string().optional(),
  canal_interet: z.string().optional(),
  is_user:z.boolean()
});

export type ClientContact = z.infer<typeof ClientContactSchema>;

// Add function to get all functions
export async function getFonctions(): Promise<FonctionContact[]> {
  try {
    const response = await api.get('/clients/fonction-contacts');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for functions');
    return [    ];
  }
}

export async function getClientContacts(page: string = '1', limit: string = '10'): Promise<any> {
  try {
    const response = await api.get('/clients/contacts', {
      params: {
        page,
        limit,
      },
    });
    return response;
  } catch (error) {
    console.warn('Falling back to mock data for client contacts');
    return [];
  }
}

export async function getClientContact(id: string): Promise<ClientContact> {
  try {
    const response = await api.get(`/clients/contacts/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for client contact');
    const contact = [].find(c => c.id === id);
    if (!contact) throw new Error('Client contact not found');
    return contact;
  }
}

export async function createClientContact(contact: Omit<ClientContact, 'id'>): Promise<ClientContact> {
  try {
    const response = await api.post('/clients/contacts', contact);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create client contact');
    return{
      
      ...contact,
      // id: Math.random().toString(36).substr(2, 9)
    };
  }
}

export async function updateClientContact(id: string, contact: Partial<ClientContact>): Promise<ClientContact> {
  try {
    const response = await api.patch(`/clients/contacts/${id}`, contact);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for update client contact');
    const existingContact = await getClientContact(id);
    return {
      ...existingContact,
      ...contact
    };
  }
}

export async function deleteClientContact(id: string): Promise<void> {
  try {
    await api.delete(`/clients/contacts/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete client contact');
    return Promise.resolve();
  }
}

export async function uploadContacts(file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/clients/upload-contacts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    throw new Error('Failed to upload contacts');
  }
}
