import { View, Text, TouchableOpacity, DimensionValue, Pressable } from 'react-native';
import { AppImage } from '../atoms/AppImage';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { HotelAvailability } from '../../services/public';

// Mêmes couleurs que la carte hôtel du site (vert / rouge / orange)
const AVAILABILITY_COLORS: Record<HotelAvailability, string> = {
  disponible: '#16a34a',
  complet: '#ef4444',
  en_pause: '#f97316',
};

interface HotelCardProps {
  imageUri: string;
  /** Disponibilité de ce soir renvoyée par l'API (`disponibilite`) */
  availability?: HotelAvailability | null;
  name: string;
  price: string;
  rating: number;
  defaultFavorite?: boolean;
  width?: DimensionValue;
  marginRight?: number;
  onPress?: () => void;
  onFavoriteToggle?: (newState: boolean) => void;
}

export const HotelCard = ({
  imageUri,
  availability,
  name,
  price,
  rating,
  defaultFavorite = false,
  width = 165,
  marginRight = 14,
  onPress,
  onFavoriteToggle,
}: HotelCardProps) => {
  const { t } = useTranslation();
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(safeRating);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={12} color="#fbbf24" style={{ marginRight: 2 }} />);
      } else {
        stars.push(<FontAwesome key={i} name="star" size={12} color="#e5e7eb" style={{ marginRight: 2 }} />);
      }
    }
    return stars;
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white"
      style={{
        width: width,
        borderRadius: 24,
        marginRight: marginRight,
        marginBottom: 8,
      }}
    >
      {/* Image de l'hébergement avec tous les 4 coins arrondis */}
      <View 
        className="relative w-full h-[170px]"
        style={{
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        <AppImage
          variant="sm"
          source={imageUri}
          recyclingKey={imageUri}
          style={{ width: '100%', height: '100%', borderRadius: 24 }}
        />
        
        {/* Icône Coeur de favori (sans fond blanc, flottant en haut à droite) */}
        <TouchableOpacity
          onPress={() => onFavoriteToggle?.(!defaultFavorite)}
          className="absolute top-3 right-3"
          style={{ zIndex: 10 }}
        >
          <Ionicons 
            name="heart" 
            size={28} 
            color={defaultFavorite ? "#ff2d55" : "rgba(255, 255, 255, 0.75)"} 
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.25)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2.5,
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Détails de l'hébergement */}
      <View className="p-3">
        {/* Titre / Nom */}
        <Text className="text-[13px] font-bold text-gray-900 leading-tight" numberOfLines={1}>
          {name}
        </Text>

        {/* Disponibilité de ce soir (calculée par l'API) ; rien si inconnue (hôtel sans chambre) */}
        {availability ? (
          <Text
            style={{ color: AVAILABILITY_COLORS[availability], fontFamily: 'Outfit_600SemiBold', fontSize: 11, marginTop: 2, marginBottom: 2 }}
            numberOfLines={1}
          >
            {t(`HotelCard.availability_${availability}`)}
          </Text>
        ) : null}

        {/* Prix de la nuité */}
        <Text className="text-gray-600 font-bold text-[12px] mb-2">
          {price}
        </Text>

        {/* Ligne séparatrice horizontale fine */}
        <View className="h-[1px] bg-gray-100 w-full mb-2" />

        {/* Étoiles de notation & Score textuel */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row">
            {renderStars()}
          </View>
          <Text className="text-gray-500 font-bold text-[11px]">
            {safeRating.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
