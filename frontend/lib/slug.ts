// Encoder l'ID en base36
export const encodeId = (id: number): string => {
  return id.toString(36)
}

// Décoder l'ID depuis le slug
export const decodeIdFromSlug = (slug: string): number => {
  const encodedId = slug.split('-').pop() || '0'
  return parseInt(encodedId, 36)
}

// Extraire le nom depuis le slug (sans l'ID encodé)
export const getNameFromSlug = (slug: string): string => {
  const parts = slug.split('-')
  parts.pop()
  return parts.join(' ').replace(/-/g, ' ')
}

// Créer un slug complet
export const createSlug = (id: number, name: string): string => {
  const slugName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  const encodedId = encodeId(id)
  return `${slugName}-${encodedId}`
}