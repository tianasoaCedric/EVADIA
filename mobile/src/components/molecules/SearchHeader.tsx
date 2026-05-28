import React from "react";
import { View, TextInput, TouchableOpacity, ScrollView, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { s as sc, vs, ms } from "../../lib/scale";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  filters: string[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
  onSearchPress?: () => void;
};

export default function SearchHeader({ search, onSearchChange, filters, activeFilter, onFilterChange, onSearchPress }: Props) {
  return (
    <View style={styles.head}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={onSearchPress ? 0.7 : 1} onPress={onSearchPress}>
          <Ionicons name="search-outline" size={20} color="#626262" />
          {onSearchPress ? (
            <Text style={[styles.input, { color: "#464646", textAlign: "center" }]}>Recherche</Text>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Recherche"
              placeholderTextColor="#464646"
              value={search}
              onChangeText={onSearchChange}
              textAlignVertical="center"
              textAlign="center"
            />
          )}
        </TouchableOpacity>
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
    paddingTop: vs(40),
    paddingBottom: vs(21),
    gap: vs(16),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: sc(10),
    paddingHorizontal: sc(20),
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: sc(32),
    paddingHorizontal: sc(16),
    height: vs(40),
    gap: sc(10),
  },
  input: {
    flex: 1,
    fontFamily: "Outfit_300Light",
    fontSize: ms(12),
    letterSpacing: 0.24,
    color: "#464646",
    paddingVertical: 0,
  },
  bell: {
    width: sc(40),
    height: vs(40),
    backgroundColor: "#F5F5F5",
    borderRadius: sc(38),
    alignItems: "center",
    justifyContent: "center",
  },
  filtersScroll: { gap: sc(10), paddingHorizontal: sc(20) },
  chip: {
    paddingHorizontal: sc(8),
    paddingVertical: vs(6),
    backgroundColor: "#F5F5F5",
    borderRadius: sc(32),
  },
  chipActive: { backgroundColor: "#01BDA5" },
  chipText: {
    fontFamily: "Outfit_400Regular",
    fontSize: ms(12),
    lineHeight: 15,
    letterSpacing: 0.24,
    color: "#000000",
  },
  chipTextActive: { color: "#FFFFFF" },
});
