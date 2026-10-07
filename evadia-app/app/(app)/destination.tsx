import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { DestinationCard } from '../../components/molecules/DestinationCard';
import { Header } from '../../components/molecules/Header';
import { api } from '../../lib/api';
import { loadErrorMessage } from '../../lib/parseError';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600';

type VilleItem = { id: number; name: string; imageUri: string; destinationNom: string };

export default function DestinationScreen() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);
  const [villes, setVilles] = useState<VilleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadVilles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/destinations');
      const dests = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setCategories(['Tous', ...dests.map((d: any) => d.nom)]);

      const all: VilleItem[] = [];
      let firstError: unknown = null;
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
        } catch (err) {
          firstError ??= err;
        }
      }
      setVilles(all);
      // Une destination en échec n'empêche pas d'afficher les autres ;
      // on ne signale l'erreur que si rien n'a pu être chargé.
      if (all.length === 0 && firstError) setError(loadErrorMessage(firstError, t('Destination.load_error')));
    } catch (err) {
      setVilles([]);
      setError(loadErrorMessage(err, t('Destination.load_error')));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVilles();
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
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={52} color="#ccc" />
          <Text className="text-gray-400 mt-4 font-semibold text-center">{error}</Text>
          <TouchableOpacity className="mt-6 bg-teal-500 px-6 py-3 rounded-full" onPress={loadVilles}>
            <Text className="text-white font-bold">{t('Common.retry')}</Text>
          </TouchableOpacity>
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
              <Text
                className="text-[27px] text-gray-950 tracking-tight"
                style={{ fontFamily: 'Manrope_700Bold' }}
              >
                {t('Destination.title')}
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
                {t('Destination.no_results', { query: searchQuery })}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
