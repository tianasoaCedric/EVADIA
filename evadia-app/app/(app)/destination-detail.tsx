import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/atoms/SearchBar';
import { DestinationHotelCard } from '../../components/molecules/DestinationHotelCard';
import { publicService, Hotel, hotelVille, hotelPhoto, hotelPhotos, hotelPrix, hotelNote } from '../../services/public';

export default function DestinationDetailScreen() {
  const params = useLocalSearchParams();
  const destinationName = (params.name as string) || 'Destination';
  const villeId = params.villeId ? Number(params.villeId) : null;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      if (!villeId) { setHotels([]); return; }
      const data = await publicService.getHotelsByVille(villeId);
      setHotels(Array.isArray(data) ? data : []);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
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
            onPress={() => router.replace('/destination')}
            style={{ marginRight: 10, padding: 4 }}
          >
            <Ionicons name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <TouchableOpacity style={{ marginLeft: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', paddingHorizontal: 18, marginBottom: 12 }}>
          {destinationName}
        </Text>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#01BDA5" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const prix = hotelPrix(item);
              const note = hotelNote(item);
              const ville = hotelVille(item);
              const photos = hotelPhotos(item);
              return (
                <DestinationHotelCard
                  name={item.nom}
                  price={prix ? `${prix.toLocaleString('fr-FR')}ar/Nuitée` : 'Prix sur demande'}
                  rating={note}
                  location={ville}
                  imageUri={photos[0]}
                  imageUris={photos}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/hotel-detail',
                      params: {
                        id: item.id,
                        name: item.nom,
                        location: ville,
                        rating: note.toString(),
                        imageUris: JSON.stringify(photos),
                        fromVilleId: villeId ?? '',
                        fromVilleName: destinationName,
                        from: 'destination-detail',
                      },
                    })
                  }
                />
              );
            }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>
                  Aucun hôtel trouvé
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
