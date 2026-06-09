import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { SearchBar } from '../atoms/SearchBar';
import { CategoryBadge } from '../atoms/CategoryBadge';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_CATEGORIES = ["Hotel de Luxe", "Ecolodge", "Bungalows", "Lodge", "Villa"];

interface HeaderProps {
  categories?: string[];
  defaultCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

export const Header = ({ 
  categories = DEFAULT_CATEGORIES, 
  defaultCategory,
  onCategoryChange,
  searchValue,
  onSearchChange
}: HeaderProps) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategory ?? categories[0]);

  const handleCategoryPress = (cat: string) => {
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  return (
    <View className="bg-white pt-3 pb-3 border-b border-gray-100 shadow-sm">
      {/* Search and notification row */}
      <View className="flex-row items-center px-4 mb-3">
        <SearchBar 
          placeholder="Recherche" 
          value={searchValue}
          onChangeText={onSearchChange}
        />
        
        <TouchableOpacity 
          className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center ml-3"
          onPress={() => console.log('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Categories horizontal slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {categories.map((cat) => (
          <CategoryBadge 
            key={cat}
            label={cat}
            isActive={cat === activeCategory}
            onPress={() => handleCategoryPress(cat)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
