import { z } from 'zod';
import api from '@/lib/axios';

export const LineCommandSchema = z.object({
  Id_commande: z.string().min(1, 'Order ID is required'),
  Id_ligne_cmd: z.string().min(1, 'Line ID is required'),
  Id_Article: z.string().min(1, 'Article ID is required'),
  Quantite_cmd: z.number().optional(),
  Quantite_valid: z.number().optional(),
  Quantite_confr: z.number().optional(),
  Statut_art_cmd: z.string().optional(),
  Notes_cmd: z.string().optional(),
});

export const CommandSchema = z.object({
  Id_commande: z.string().min(1, 'Order ID is required'),
  Date_cmd: z.string().datetime(),
  Id_Client: z.string().min(1, 'Client ID is required'),
  Id_Collaborateur: z.string().min(1, 'Collaborator ID is required'),
  Statut_cmd: z.string().min(1, 'Order status is required'),
  Date_livraison: z.string().datetime().optional(),
  Heure_livraison: z.string().optional(),
  Notes_cmd: z.string().optional(),
  lignes: z.array(LineCommandSchema),
});

export type LineCommand = z.infer<typeof LineCommandSchema>;
export type Command = z.infer<typeof CommandSchema>;

export async function getCommands(): Promise<Command[]> {
  return api.get('/commands');
}

export async function getCommand(id: string): Promise<Command> {
  return api.get(`/commands/${id}`);
}

export async function createCommand(command: Command): Promise<Command> {
  return api.post('/commands', command);
}

export async function updateCommand(id: string, command: Partial<Command>): Promise<Command> {
  return api.patch(`/commands/${id}`, command);
}

export async function deleteCommand(id: string): Promise<{ success: boolean }> {
  return api.delete(`/commands/${id}`);
}