import { z } from 'zod';
import api from '@/lib/axios';

export const ClientContactSchema = z.object({
  id: z.string().min(1, 'Client ID is required'),
  id_client: z.string().min(1, 'Client ID is required'),
  nom_prenom_contact: z.string().min(1, 'Name is required'),
  fonction_contact: z.string().optional(),
  numero_fix: z.string().optional(),
  numero_mobile: z.string().optional(),
  adresse_email: z.string().email().optional(),
  compte_facebook: z.string().optional(),
  compte_instagram: z.string().optional(),
  compte_linkedin: z.string().optional(),
  compte_whatsapp: z.string().optional(),
  compte_whatsapp_num: z.string().optional(),
  canal_interet: z.string().optional(),
});

export type ClientContact = z.infer<typeof ClientContactSchema>;

// Mock data for fallback
const mockClientContacts: ClientContact[] = [
  {
    id: '1',
    id_client: 'CLI001',
    nom_prenom_contact: 'John Smith',
    fonction_contact: 'Manager',
    numero_fix: '+1 555-0123',
    numero_mobile: '+1 555-4567',
    adresse_email: 'john.smith@acme.com',
    compte_linkedin: 'linkedin.com/in/johnsmith',
    canal_interet: 'Email'
  },
  {
    id: '2',
    id_client: 'CLI002',
    nom_prenom_contact: 'Sarah Johnson',
    fonction_contact: 'Director',
    numero_fix: '+1 555-8901',
    numero_mobile: '+1 555-2345',
    adresse_email: 'sarah.j@techstart.com',
    compte_whatsapp: '@sarahj',
    compte_whatsapp_num: '+1 555-2345',
    canal_interet: 'WhatsApp'
  }
];

export async function getClientContacts(): Promise<ClientContact[]> {
  try {
    const response = await api.get('/api/clients/contacts');
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for client contacts');
    return mockClientContacts;
  }
}

export async function getClientContact(id: string): Promise<ClientContact> {
  try {
    const response = await api.get(`/api/clients/contacts/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for client contact');
    const contact = mockClientContacts.find(c => c.id === id);
    if (!contact) throw new Error('Client contact not found');
    return contact;
  }
}

export async function createClientContact(contact: Omit<ClientContact, 'id'>): Promise<ClientContact> {
  try {
    const response = await api.post('/api/clients/contacts', contact);
    return response.data;
  } catch (error) {
    console.warn('Falling back to mock data for create client contact');
    return {
      ...contact,
      id: Math.random().toString(36).substr(2, 9)
    };
  }
}

export async function updateClientContact(id: string, contact: Partial<ClientContact>): Promise<ClientContact> {
  try {
    const response = await api.patch(`/api/clients/contacts/${id}`, contact);
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
    await api.delete(`/api/clients/contacts/${id}`);
  } catch (error) {
    console.warn('Falling back to mock data for delete client contact');
    return Promise.resolve();
  }
}

export async function uploadContacts(file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/api/clients/upload-contacts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    throw new Error('Failed to upload contacts');
  }
}