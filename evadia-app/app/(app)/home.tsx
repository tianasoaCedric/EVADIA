import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HotelCard } from '../../components/molecules/HotelCard';
import { Header } from '../../components/molecules/Header';
import { publicService, Hotel, hotelVille, hotelPhoto, hotelPrix, hotelNote } from '../../services/public';
import { clientService } from '../../services/client';
import { useDevise } from '../../context/DeviseContext';
import { loadErrorMessage, showError } from '../../lib/parseError';
import { router, useFocusEffect } from 'expo-router';

interface CitySection {
  city: string;
  hotels: Hotel[];
}

export default function HomePage() {
  const { t } = useTranslation();
  const { devise, symbole } = useDevise();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [search, setSearch] = useState('');
  // Dernière recherche envoyée à l'API : sert au rechargement au focus
  // et à ignorer les réponses d'une recherche déjà dépassée.
  const searchRef = useRef('');
  const isFirstSearch = useRef(true);

  const hotelParams = (q: string) => ({ per_page: 20, ...(q ? { search: q } : {}) });

  useFocusEffect(
    useCallback(() => {
      loadHotels();
    }, [])
  );

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const [types, allHotels, favs] = await Promise.all([
        publicService.getTypesHotels().catch(() => []),
        publicService.getHotels(hotelParams(searchRef.current)),
        clientService.getFavorites().catch(() => []),
      ]);

      setCategories(['Tous', ...types.map((t) => t.nom)]);
      setHotels(allHotels);
      setFavoriteIds(new Set(favs.map((f) => f.hotel.id)));
    } catch (e: any) {
      setError(loadErrorMessage(e, t('Home.load_error')));
    } finally {
      setLoading(false);
    }
  };

  // Recherche par nom d'hôtel côté API, 300 ms après la dernière frappe.
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const q = search.trim();
    const timer = setTimeout(async () => {
      searchRef.current = q;
      setLoading(true);
      setError(null);
      try {
        const result = await publicService.getHotels(hotelParams(q));
        if (searchRef.current === q) setHotels(result);
      } catch (e: any) {
        if (searchRef.current === q) setError(loadErrorMessage(e, t('Home.load_error')));
      } finally {
        if (searchRef.current === q) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredHotels = hotels.filter((hotel) => {
    if (selectedCategory === 'Tous') return true;
    return (hotel.types ?? []).some((t) => t.nom === selectedCategory);
  });

  const sections: CitySection[] = (() => {
    const map = new Map<string, Hotel[]>();
    for (const hotel of filteredHotels) {
      const city = hotelVille(hotel);
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(hotel);
    }
    return Array.from(map.entries()).map(([city, hs]) => ({ city, hotels: hs }));
  })();

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header
        categories={categories.length > 0 ? categories : undefined}
        defaultCategory="Tous"
        onCategoryChange={setSelectedCategory}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={52} color="#ccc" />
          <Text className="text-gray-400 mt-4 font-semibold text-center">{error}</Text>
          <TouchableOpacity className="mt-6 bg-teal-500 px-6 py-3 rounded-full" onPress={loadHotels}>
            <Text className="text-white font-bold">{t('Common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.city} className="mb-6">
              <TouchableOpacity
                className="flex-row items-center justify-between mb-3 mt-3"
                onPress={() => {}}
              >
                <Text
                  className="text-[16px] text-gray-900"
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  {t('Home.selection_in_city', { city: section.city })}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#000" />
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {section.hotels.map((hotel) => {
                  const prix = hotelPrix(hotel, devise);
                  const note = hotelNote(hotel);
                  const photo = hotelPhoto(hotel);
                  const ville = hotelVille(hotel);
                  const isFav = favoriteIds.has(hotel.id);
                  return (
                    <HotelCard
                      key={`${hotel.id}-${isFav}`}
                      imageUri={photo}
                      availability={hotel.disponibilite}
                      name={hotel.nom}
                      price={prix ? `${prix.toLocaleString('fr-FR')}${symbole}/nuité` : ''}
                      rating={note}
                      defaultFavorite={isFav}
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/hotel-detail',
                          params: {
                            id: hotel.id,
                            name: hotel.nom,
                            location: ville,
                            rating: note.toString(),
                            imageUris: JSON.stringify([photo]),
                          },
                        })
                      }
                      onFavoriteToggle={(newState) => handleFavoriteToggle(hotel.id, newState)}
                    />
                  );
                })}
              </ScrollView>
            </View>
          ))}

          {sections.length === 0 && (
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="business-outline" size={48} color="#ccc" />
              <Text className="text-gray-400 mt-4 font-semibold">{t('Home.no_hotels')}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
