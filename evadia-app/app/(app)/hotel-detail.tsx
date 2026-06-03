import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RoomCard } from '../../components/molecules/RoomCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.42);

// Données mockées pour les chambres et équipements
const MOCK_ROOMS = [
  {
    id: 'r1',
    name: 'Suite de Luxe',
    price: '225.000Ariary/nuit',
    imageUri:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=400',
    beds: 2,
    bathrooms: 2,
    persons: 4,
  },
  {
    id: 'r2',
    name: 'Bungalow Vue Mer',
    price: '180.000Ariary/nuit',
    imageUri:
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=400',
    beds: 1,
    bathrooms: 1,
    persons: 2,
  },
];

const EQUIPEMENTS = [
  { icon: 'wifi-outline', label: 'Wifi gratuit' },
  { icon: 'water-outline', label: 'Piscine' },
  { icon: 'car-outline', label: 'Parking' },
  { icon: 'flower-outline', label: 'Spa' },
  { icon: 'snow-outline', label: 'Climatisation' },
  { icon: 'restaurant-outline', label: 'Restaurant' },
  { icon: 'fitness-outline', label: 'Salle sport' },
  { icon: 'shield-checkmark-outline', label: 'Sécurité 24h' },
] as const;

export default function HotelDetailScreen() {
  const params = useLocalSearchParams();
  const hotelName = (params.name as string) || 'Hôtel';
  const hotelLocation = (params.location as string) || '';
  const hotelRating = parseFloat((params.rating as string) || '4.5');
  const imageUris: string[] = params.imageUris
    ? JSON.parse(params.imageUris as string)
    : [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
      ];

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeRoomIndex, activeRoomIndexSet] = useState(0);

  // Animation d'entrée fluide (fade-in + slide-up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const handleRoomScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 20));
    if (index !== activeRoomIndex) activeRoomIndexSet(index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={[]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        {/* ── Carrousel d'images plein largeur ────────────────────────── */}
        <View
          style={{
            width: screenWidth,
            height: IMAGE_HEIGHT,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
            zIndex: 10,
          }}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
              borderBottomLeftRadius: 36,
              borderBottomRightRadius: 36,
              overflow: 'hidden',
              backgroundColor: '#e5e7eb',
            }}
          >
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ width: screenWidth, height: IMAGE_HEIGHT }}
            >
              {imageUris.map((uri, idx) => (
                <Image
                  key={`hotel-img-${idx}`}
                  source={{ uri }}
                  style={{
                    width: screenWidth,
                    height: IMAGE_HEIGHT,
                    resizeMode: 'cover',
                  }}
                />
              ))}
            </ScrollView>

            {/* Bouton retour ← en haut à gauche */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(app)/destination-detail');
                }
              }}
              style={{
                position: 'absolute',
                top: 52,
                left: 18,
                zIndex: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="chevron-back"
                size={30}
                color="#fff"
                style={{
                  textShadowColor: 'rgba(0,0,0,0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
              />
            </TouchableOpacity>

            {/* Boutons partage + cœur en haut à droite */}
            <View
              style={{
                position: 'absolute',
                top: 52,
                right: 18,
                zIndex: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => console.log('Partager')}
                style={{ marginRight: 14 }}
              >
                <Ionicons
                  name="share-outline"
                  size={26}
                  color="#fff"
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.35)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 4,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons
                  name="heart"
                  size={28}
                  color={isFavorite ? '#ff2d55' : 'rgba(255,255,255,0.85)'}
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Dots indicateurs en bas de l'image */}
            {imageUris.length > 1 && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                {imageUris.map((_, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <View
                      key={`dot-${idx}`}
                      style={{
                        width: active ? 24 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: active
                          ? '#01BDA5'
                          : 'rgba(255,255,255,0.75)',
                        marginRight: idx < imageUris.length - 1 ? 6 : 0,
                      }}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          style={{ flex: 1 }}
        >
          {/* ── Informations principales ─────────────────────────────────── */}
          <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
            {/* Nom */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: '#111827',
                letterSpacing: -0.3,
              }}
            >
              {hotelName}
            </Text>

            {/* Localisation */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Ionicons
                name="location-outline"
                size={15}
                color="#6b7280"
                style={{ marginRight: 4 }}
              />
              <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600' }}>
                {hotelLocation}
              </Text>
            </View>

            {/* Note + avis */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Ionicons
                name="star"
                size={17}
                color="#111827"
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: '#111827',
                  marginRight: 8,
                }}
              >
                {hotelRating.toFixed(1).replace('.', ',')}
              </Text>
              <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600' }}>
                125 avis
              </Text>
            </View>

            {/* Séparateur */}
            <View
              style={{
                height: 1,
                backgroundColor: '#f3f4f6',
                marginTop: 18,
                marginBottom: 18,
              }}
            />

            {/* ── À propos ──────────────────────────────────────────────── */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#111827',
                marginBottom: 10,
              }}
            >
              À propos
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 22,
                fontWeight: '500',
              }}
            >
              Détendez-vous dans notre établissement confortable avec 3 villas
              indépendantes et 5 bungalows. Calme, familial et à quelque pas de
              la mer. À proximité des marchés et des activités.
            </Text>

            {/* Séparateur */}
            <View
              style={{
                height: 1,
                backgroundColor: '#f3f4f6',
                marginTop: 22,
                marginBottom: 22,
              }}
            />

            {/* ── Chambres et disponibilité ─────────────────────────────── */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#111827',
                marginBottom: 14,
              }}
            >
              Chambres et disponibilité
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={screenWidth - 20}
              snapToAlignment="start"
              onScroll={handleRoomScroll}
              scrollEventThrottle={16}
              style={{ width: '100%', marginBottom: 12 }}
            >
              {MOCK_ROOMS.map((room) => (
                <RoomCard
                  key={room.id}
                  name={room.name}
                  price={room.price}
                  imageUri={room.imageUri}
                  beds={room.beds}
                  bathrooms={room.bathrooms}
                  persons={room.persons}
                  onReserve={() => router.push({
                    pathname: '/(app)/proprieter-detail',
                    params: {
                      name: room.name,
                      price: room.price,
                      imageUri: room.imageUri,
                      beds: room.beds,
                      bathrooms: room.bathrooms,
                      persons: room.persons,
                      location: hotelLocation,
                      hotelName: hotelName,
                      hotelRating: hotelRating.toString(),
                      hotelImageUris: JSON.stringify(imageUris),
                    },
                  })}
                />
              ))}
            </ScrollView>

            {/* Dots indicateurs des chambres sous le carrousel */}
            {MOCK_ROOMS.length > 1 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 22,
                }}
              >
                {MOCK_ROOMS.map((_, idx) => {
                  const active = idx === activeRoomIndex;
                  return (
                    <View
                      key={`room-dot-${idx}`}
                      style={{
                        width: active ? 24 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: active
                          ? '#01BDA5'
                          : '#cbd5e1',
                        marginRight: idx < MOCK_ROOMS.length - 1 ? 6 : 0,
                      }}
                    />
                  );
                })}
              </View>
            )}

            {/* Séparateur */}
            <View
              style={{
                height: 1,
                backgroundColor: '#f3f4f6',
                marginBottom: 22,
              }}
            />

            {/* ── Équipements ── */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#111827',
                marginBottom: 14,
              }}
            >
              Équipements
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >
              {EQUIPEMENTS.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    width: '50%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Ionicons name={item.icon as any} size={22} color="#4b5563" />
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#4b5563',
                      fontWeight: '500',
                      marginLeft: 10,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

