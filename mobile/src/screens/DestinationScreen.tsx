import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ImageBackground,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SearchHeader from "../components/molecules/SearchHeader";
import {
  VilleItem, DestinationWithVilles,
  getDestinations, getDestinationVilles,
} from "../services/destinationService";

function VilleCard({ item, onPress }: { item: VilleItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <ImageBackground
        source={item.image ? { uri: item.image } : require("../assets/images/hotel.jpg")}
        style={styles.cardBg}
        imageStyle={styles.cardImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.45)"]}
          style={styles.gradient}
          start={{ x: 0, y: 0.59 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.cardName}>{item.nom}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function DestinationScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [filters, setFilters] = useState<string[]>(["Tous"]);
  const [sections, setSections] = useState<DestinationWithVilles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const destinations = await getDestinations();
        setFilters(["Tous", ...destinations.map((d) => d.nom)]);
        const all = await Promise.all(destinations.map((d) => getDestinationVilles(d.id)));
        setSections(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleVilles: VilleItem[] = (() => {
    let villes: VilleItem[];
    if (activeFilter === "Tous") {
      villes = sections.flatMap((s) => s.villes);
    } else {
      const section = sections.find((s) => s.destination.nom === activeFilter);
      villes = section?.villes ?? [];
    }
    if (search.trim()) {
      villes = villes.filter((v) => v.nom.toLowerCase().includes(search.toLowerCase()));
    }
    return villes;
  })();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SearchHeader
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Trouvez votre destination</Text>
          <View style={styles.grid}>
            {visibleVilles.map((v) => (
              <VilleCard
                key={v.id}
                item={v}
                onPress={() => navigation.navigate("DestinationHotels", { id: v.id, name: v.nom, type: "ville" })}
              />
            ))}
          </View>
          {visibleVilles.length === 0 && (
            <Text style={styles.emptyText}>Aucune ville disponible</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 32 },
  title: { fontFamily: "Manrope_700Bold", fontSize: 24, lineHeight: 30, color: "#000000", marginTop: 21, marginBottom: 16, paddingHorizontal: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20, rowGap: 11 },
  card: { width: "48.5%", height: 214, borderRadius: 15, overflow: "hidden" },
  cardBg: { flex: 1 },
  cardImage: { borderRadius: 15 },
  gradient: { flex: 1, justifyContent: "flex-end", padding: 12, paddingHorizontal: 6 },
  cardName: { fontFamily: "Outfit_400Regular", fontSize: 20, lineHeight: 25, letterSpacing: 0.4, color: "#FFFFFF" },
  emptyText: { fontFamily: "Outfit_400Regular", fontSize: 14, color: "#9CA3AF", textAlign: "center", marginTop: 40 },
});
