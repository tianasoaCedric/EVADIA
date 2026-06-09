import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HotelCard } from '../../components/molecules/HotelCard';
import { Header } from '../../components/molecules/Header';
import { clientService, Favori } from '../../services/client';
import { hotelPhoto, hotelPhotos, hotelPrix, hotelNote, hotelVille } from '../../services/public';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2;


export default function FavoritesScreen() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService.getFavorites()
      .then((data) => setFavoris(Array.isArray(data) ? data : []))
      .catch(() => setFavoris([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = async (hotelId: number) => {
    try {
      await clientService.removeFavorite(hotelId);
      setFavoris((prev) => prev.filter((f) => f.hotel.id !== hotelId));
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: 18, paddingTop: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
            Vos Favoris
          </Text>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator size="large" color="#01BDA5" />
          </View>
        ) : favoris.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="heart-outline" size={52} color="#e5e7eb" />
            <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600', fontSize: 15 }}>
              Aucun favori pour l'instant
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, justifyContent: 'space-between' }}>
            {favoris.map((favori) => {
              const h = favori.hotel;
              const prix = hotelPrix(h);
              const note = hotelNote(h);
              const photo = hotelPhoto(h);
              const photos = hotelPhotos(h);
              const ville = hotelVille(h);
              return (
              <HotelCard
                key={favori.id}
                name={h.nom}
                price={prix ? `${prix.toLocaleString('fr-FR')}Ar/nuité` : ''}
                rating={note}
                imageUri={photo}
                defaultFavorite={true}
                width={CARD_WIDTH}
                marginRight={0}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/hotel-detail',
                    params: {
                      id: h.id,
                      name: h.nom,
                      location: ville,
                      rating: note.toString(),
                      imageUris: JSON.stringify(photos),
                    },
                  })
                }
                onFavoriteToggle={() => handleToggleFavorite(h.id)}
              />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
