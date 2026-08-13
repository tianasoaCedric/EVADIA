// ─── Types partagés ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface Role {
  id: number
  code: string
  nom: string
  niveau: number
}

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  devise_preferee?: string
  langue_preferee?: string
  avatar_url?: string | null
  est_actif: boolean
  email_verified: boolean
  force_password_change: boolean
  roles: Role[]
}

export interface AuthResponse {
  user: User
  token: string
  token_type: string
  expires_in: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nom: string
  prenom: string
  email: string
  password: string
  password_confirmation: string
  telephone?: string
}

// ─── Destination ─────────────────────────────────────────────────────────────

export interface Destination {
  id: number
  nom: string
  description?: string
  image_url?: string | null
  hotels_count: number
}

// ─── Hotel ────────────────────────────────────────────────────────────────────

export interface Adresse {
  id: number
  adresse_ligne1: string
  adresse_ligne2?: string
  code_postal: string
  ville: string
  pays: string
  latitude?: number
  longitude?: number
}

export interface Photo {
  id: number
  url_photo: string
  ordre: number
  est_principale: boolean
}

export interface TypeHotel {
  id: number
  nom: string
  slug?: string
  description?: string | null
  image?: string | null
}

export interface Hotel {
  id: number
  nom: string
  description?: string
  email_contact?: string
  telephone?: string
  site_web?: string
  etoiles: number
  devise_principale: string
  note_moyenne?: number
  prix_min?: number
  prix_min_mga?: number
  prix_min_eur?: number
  photo_principale?: string | null
  adresse?: Adresse
  photos?: Photo[]
  types?: TypeHotel[]
  destination_id?: number | null
  type_hebergement_id?: number | null
  nb_avis?: number
  offre_type?: string | null
  discount?: number | null
}

/** Chambre telle que retournée dans GET /hotels/{id} */
export interface ChambrePublic {
  id: number
  nom: string
  type_propriete: string
  capacite: number
  nb_chambres?: number
  nb_lits?: number
  nb_salles_bain?: number
  superficie?: number
  prix_par_nuit?: number
  devise?: string
  prix_mga?: number
  prix_eur?: number
  photos?: string[]
}

/** Détail complet d'une chambre — GET /proprietes/{id} */
export interface ProprietePublic {
  id: number
  nom: string
  description?: string
  type_propriete: string
  capacite: number
  nb_chambres?: number
  nb_lits?: number
  nb_salles_bain?: number
  superficie?: number
  prix_par_nuit?: number
  devise?: string
  prix_mga?: number
  prix_eur?: number
  photos: { url_photo: string; est_principale: boolean; ordre: number }[]
  equipements: { id: number; nom: string; categorie: string; icone?: string }[]
  hotel: {
    id: number
    nom: string
    etoiles: number
    adresse?: { ville: string; pays: string }
    exige_acompte?: boolean
    pourcentage_acompte?: number
  }
}

/** Réponse complète de GET /hotels/{id} */
export interface HotelDetail {
  hotel: Hotel & {
    adresse?: Adresse
    types?: TypeHotel[]
  }
  photos: { url_photo: string; est_principale: boolean; ordre: number }[]
  chambres: ChambrePublic[]
  services: { id: number; nom: string }[]
  note_moyenne: number | null
  nb_avis: number
}

export interface HotelFilters {
  page?: number
  search?: string
  destination_id?: number
  type_id?: number
  etoiles_min?: number
  date_debut?: string
  date_fin?: string
  nb_adultes?: number
  sort?: 'prix_asc' | 'prix_desc' | 'note_desc' | 'etoiles_desc'
  prix_min?: number
  prix_max?: number
  disponible?: boolean
  note_min?: number
}

// ─── Chambre / Propriété ──────────────────────────────────────────────────────

export interface Chambre {
  id: number
  hotel_id: number
  nom: string
  description?: string
  capacite_adultes: number
  capacite_enfants: number
  nb_lits: number
  nb_salles_bain: number
  superficie?: number
  prix_base: number
  devise: string
  photos?: Photo[]
}

// ─── Réservation ──────────────────────────────────────────────────────────────

export type StatutReservation = 'en_attente' | 'acceptee' | 'refusee' | 'annulee' | 'terminee'

export interface Reservation {
  id: number
  code_reservation: string
  hotel_id?: number
  chambre_id?: number
  date_debut: string
  date_fin: string
  nb_adultes: number
  nb_enfants: number
  statut: StatutReservation
  montant_total?: number
  prix_total?: number
  devise_prix_total?: string
  montant_acompte?: number | null
  statut_paiement_acompte?: 'non_requis' | 'en_attente' | 'paye'
  demande_speciale?: string
  raison_refus?: string
  date_reservation: string
  hotel?: Hotel
  chambre?: Chambre
  propriete?: {
    id: number
    nom: string
    hotel?: Pick<Hotel, 'id' | 'nom'>
    photo_principale?: { url_photo: string }
  }
  facture?: {
    id: number
    numero: string
  }
  created_at?: string
}

export interface CreateReservationPayload {
  propriete_id: number
  date_debut: string
  date_fin: string
  nb_adultes: number
  nb_enfants?: number
  nb_bebes?: number
  demande_speciale?: string
  devise?: 'MGA' | 'EUR'
}

// ─── Favoris ──────────────────────────────────────────────────────────────────

export interface Favori {
  id: number
  hotel_id: number
  hotel: Hotel
  created_at: string
}

// ─── Avis ─────────────────────────────────────────────────────────────────────

export interface Avis {
  id: number
  reservation_id: number
  hotel_id: number
  note: number
  commentaire: string
  reponse_hotel?: string
  created_at: string
  hotel?: Pick<Hotel, 'id' | 'nom'>
}

export interface AvisPublic {
  id: number
  note: number
  commentaire: string
  reponse_hotel?: string
  date_avis: string
  client?: {
    id: number
    prenom: string
    nom: string
    photo_profil?: string
  }
  propriete?: {
    id: number
    nom: string
  }
}

export interface CreateAvisPayload {
  reservation_id: number
  note: number
  commentaire: string
}

// ─── Profil ───────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  nom?: string
  prenom?: string
  telephone?: string
  devise_preferee?: string
  langue_preferee?: string
}

export interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

// ─── Découverte ───────────────────────────────────────────────────────────────

export interface VilleDecouverte {
  id: number
  nom: string
  slug: string
  image: string | null
  ordre: number
  actif: boolean
  lieux_count?: number
}

export interface LieuDecouverte {
  id: number
  ville_id: number
  nom: string
  slug: string
  description: string | null
  emplacement: string | null
  images: string[] | null
  position_image: 'left' | 'right'
  ordre: number
  actif: boolean
}
