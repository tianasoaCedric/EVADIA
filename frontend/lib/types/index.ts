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
  slug: string
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
  adresse?: Adresse
  photos?: Photo[]
  types?: TypeHotel[]
}

/** Réponse complète de GET /hotels/{id} */
export interface HotelDetail {
  hotel: Hotel & {
    email_contact?: string
    telephone?: string
    site_web?: string
  }
  photos: Photo[]
  chambres: Chambre[]
  services: { id: number; nom: string }[]
  note_moyenne: number | null
  nb_avis: number
}

export interface HotelFilters {
  page?: number
  search?: string
  destination_id?: number
  etoiles_min?: number
  date_debut?: string
  date_fin?: string
  nb_adultes?: number
  sort?: 'prix_asc' | 'prix_desc' | 'note_desc' | 'etoiles_desc'
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

export type StatutReservation = 'en_attente' | 'confirmee' | 'annulee' | 'terminee'

export interface Reservation {
  id: number
  hotel_id: number
  chambre_id: number
  date_debut: string
  date_fin: string
  nb_adultes: number
  nb_enfants: number
  statut: StatutReservation
  montant_total: number
  devise: string
  notes_client?: string
  hotel?: Hotel
  chambre?: Chambre
  created_at: string
}

export interface CreateReservationPayload {
  chambre_id: number
  date_debut: string
  date_fin: string
  nb_adultes: number
  nb_enfants?: number
  notes_client?: string
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
