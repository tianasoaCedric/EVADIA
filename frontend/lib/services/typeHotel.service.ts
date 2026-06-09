import { apiClient } from '@/lib/api-client'

export interface TypeHotelApi {
  id: number
  nom: string
  description: string | null
  image: string | null
}

const PLACEHOLDER = '/photos/bc.png'

export interface TypeHotelWithImage extends TypeHotelApi {
  imageUrl: string
}

export const typeHotelService = {
  async list(): Promise<TypeHotelWithImage[]> {
    const { data } = await apiClient.get<{ data: TypeHotelApi[] }>('/types-hotels')
    return data.map((type) => ({ ...type, imageUrl: type.image ?? PLACEHOLDER }))
  },
}
