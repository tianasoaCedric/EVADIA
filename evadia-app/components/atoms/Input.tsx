import { View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  theme?: 'light' | 'dark';
}

export const Input = ({ 
  placeholder, 
  value, 
  onChangeText, 
  iconName,
  secureTextEntry = false,
  keyboardType = 'default',
  theme = 'dark'
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isLight = theme === 'light';

  return (
    <View 
      className="flex-row items-center"
      style={{
        width: 353,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 100,
        gap: 30,
        backgroundColor: isLight ? '#f3f4f6' : '#f3f4f647',
        borderWidth: isFocused ? 1 : 0,
        borderColor: '#01BDA5',
      }}
    >
      <Ionicons 
        name={iconName} 
        size={24} 
        color={isLight ? '#9ca3af' : '#fefefe'} 
      />

      <TextInput
        className="flex-1"
        style={{ fontSize: 16, padding: 0, color: isLight ? '#1f2937' : '#fff' }}
        placeholder={placeholder}
        placeholderTextColor={isLight ? '#9ca3af' : '#ffffff80'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={24} 
            color={isLight ? '#9ca3af' : '#ffffff80'} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};