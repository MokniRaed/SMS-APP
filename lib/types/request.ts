export interface Request {
    Id_requete: string;
    Date_requete: string;
    Id_Client: string;
    Type_requete: string;
    Cible_requete: string;
    Description_requete: string;
    Date_traitement_requete?: string;
    Heure_traitement_requete?: string;
    Statut_requete: string;
    Notes_requete?: string;
}
