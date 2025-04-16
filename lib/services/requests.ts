import { Request } from "@/lib/types/request";
import * as z from "zod";

export const RequestSchema = z.object({
    Id_requete: z.string(),
    Date_requete: z.string(),
    Id_Client: z.string(),
    Type_requete: z.string(),
    Cible_requete: z.string(),
    Description_requete: z.string(),
    Statut_requete: z.string(),
    Notes_requete: z.string().optional(),
    Date_traitement_requete: z.string().optional(),
    Heure_traitement_requete: z.string().optional(),
})


export const createRequest = async (data: Omit<Request, 'Id_requete'>): Promise<any> => {
    // Placeholder function - replace with actual API call
    console.log("Creating request:", data);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 500);
    });
};

export const getRequest = async (id: string): Promise<Request | null> => {
    // Placeholder function - replace with actual API call
    console.log("Getting request with id:", id);
    return {
        Id_requete: id,
        Date_requete: "2025-04-03",
        Id_Client: "client123",
        Type_requete: "Type A",
        Cible_requete: "Target X",
        Description_requete: "This is a test request",
        Statut_requete: "Open",
        Notes_requete: "Some notes",
        Date_traitement_requete: "2025-04-04",
        Heure_traitement_requete: "10:00",
    };
};

const mockRequests: Request[] = [
    {
        Id_requete: '1',
        Date_requete: '2024-03-31',
        Id_Client: '123',
        Type_requete: 'Technique',
        Cible_requete: 'Reclamation',
        Description_requete: 'Server is down',
        Date_traitement_requete: '2024-03-31',
        Heure_traitement_requete: '10:00',
        Statut_requete: 'Saisie',
        Notes_requete: 'Server restarted',
    },
    {
        Id_requete: '2',
        Date_requete: '2024-03-30',
        Id_Client: '456',
        Type_requete: 'Commercial',
        Cible_requete: 'Notification',
        Description_requete: 'Incorrect invoice amount',
        Statut_requete: 'Notifiée',
    },
    {
        Id_requete: '3',
        Date_requete: '2024-04-01',
        Id_Client: '789',
        Type_requete: 'Logistique',
        Cible_requete: 'Demande',
        Description_requete: 'Cannot access account',
        Statut_requete: 'Clôturé',
    },
    {
        Id_requete: '4',
        Date_requete: '2024-04-02',
        Id_Client: '101',
        Type_requete: 'ADV',
        Cible_requete: 'Suggestion',
        Description_requete: 'Suggestion for improvement',
        Statut_requete: 'Saisie',
    },
];

export const getRequests = async (): Promise<Request[]> => {
    return mockRequests;
};
