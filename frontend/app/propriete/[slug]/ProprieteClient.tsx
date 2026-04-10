'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share, Heart } from 'lucide-react'
import Bouton from '../../components/ui/Bouton'
import HotelPhoto from '../../components/ui/HotelPhoto'
import Reservation from '../../components/ui/Reservation'
import HotelInfo from '../../components/ui/HotelInfo'
import { Wifi, Snowflake, Tv, Bath, Coffee, Utensils } from 'lucide-react'

interface ProprieteClientProps {
    proprieteId: number
    proprieteName: string
    slug: string
}

// Données mock de la chambre (à remplacer par appel API)
const getRoomData = (id: number) => {
    const roomsData: Record<number, any> = {
        1: {
            id: 1,
            name: 'Suite de Luxe',
            images: ['/photos/chambre.jpg', '/photos/test.jpg', '/photos/chambre.jpg', '/photos/test.jpg'],
            price: 225000,
            discountPercent: 20,
            serviceFees: 0,
            availability: 'Disponible',
            location: 'Antananarivo, Madagascar',
            rating: 4.9,
            reviewCount: 128,
            category: 'Suite de luxe',
            description: 'Suite luxueuse avec vue imprenable sur l\'océan. Profitez d\'un espace de 50m² entièrement rénové, d\'une terrasse privée et d\'un service de conciergerie 24h/24.',
            beds: 1,
            bathrooms: 1,
            maxPersons: 2,
            includedItems: [
                'Wi-Fi haut débit',
                'Serviettes de bain',
                'Gel douche et shampooing',
                'Sèche-cheveux',
                'Machine à café',
                'Eau minérale offerte'
            ],
            equipments: [
                { id: 1, name: 'Wi-Fi gratuit', icon: <Wifi className="w-5 h-5" /> },
                { id: 2, name: 'Climatisation', icon: <Snowflake className="w-5 h-5" /> },
                { id: 3, name: 'Télévision', icon: <Tv className="w-5 h-5" /> },
                { id: 4, name: 'Salle de bain privée', icon: <Bath className="w-5 h-5" /> },
                { id: 5, name: 'Petit-déjeuner', icon: <Coffee className="w-5 h-5" /> },
                { id: 6, name: 'Restaurant', icon: <Utensils className="w-5 h-5" /> },
            ]
        }
    }
    return roomsData[id] || null
}

export default function ProprieteClient({ proprieteId, proprieteName, slug }: ProprieteClientProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    const [room, setRoom] = useState<any>(null)

    useEffect(() => {
        const fetchRoom = async () => {
            setIsLoading(true)
            try {
                const data = getRoomData(proprieteId)
                setRoom(data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRoom()
    }, [proprieteId])

    const handleSave = () => {
        setIsSaved(!isSaved)
        console.log('Chambre sauvegardée')
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: proprieteName,
                text: `Découvrez ${proprieteName} sur Evadia`,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Lien copié dans le presse-papier !')
        }
    }

    const handleReservation = (data: any) => {
        console.log('Réservation:', data)
        // Rediriger vers la page de paiement
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Chargement...</div>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Chambre non trouvée</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Header avec retour, titre et boutons */}
                <div className="flex flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="rounded-full transition-colors cursor-pointer"
                            aria-label="Retour"
                        >
                            <ChevronLeft className="w-8 h-8 text-gray-600 hover:text-[#01BDA5] transition-colors" />
                        </button>
                        <h1 className="text-xl md:text-3xl lg:text-4xl font-medium text-gray-800">
                            {proprieteName}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Bouton
                            size="medium"
                            onClick={handleSave}
                            className="flex items-center gap-2"
                        >
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            <span className="hidden sm:inline">{isSaved ? 'Enregistré' : 'Enregistrer'}</span>
                        </Bouton>

                        <Bouton
                            size="medium"
                            onClick={handleShare}
                            className="flex items-center gap-2"
                        >
                            <Share className="w-5 h-5" />
                            <span className="hidden sm:inline">Partager</span>
                        </Bouton>
                    </div>
                </div>

                {/* Photos de la chambre */}
                <div className="py-4">
                    <HotelPhoto
                        imageUrl={room.images}
                        autoPlayInterval={5000}
                        className="mb-4"
                    />
                </div>

                {/* Section informations avec HotelInfo et Reservation */}
                <div className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        {/* Colonne 1 : HotelInfo - Utilisation du layout 'rows' pour la chambre */}
                        <div>
                            <HotelInfo
                                hotelName={room.name}
                                location={room.location}
                                rating={room.rating}
                                reviewCount={room.reviewCount}
                                category={room.category}
                                description={room.description}
                                beds={room.beds}
                                bathrooms={room.bathrooms}
                                maxPersons={room.maxPersons}
                                includedItems={room.includedItems}
                                equipments={room.equipments}
                                layout="rows"
                            />
                        </div>

                        {/* Colonne 2 : Reservation */}
                        <div className="lg:sticky lg:top-24">
                            <Reservation
                                pricePerNight={room.price}
                                discountPercent={room.discountPercent || 0}
                                serviceFees={room.serviceFees || 0}
                                roomName={room.name}
                                onReserve={handleReservation}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}