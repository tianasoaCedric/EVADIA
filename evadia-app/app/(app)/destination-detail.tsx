import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/atoms/SearchBar';
import { DestinationHotelCard } from '../../components/molecules/DestinationHotelCard';
import { publicService, Hotel, hotelVille, hotelPhoto, hotelPhotos, hotelPrix, hotelNote } from '../../services/public';
import { clientService } from '../../services/client';
import { useDevise } from '../../context/DeviseContext';
import { loadErrorMessage, showError } from '../../lib/parseError';

export default function DestinationDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const destinationName = (params.name as string) || t('DestinationDetail.default_title');
  const villeId = params.villeId ? Number(params.villeId) : null;
  const { devise, symbole } = useDevise();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    loadHotels();
  }, [villeId]);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!villeId) { setHotels([]); return; }
      const [data, favs] = await Promise.all([
        publicService.getHotelsByVille(villeId),
        clientService.getFavorites().catch(() => []),
      ]);
      setHotels(Array.isArray(data) ? data : []);
      setFavoriteIds(new Set(favs.map((f) => f.hotel.id)));
    } catch (err) {
      setHotels([]);
      setError(loadErrorMessage(err, t('DestinationDetail.load_error')));
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (hotelId: number, newState: boolean) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (newState) next.add(hotelId); else next.delete(hotelId);
      return next;
    });
    try {
      if (newState) {
        await clientService.addFavorite(hotelId);
      } else {
        await clientService.removeFavorite(hotelId);
      }
    } catch (err) {
      showError(t('Favorites.toggle_error_title'), err, {
        default: t(newState ? 'Favorites.add_error' : 'Favorites.remove_error'),
      });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (newState) next.delete(hotelId); else next.add(hotelId);
        return next;
      });
    }
  };

  const filtered = hotels.filter((h) =>
    (h.nom ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(app)/destination');
            }}
            style={{ marginRight: 10, padding: 4 }}
          >
            <Ionicons name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/notifications')} style={{ marginLeft: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 20, fontFamily: 'Outfit_800ExtraBold', color: '#111827', paddingHorizontal: 18, marginBottom: 12 }}>
          {destinationName}
        </Text>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#01BDA5" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => `${item.id}-${favoriteIds.has(item.id)}`}
            extraData={favoriteIds}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const prix = hotelPrix(item, devise);
              const note = hotelNote(item);
              const ville = hotelVille(item);
              const photos = hotelPhotos(item);
              return (
                <DestinationHotelCard
                  name={item.nom}
                  price={prix ? `${prix.toLocaleString('fr-FR')}${symbole}/Nuitée` : t('DestinationDetail.price_on_request')}
                  rating={note}
                  location={ville}
                  imageUri={photos[0]}
                  imageUris={photos}
                  defaultFavorite={favoriteIds.has(item.id)}
                  onFavoriteToggle={(newState) => handleFavoriteToggle(item.id, newState)}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/hotel-detail',
                      params: {
                        id: item.id,
                        name: item.nom,
                        location: ville,
                        rating: note.toString(),
                        imageUris: JSON.stringify(photos),
                      },
                    })
                  }
                />
              );
            }}
            ListEmptyComponent={
              error ? (
                <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
                  <Ionicons name="cloud-offline-outline" size={48} color="#ccc" />
                  <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={loadHotels}
                    style={{ marginTop: 16, backgroundColor: '#01BDA5', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100 }}
                  >
                    <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold' }}>{t('Common.retry')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold' }}>
                    {t('DestinationDetail.no_hotels')}
                  </Text>
                </View>
              )
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
