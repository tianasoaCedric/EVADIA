import { View, TextInput } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const SearchBar = ({ placeholder = "Recherche", value: propValue, onChangeText }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const value = propValue !== undefined ? propValue : localValue;
  const handleChangeText = onChangeText || setLocalValue;

  return (
    <View 
      className="flex-row items-center flex-1 bg-gray-100 px-4"
      style={{
        borderRadius: 100,
        height: 48,
        borderWidth: isFocused ? 1.5 : 0,
        borderColor: '#01BDA5',
      }}
    >
      <Ionicons name="search" size={20} color="#4b5563" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#8e8e93"
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 ml-3 font-semibold text-gray-800"
        style={{ 
          fontSize: 16, 
          padding: 0,
          textAlignVertical: 'center',
          includeFontPadding: false 
        }}
      />
    </View>
  );
};
