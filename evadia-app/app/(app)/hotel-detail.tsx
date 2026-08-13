import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoomCard } from '../../components/molecules/RoomCard';
import { publicService, Hotel, Propriete, hotelVille, hotelPhotos, hotelNote, proprietePrix, proprietePhotos } from '../../services/public';
import { clientService } from '../../services/client';
import { useDevise } from '../../context/DeviseContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.42);

const EQUIPEMENT_ICON_MAP: Record<string, string> = {
  'wifi': 'wifi-outline',
  'piscine': 'water-outline',
  'parking': 'car-outline',
  'spa': 'flower-outline',
  'climatisation': 'snow-outline',
  'restaurant': 'restaurant-outline',
  'salle sport': 'fitness-outline',
  'sécurité': 'shield-checkmark-outline',
};

function getEquipIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(EQUIPEMENT_ICON_MAP)) {
    if (key.includes(k)) return v;
  }
  return 'checkmark-circle-outline';
}

export default function HotelDetailScreen() {
  const { t } = useTranslation();
  const { devise, symbole } = useDevise();
  const params = useLocalSearchParams();
  const hotelId = params.id ? Number(params.id) : null;
  const hotelName = (params.name as string) || t('HotelDetail.default_hotel_name');
  const hotelLocation = (params.location as string) || '';
  const fromVilleId = params.fromVilleId ? Number(params.fromVilleId) : null;
  const fromVilleName = (params.fromVilleName as string) || '';
  const from = (params.from as string) || '';
  const hotelRating = parseFloat((params.rating as string) || '0');
  const paramImageUris: string[] = params.imageUris
    ? JSON.parse(params.imageUris as string)
    : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800'];

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Propriete[]>([]);
  const [loading, setLoading] = useState(!!hotelId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [togglingFav, setTogglingFav] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setHotel(null);
    setRooms([]);
    setActiveIndex(0);
    setActiveRoomIndex(0);
    setIsFavorite(false);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    if (hotelId) loadHotel(hotelId);
    if (hotelId) checkFavorite(hotelId);
  }, [hotelId]);

  const checkFavorite = async (id: number) => {
    try {
      const favs = await clientService.getFavorites();
      setIsFavorite(favs.some((f) => f.hotel.id === id));
    } catch {}
  };

  const loadHotel = async (id: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await publicService.getHotel(id);
      setHotel(data);
      setRooms(Array.isArray((data as any).chambres) ? (data as any).chambres : []);
    } catch (e: any) {
      setLoadError(e?.message ?? t('HotelDetail.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (togglingFav || !hotelId) return;
    setTogglingFav(true);
    try {
      if (isFavorite) {
        await clientService.removeFavorite(hotelId);
      } else {
        await clientService.addFavorite(hotelId);
      }
      setIsFavorite(!isFavorite);
    } catch {}
    finally { setTogglingFav(false); }
  };

  const imageUris = hotel ? hotelPhotos(hotel) : paramImageUris;
  const displayRating = hotel ? hotelNote(hotel) : hotelRating;
  const displayVille = hotel ? hotelVille(hotel) : hotelLocation;
  const nbAvis = hotel?.nb_avis ?? 0;
  const description = hotel?.description ?? t('HotelDetail.default_description');
  const services = (hotel as any)?.services ?? [];

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };
  const handleRoomScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 20));
    if (index !== activeRoomIndex) setActiveRoomIndex(index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={[]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        {/* Image carousel */}
        <View style={{ width: screenWidth, height: IMAGE_HEIGHT, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', backgroundColor: '#e5e7eb', zIndex: 10 }}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16} style={{ width: screenWidth, height: IMAGE_HEIGHT }}>
            {imageUris.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={{ width: screenWidth, height: IMAGE_HEIGHT, resizeMode: 'cover' }} />
            ))}
          </ScrollView>

          {/* Back */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => {
            if (from === 'home') {
              router.replace('/(app)/home');
            } else if (from === 'favorites') {
              router.replace('/(app)/favorites');
            } else if (from === 'destination-detail' && fromVilleId) {
              router.replace({ pathname: '/(app)/destination-detail', params: { villeId: fromVilleId, name: fromVilleName } });
            } else {
              router.back();
            }
          }}
            style={{ position: 'absolute', top: 52, left: 18, zIndex: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={30} color="#fff" style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }} />
          </TouchableOpacity>

          {/* Share + Favorite */}
          <View style={{ position: 'absolute', top: 52, right: 18, zIndex: 20, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={0.8} style={{ marginRight: 14 }}>
              <Ionicons name="share-outline" size={26} color="#fff" style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={handleToggleFavorite}>
              <Ionicons name="heart" size={28} color={isFavorite ? '#ff2d55' : 'rgba(255,255,255,0.85)'} style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }} />
            </TouchableOpacity>
          </View>

          {/* Dots */}
          {imageUris.length > 1 && (
            <View style={{ position: 'absolute', bottom: 18, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
              {imageUris.map((_, idx) => (
                <View key={idx} style={{ width: idx === activeIndex ? 24 : 6, height: 6, borderRadius: 3, backgroundColor: idx === activeIndex ? '#01BDA5' : 'rgba(255,255,255,0.75)', marginRight: idx < imageUris.length - 1 ? 6 : 0 }} />
              ))}
            </View>
          )}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#01BDA5" />
          </View>
        ) : loadError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="cloud-offline-outline" size={52} color="#e5e7eb" />
            <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>{loadError}</Text>
            <TouchableOpacity
              onPress={() => hotelId && loadHotel(hotelId)}
              style={{ marginTop: 16, backgroundColor: '#01BDA5', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100 }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold' }}>{t('Common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }} style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
              <Text style={{ fontSize: 22, fontFamily: 'Outfit_800ExtraBold', color: '#111827', letterSpacing: -0.3 }}>
                {hotel?.nom ?? hotelName}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="location-outline" size={15} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_600SemiBold' }}>{displayVille}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Ionicons name="star" size={17} color="#111827" style={{ marginRight: 5 }} />
                <Text style={{ fontSize: 15, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginRight: 8 }}>
                  {displayRating.toFixed(1).replace('.', ',')}
                </Text>
                {nbAvis > 0 && <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_600SemiBold' }}>{t('HotelDetail.reviews_count', { count: nbAvis })}</Text>}
              </View>

              <View style={{ height: 1, backgroundColor: '#f3f4f6', marginTop: 18, marginBottom: 18 }} />

              {/* À propos */}
              <Text style={{ fontSize: 17, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginBottom: 10 }}>{t('HotelDetail.about')}</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22, fontFamily: 'Outfit_500Medium' }}>{description}</Text>

              <View style={{ height: 1, backgroundColor: '#f3f4f6', marginTop: 22, marginBottom: 22 }} />

              {/* Chambres */}
              <Text style={{ fontSize: 17, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginBottom: 14 }}>{t('HotelDetail.rooms_availability')}</Text>

              {rooms.length === 0 ? (
                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>{t('HotelDetail.no_rooms')}</Text>
              ) : (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={screenWidth - 20} snapToAlignment="start" onScroll={handleRoomScroll} scrollEventThrottle={16} style={{ width: '100%', marginBottom: 12 }}>
                    {rooms.map((room) => {
                      const prix = proprietePrix(room, devise);
                      const photos = proprietePhotos(room);
                      return (
                        <RoomCard
                          key={room.id}
                          name={room.nom}
                          price={prix ? `${prix.toLocaleString('fr-FR')}${symbole}/nuit` : t('HotelDetail.price_on_request')}
                          imageUri={photos[0]}
                          beds={room.nb_lits ?? 1}
                          bathrooms={room.nb_salles_bain ?? 1}
                          persons={room.capacite ?? 2}
                          onReserve={() =>
                            router.push({
                              pathname: '/(app)/proprieter-detail',
                              params: {
                                id: room.id,
                                name: room.nom,
                                price: prix ? `${prix.toLocaleString('fr-FR')}${symbole}/nuit` : t('HotelDetail.price_on_request'),
                                imageUri: photos[0],
                                beds: room.nb_lits ?? 1,
                                bathrooms: room.nb_salles_bain ?? 1,
                                persons: room.capacite ?? 2,
                                description: room.description ?? '',
                                location: displayVille,
                                hotelName: hotel?.nom ?? hotelName,
                                hotelRating: displayRating.toString(),
                                hotelImageUris: JSON.stringify(imageUris),
                                exigeAcompte: hotel?.exige_acompte ? '1' : '0',
                                pourcentageAcompte: hotel?.pourcentage_acompte != null ? String(hotel.pourcentage_acompte) : '0',
                              },
                            })
                          }
                        />
                      );
                    })}
                  </ScrollView>
                  {rooms.length > 1 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 22 }}>
                      {rooms.map((_, idx) => (
                        <View key={idx} style={{ width: idx === activeRoomIndex ? 24 : 6, height: 6, borderRadius: 3, backgroundColor: idx === activeRoomIndex ? '#01BDA5' : '#cbd5e1', marginRight: idx < rooms.length - 1 ? 6 : 0 }} />
                      ))}
                    </View>
                  )}
                </>
              )}

              <View style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 22 }} />

              {/* Services / Équipements */}
              <Text style={{ fontSize: 16, fontFamily: 'Outfit_700Bold', color: '#111827', marginBottom: 14 }}>{t('HotelDetail.equipments')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {services.length > 0
                  ? services.map((s: any) => (
                      <View key={s.id} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Ionicons name={getEquipIcon(s.nom) as any} size={22} color="#4b5563" />
                        <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Outfit_500Medium', marginLeft: 10 }}>{s.nom}</Text>
                      </View>
                    ))
                  : [
                      { icon: 'wifi-outline', label: t('HotelDetail.equip_wifi') },
                      { icon: 'water-outline', label: t('HotelDetail.equip_pool') },
                      { icon: 'car-outline', label: t('HotelDetail.equip_parking') },
                      { icon: 'snow-outline', label: t('HotelDetail.equip_ac') },
                      { icon: 'restaurant-outline', label: t('HotelDetail.equip_restaurant') },
                      { icon: 'shield-checkmark-outline', label: t('HotelDetail.equip_security') },
                    ].map((item, idx) => (
                      <View key={idx} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Ionicons name={item.icon as any} size={22} color="#4b5563" />
                        <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Outfit_500Medium', marginLeft: 10 }}>{item.label}</Text>
                      </View>
                    ))}
              </View>
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
