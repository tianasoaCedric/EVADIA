import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View, Animated } from 'react-native';

interface DestinationHotelCardProps {
  name: string;
  price: string;
  rating: number;
  location: string;
  imageUri?: string;
  imageUris?: string[];
  defaultFavorite?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: (newState: boolean) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32; // FlatList paddingHorizontal est de 16 de chaque côté

export const DestinationHotelCard = ({
  name,
  price,
  rating,
  location,
  imageUri,
  imageUris,
  defaultFavorite = false,
  onPress,
  onFavoriteToggle,
}: DestinationHotelCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  // Préparer le tableau d'images
  const images = imageUris && imageUris.length > 0
    ? imageUris
    : imageUri ? [imageUri] : [];

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / cardWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  // Générer les étoiles dorées et grises
  const renderStars = () => {
    const stars = [];
    const floorRating = Math.floor(safeRating);

    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(
          <Ionicons key={`star-${i}`} name="star" size={14} color="#fbbf24" style={{ marginRight: 2 }} />
        );
      } else {
        stars.push(
          <Ionicons key={`star-${i}`} name="star" size={14} color="#e5e7eb" style={{ marginRight: 2 }} />
        );
      }
    }
    return stars;
  };

  return (
    <Animated.View
      style={{
        width: '100%',
        marginBottom: 24,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Conteneur d'image principale */}
      <View
        style={{
          width: '100%',
          height: 330,
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#f3f4f6',
          position: 'relative',
        }}
      >
        {/* Carrousel horizontal d'images - cliquable individuellement tout en permettant le swipe */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: '100%', height: '100%' }}
          contentContainerStyle={{ flexDirection: 'row' }}
        >
          {images.map((img, idx) => (
            <TouchableOpacity
              key={`img-touch-${idx}`}
              activeOpacity={0.92}
              onPress={onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={{ width: cardWidth, height: 330 }}
            >
              <Image
                source={{ uri: img }}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bouton Favoris (Cœur) en haut à droite - flottant, sans cercle */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFavoriteToggle?.(!defaultFavorite)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 10,
          }}
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

        {/* Indicateurs de carrousel (dots) dynamiques en bas au centre */}
        {images.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {images.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <View
                  key={`dot-${idx}`}
                  style={{
                    width: isActive ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isActive ? '#01BDA5' : 'rgba(255, 255, 255, 0.8)',
                    marginRight: idx < images.length - 1 ? 6 : 0,
                  }}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Informations de l'hôtel sous l'image — cliquable pour ouvrir le détail */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginTop: 12, paddingHorizontal: 4 }}
      >
        {/* Ligne 1 : Nom et Localisation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#111827',
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={14} color="#6b7280" style={{ marginRight: 4 }} />
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
        </View>

        {/* Ligne 2 : Prix et Note */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text
            style={{
              fontSize: 14,
              color: '#374151',
              fontWeight: '600',
            }}
          >
            {price}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {renderStars()}
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                fontWeight: '700',
                marginLeft: 4,
              }}
            >
              {safeRating.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

