export interface HotelSummary {
  id: number;
  nom: string;
  etoiles: number;
  photo_principale: string | null;
  ville: string | null;
  prix_min: number | null;
  prix_min_mga: number | null;
  prix_min_eur: number | null;
  note_moyenne: number | null;
}

export interface Chambre {
  id: number;
  nom: string;
  type_propriete: string;
  capacite: number;
  nb_chambres: number;
  nb_lits: number;
  nb_salles_bain: number;
  superficie: number | null;
  prix_par_nuit: number | null;
  devise: string | null;
  prix_mga: number | null;
  prix_eur: number | null;
  photos: string[];
}

export interface ProprieteDetail {
  id: number;
  nom: string;
  description: string | null;
  type_propriete: string;
  capacite: number;
  nb_chambres: number;
  nb_lits: number;
  nb_salles_bain: number;
  superficie: number | null;
  prix_par_nuit: number | null;
  devise: string | null;
  prix_mga: number | null;
  prix_eur: number | null;
  photos: { url_photo: string; est_principale: boolean; ordre: number }[];
  equipements: { id: number; nom: string; categorie: string; icone: string | null }[];
  hotel: {
    id: number;
    nom: string;
    etoiles: number;
    adresse: { ville: string; pays: string } | null;
    exige_acompte: boolean;
    pourcentage_acompte: number | null;
  };
}

export interface HotelDetail {
  hotel: {
    id: number;
    nom: string;
    etoiles: number;
    description?: string;
    adresse?: { ville: string; pays: string };
  };
  photos: { url_photo: string; est_principale: boolean; ordre: number }[];
  chambres: Chambre[];
}

export type StatutReservation = "en_attente" | "acceptee" | "refusee" | "annulee" | "terminee";

export interface Reservation {
  id: number;
  code_reservation: string;
  date_debut: string;
  date_fin: string;
  nb_adultes: number;
  nb_enfants: number;
  prix_total: number;
  devise_prix_total: string;
  statut: StatutReservation;
  propriete?: {
    id: number;
    nom: string;
    hotel?: { id: number; nom: string };
    photo_principale?: { url_photo: string };
  };
}

export type TypeMessage = "texte" | "systeme" | "choix_paiement";

export interface ModePaiementOption {
  code: string;
  libelle: string;
}

export interface ReservationMessage {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  reservation_id: number;
  type: TypeMessage;
  sujet: string;
  contenu: string;
  metadata?: { options?: ModePaiementOption[]; mode_paiement?: string } | null;
  lu: boolean;
  date_envoi: string;
}

export interface ReservationMessagesResponse {
  data: ReservationMessage[];
  chat_ferme: boolean;
}
