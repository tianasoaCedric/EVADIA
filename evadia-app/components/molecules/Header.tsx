import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { SearchBar } from '../atoms/SearchBar';
import { CategoryBadge } from '../atoms/CategoryBadge';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notifications';

interface HeaderProps {
  categories?: string[];
  defaultCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

export const Header = ({
  categories,
  defaultCategory,
  onCategoryChange,
  searchValue,
  onSearchChange
}: HeaderProps) => {
  const { t } = useTranslation();
  const defaultCategories = [
    t('Header.category_luxury_hotel'),
    t('Header.category_ecolodge'),
    t('Header.category_bungalows'),
    t('Header.category_lodge'),
    t('Header.category_villa'),
  ];
  const resolvedCategories = categories ?? defaultCategories;
  const [activeCategory, setActiveCategory] = useState(defaultCategory ?? resolvedCategories[0]);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      notificationService.getUnreadCount().then(setUnreadCount).catch(() => {});
    }, [])
  );

  const handleCategoryPress = (cat: string) => {
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  return (
    <View className="bg-white pt-3 pb-3 border-b border-gray-100 shadow-sm">
      {/* Search and notification row */}
      <View className="flex-row items-center px-4 mb-3">
        <SearchBar
          placeholder={t('Common.search')}
          value={searchValue}
          onChangeText={onSearchChange}
        />
        
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center ml-3"
          onPress={() => router.push('/(app)/notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#000" />
          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                paddingHorizontal: 3,
                backgroundColor: '#ff2d55',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: 'Outfit_800ExtraBold', color: '#fff' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories horizontal slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 30, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, alignItems: 'center' }}
      >
        {resolvedCategories.map((cat) => (
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
