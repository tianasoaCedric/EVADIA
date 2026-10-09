import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SearchHeader from "../components/molecules/SearchHeader";

const FILTERS = ["Filtres", "All", "Hotel de Luxe", "Lodge", "Villa"];

const DESTINATIONS = [
  { id: "1", name: "Andasibe" },
  { id: "2", name: "Sainte Marie" },
  { id: "3", name: "Nosy Be" },
  { id: "4", name: "Andasibe" },
  { id: "5", name: "Isalo" },
  { id: "6", name: "Morondava" },
];

function DestinationCard({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <ImageBackground
        source={require("../assets/images/hotel.jpg")}
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
          <Text style={styles.cardName}>{name}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function DestinationScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Filtres");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SearchHeader
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Trouvez votre destination</Text>

        <View style={styles.grid}>
          {DESTINATIONS.map((d) => (
            <DestinationCard
              key={d.id}
              name={d.name}
              onPress={() => navigation.navigate("DestinationHotels", { id: d.id, name: d.name })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  scrollContent: {
    paddingBottom: 32,
  },

  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: 24,
    lineHeight: 30,
    color: "#000000",
    marginTop: 21,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    rowGap: 11,
  },

  card: {
    width: "48.5%",
    height: 214,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 0,
  },
  cardBg: {
    flex: 1,
  },
  cardImage: {
    borderRadius: 15,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    paddingHorizontal: 6,
  },
  cardName: {
    fontFamily: "Outfit_400Regular",
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },
});
