import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  TextInput, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { search, SearchHotelResult, SearchResults } from "../services/searchService";
import { s as sc, vs, ms } from "../lib/scale";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function StarRating({ rating }: { rating: number | null }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={11} color={i <= filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

function HotelResult({ hotel, onPress }: { hotel: SearchHotelResult; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.resultCard} activeOpacity={0.85} onPress={onPress}>
      <Image
        source={hotel.photo ? { uri: hotel.photo } : require("../assets/images/hotel.jpg")}
        style={s.resultImage}
        resizeMode="cover"
      />
      <View style={s.resultInfo}>
        <Text style={s.resultName} numberOfLines={1}>{hotel.nom}</Text>
        <View style={s.resultLocation}>
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <Text style={s.resultVille} numberOfLines={1}>{hotel.ville}</Text>
        </View>
        <StarRating rating={hotel.note_moyenne} />
        <Text style={s.resultPrice}>{hotel.prix_min.toLocaleString()} Ar/nuit</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ hotels: [], destinations: [], villes: [] });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ hotels: [], destinations: [], villes: [] });
      return;
    }
    setLoading(true);
    search(debouncedQuery)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const total = results.hotels.length + results.destinations.length + results.villes.length;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Rechercher</Text>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color="#626262" />
          <TextInput
            style={s.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Destination, hôtel, ville…"
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : query.trim().length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="search-outline" size={48} color="#D1D5DB" />
          <Text style={s.emptyText}>Entrez une destination ou un nom d'hôtel</Text>
        </View>
      ) : total === 0 ? (
        <View style={s.centered}>
          <Ionicons name="sad-outline" size={48} color="#D1D5DB" />
          <Text style={s.emptyText}>Aucun résultat pour "{query}"</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {results.hotels.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Hôtels</Text>
              {results.hotels.map((hotel) => (
                <HotelResult
                  key={hotel.id}
                  hotel={hotel}
                  onPress={() => navigation.navigate("HotelDetail", { id: hotel.id, name: hotel.nom })}
                />
              ))}
            </>
          )}

          {results.destinations.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Destinations</Text>
              {results.destinations.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={s.simpleRow}
                  onPress={() => navigation.navigate("DestinationHotels", { id: d.id, name: d.nom, type: "destination" })}
                >
                  <Ionicons name="map-outline" size={20} color="#01BDA5" />
                  <Text style={s.simpleText}>{d.nom}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {results.villes.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Villes</Text>
              {results.villes.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={s.simpleRow}
                  onPress={() => navigation.navigate("DestinationHotels", { id: v.id, name: v.nom, type: "ville" })}
                >
                  <Ionicons name="location-outline" size={20} color="#01BDA5" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.simpleText}>{v.nom}</Text>
                    {v.destination_nom ? <Text style={s.simpleSubText}>{v.destination_nom}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: sc(20), paddingTop: vs(24), paddingBottom: vs(16), gap: vs(16) },
  title: { fontFamily: "Manrope_700Bold", fontSize: ms(24), lineHeight: 30, color: "#000000" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: sc(32), paddingHorizontal: sc(16), height: vs(44), gap: sc(10) },
  input: { flex: 1, fontFamily: "Outfit_400Regular", fontSize: ms(14), color: "#000000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontFamily: "Outfit_400Regular", fontSize: ms(14), color: "#9CA3AF", textAlign: "center", paddingHorizontal: sc(40) },
  scrollContent: { padding: sc(20), gap: vs(4), paddingBottom: vs(40) },
  sectionTitle: { fontFamily: "Outfit_600SemiBold", fontSize: ms(14), color: "#374151", marginTop: vs(12), marginBottom: vs(8) },
  resultCard: { flexDirection: "row", gap: sc(12), paddingVertical: vs(10), borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  resultImage: { width: sc(72), height: sc(72), borderRadius: sc(10) },
  resultInfo: { flex: 1, gap: vs(4), justifyContent: "center" },
  resultName: { fontFamily: "Outfit_600SemiBold", fontSize: ms(14), color: "#000000" },
  resultLocation: { flexDirection: "row", alignItems: "center", gap: sc(3) },
  resultVille: { fontFamily: "Outfit_400Regular", fontSize: ms(12), color: "#6B7280" },
  starsRow: { flexDirection: "row", gap: 2 },
  resultPrice: { fontFamily: "Outfit_700Bold", fontSize: ms(13), color: "#01BDA5" },
  simpleRow: { flexDirection: "row", alignItems: "center", gap: sc(12), paddingVertical: vs(12), borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  simpleText: { flex: 1, fontFamily: "Outfit_400Regular", fontSize: ms(14), color: "#000000" },
  simpleSubText: { fontFamily: "Outfit_300Light", fontSize: ms(12), color: "#9CA3AF" },
});
