import React from "react";
import { View, TextInput, TouchableOpacity, ScrollView, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  filters: string[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
};

export default function SearchHeader({ search, onSearchChange, filters, activeFilter, onFilterChange }: Props) {
  return (
    <View style={styles.head}>
      <View style={styles.row}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#626262" />
          <TextInput
            style={styles.input}
            placeholder="Recherche"
            placeholderTextColor="#464646"
            value={search}
            onChangeText={onSearchChange}
            textAlignVertical="center"
            textAlign="center"
          />
        </View>
        <View style={styles.bell}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => onFilterChange(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 21,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 32,
    paddingHorizontal: 16,
    height: 40,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    letterSpacing: 0.24,
    color: "#464646",
    paddingVertical: 0,
  },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersScroll: { gap: 10, paddingHorizontal: 20 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 32,
  },
  chipActive: { backgroundColor: "#01BDA5" },
  chipText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.24,
    color: "#000000",
  },
  chipTextActive: { color: "#FFFFFF" },
});
