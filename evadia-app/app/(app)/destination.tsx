import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { DestinationCard } from '../../components/molecules/DestinationCard';
import { Header } from '../../components/molecules/Header';
import { api } from '../../lib/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600';

type VilleItem = { id: number; name: string; imageUri: string; destinationNom: string };

export default function DestinationScreen() {
  const [categories, setCategories] = useState<string[]>([]);
  const [villes, setVilles] = useState<VilleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api.get('/destinations').then(async (res) => {
        const dests = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setCategories(['Tous', ...dests.map((d: any) => d.nom)]);

        const all: VilleItem[] = [];
        for (const dest of dests) {
          try {
            const r = await api.get(`/destinations/${dest.id}/villes`);
            const villesList = r.data?.data?.villes ?? r.data?.villes ?? [];
            for (const v of villesList) {
              all.push({
                id: v.id,
                name: v.nom,
                imageUri: v.image ?? dest.image_url ?? FALLBACK_IMAGE,
                destinationNom: dest.nom,
              });
            }
          } catch {}
        }
        setVilles(all);
      }).catch(() => {}).finally(() => setLoading(false));
    }, [])
  );

  const filteredVilles = villes.filter(v => {
    const matchesCategory = selectedCategory === 'Tous' || v.destinationNom === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header
        categories={categories}
        defaultCategory="Tous"
        onCategoryChange={setSelectedCategory}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : (
        <FlatList
          data={filteredVilles}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 110,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="px-4 mb-5 mt-2">
              <Text className="text-[27px] font-bold text-gray-950 tracking-tight">
                Trouvez votre destination
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DestinationCard
              name={item.name}
              imageUri={item.imageUri}
              onPress={() => router.push({
                pathname: '/(app)/destination-detail',
                params: { villeId: item.id, name: item.name },
              })}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20 px-6">
              <Ionicons name="search-outline" size={48} color="#cccccc" />
              <Text className="text-gray-500 font-semibold text-center mt-4">
                Aucune destination trouvée pour "{searchQuery}"
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
