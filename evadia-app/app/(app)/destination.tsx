import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DestinationCard } from '../../components/molecules/DestinationCard';
import { Header } from '../../components/molecules/Header';

// Catégories de destinations (régions de Madagascar)
const DESTINATION_CATEGORIES = ["Nord", "Est", "Hautes Terres Centrales", "Ouest", "Sud"];

// Mock de destinations par région
const DESTINATIONS = [
  // Nord (Correspond exactement à la maquette de l'utilisateur avec 6 cartes Andasibe / Sainte Marie alternées)
  {
    id: 'd1',
    name: 'Andasibe',
    category: 'Nord',
    imageUri: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=600',
  },
  {
    id: 'd2',
    name: 'Sainte Marie',
    category: 'Nord',
    imageUri: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
  },
  {
    id: 'd3',
    name: 'Sainte Marie',
    category: 'Nord',
    imageUri: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
  },
  {
    id: 'd4',
    name: 'Andasibe',
    category: 'Nord',
    imageUri: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=600',
  },
  {
    id: 'd5',
    name: 'Andasibe',
    category: 'Nord',
    imageUri: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=600',
  },
  {
    id: 'd6',
    name: 'Sainte Marie',
    category: 'Nord',
    imageUri: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
  },

  // Est
  {
    id: 'd7',
    name: 'Île Sainte Marie',
    category: 'Est',
    imageUri: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
  },
  {
    id: 'd8',
    name: 'Andasibe',
    category: 'Est',
    imageUri: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=600',
  },
  {
    id: 'd9',
    name: 'Tamatave',
    category: 'Est',
    imageUri: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=600',
  },

  // Hautes Terres Centrales
  {
    id: 'd10',
    name: 'Antananarivo',
    category: 'Hautes Terres Centrales',
    imageUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600',
  },
  {
    id: 'd11',
    name: 'Antsirabe',
    category: 'Hautes Terres Centrales',
    imageUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600',
  },
  {
    id: 'd12',
    name: 'Ambositra',
    category: 'Hautes Terres Centrales',
    imageUri: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600',
  },

  // Ouest
  {
    id: 'd13',
    name: 'Morondava',
    category: 'Ouest',
    imageUri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600',
  },
  {
    id: 'd14',
    name: 'Tsingy de Bemaraha',
    category: 'Ouest',
    imageUri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600',
  },
  {
    id: 'd15',
    name: 'Majunga',
    category: 'Ouest',
    imageUri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600',
  },

  // Sud
  {
    id: 'd16',
    name: 'Isalo',
    category: 'Sud',
    imageUri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600',
  },
  {
    id: 'd17',
    name: 'Tuléar',
    category: 'Sud',
    imageUri: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600',
  },
  {
    id: 'd18',
    name: 'Fort Dauphin',
    category: 'Sud',
    imageUri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600',
  },
];

export default function DestinationScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Nord");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les destinations par catégorie active et par recherche
  const filteredDestinations = DESTINATIONS.filter(dest => {
    const matchesCategory = dest.category === selectedCategory;
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header avec catégories dynamiques et recherche fonctionnelle */}
      <Header
        categories={DESTINATION_CATEGORIES}
        defaultCategory="Nord"
        onCategoryChange={setSelectedCategory}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <FlatList
        data={filteredDestinations}
        keyExtractor={(item) => item.id}
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
            onPress={() => router.push({ pathname: '/(app)/destination-detail', params: { name: item.name } })}
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
    </SafeAreaView>
  );
}
