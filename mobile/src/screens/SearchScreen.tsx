import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../components/atoms/AppText";
import { SearchBar, CardHotel } from "../components/molecules";

const MOCK_RESULTS = [
  { id: "1", name: "Le Meridien Ile Maurice", city: "Pointe aux Piments", country: "Maurice", price: 320, currency: "EUR", rating: 4.8, reviewCount: 124, isFavorite: false },
  { id: "2", name: "Lux Grand Gaube", city: "Grand Gaube", country: "Maurice", price: 410, currency: "EUR", rating: 4.9, reviewCount: 98, isFavorite: true },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-6 pb-4">
        <AppText variant="h3" weight="bold" className="mb-4">Rechercher</AppText>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>
        {query.length === 0 ? (
          <AppText variant="body" className="text-neutral-400 text-center mt-12">
            Entrez une destination ou un nom d'hôtel
          </AppText>
        ) : (
          MOCK_RESULTS.map((hotel) => (
            <CardHotel key={hotel.id} {...hotel} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
