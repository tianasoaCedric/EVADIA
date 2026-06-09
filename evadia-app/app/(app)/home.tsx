import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HotelCard } from '../../components/molecules/HotelCard';
import { Header } from '../../components/molecules/Header';
import { publicService, Hotel, hotelVille, hotelPhoto, hotelPrix, hotelNote } from '../../services/public';
import { router } from 'expo-router';

interface CitySection {
  city: string;
  hotels: Hotel[];
}

export default function HomePage() {
  const [sections, setSections] = useState<CitySection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const hotels = await publicService.getHotels({ per_page: 20 });

      const map = new Map<string, Hotel[]>();
      for (const hotel of hotels) {
        const city = hotelVille(hotel);
        if (!map.has(city)) map.set(city, []);
        map.get(city)!.push(hotel);
      }

      setSections(Array.from(map.entries()).map(([city, hs]) => ({ city, hotels: hs })));
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#01BDA5" />
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
                <Text className="text-[16px] font-bold text-gray-900">
                  Selection d'hebergement a {section.city}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#000" />
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {section.hotels.map((hotel) => {
                  const prix = hotelPrix(hotel);
                  const note = hotelNote(hotel);
                  const photo = hotelPhoto(hotel);
                  const ville = hotelVille(hotel);
                  return (
                    <HotelCard
                      key={hotel.id}
                      imageUri={photo}
                      name={hotel.nom}
                      price={prix ? `${prix.toLocaleString('fr-FR')}Ar/nuité` : ''}
                      rating={note}
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/hotel-detail',
                          params: {
                            id: hotel.id,
                            name: hotel.nom,
                            location: ville,
                            rating: note.toString(),
                            imageUris: JSON.stringify([photo]),
                            from: 'home',
                          },
                        })
                      }
                    />
                  );
                })}
              </ScrollView>
            </View>
          ))}

          {sections.length === 0 && (
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="business-outline" size={48} color="#ccc" />
              <Text className="text-gray-400 mt-4 font-semibold">Aucun hôtel disponible</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
