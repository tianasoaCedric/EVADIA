import { View, TextInput } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const SearchBar = ({ placeholder, value: propValue, onChangeText }: SearchBarProps) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const resolvedPlaceholder = placeholder ?? t('Common.search');

  const value = propValue !== undefined ? propValue : localValue;
  const handleChangeText = onChangeText || setLocalValue;

  return (
    <View
      className="flex-1 bg-gray-100 px-4"
      style={{
        borderRadius: 100,
        height: 48,
        justifyContent: 'center',
        borderWidth: isFocused ? 1.5 : 0,
        borderColor: '#01BDA5',
      }}
    >
      <Ionicons
        name="search"
        size={20}
        color="#4b5563"
        style={{ position: 'absolute', left: 16 }}
      />
      <TextInput
        placeholder={resolvedPlaceholder}
        placeholderTextColor="#8e8e93"
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="text-gray-800"
        style={{
          fontSize: 15,
          fontFamily: 'Outfit_400Regular',
          padding: 0,
          margin: 0,
          height: '100%',
          textAlign: 'center',
          textAlignVertical: 'center',
          includeFontPadding: false,
        }}
      />
    </View>
  );
};
