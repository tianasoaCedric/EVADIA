import { View, Text, Image, TouchableOpacity, DimensionValue, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HotelCardProps {
  imageUri: string;
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
  name,
  price,
  rating,
  defaultFavorite = false,
  width = 165,
  marginRight = 14,
  onPress,
  onFavoriteToggle,
}: HotelCardProps) => {
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(safeRating);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={13} color="#fbbf24" style={{ marginRight: 2 }} />);
      } else {
        stars.push(<Ionicons key={i} name="star" size={13} color="#e5e7eb" style={{ marginRight: 2 }} />);
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
        <Image 
          source={{ uri: imageUri }} 
          className="w-full h-full"
          style={{ resizeMode: 'cover', borderRadius: 24 }}
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

        {/* Sous-titre disponibilité */}
        <Text className="text-gray-400 font-semibold text-[11px] mt-0.5 mb-0.5">
          Disponibilité
        </Text>

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
