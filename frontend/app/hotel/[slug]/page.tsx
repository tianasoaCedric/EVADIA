'use client'

import * as React from 'react'
import HotelClient from './HotelClient'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Décoder l'ID depuis le slug (dernier segment)
const decodeIdFromSlug = (slug: string): number => {
  const encodedId = slug.split('-').pop() || '0'
  return parseInt(encodedId, 36)
}

// Extraire le nom depuis le slug (sans l'ID encodé)
const getHotelNameFromSlug = (slug: string): string => {
  const parts = slug.split('-')
  parts.pop()
  return parts.join(' ').replace(/-/g, ' ')
}

export default function HotelPage({ params }: PageProps) {
  // Déballer la Promise avec React.use() dans un composant client
  const { slug } = React.use(params)
  const hotelId = decodeIdFromSlug(slug)
  const hotelName = getHotelNameFromSlug(slug)
  
  return <HotelClient hotelId={hotelId} hotelName={hotelName} slug={slug} />
}