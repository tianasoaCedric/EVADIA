import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/tokens";

interface SearchBarProps extends ViewProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "Rechercher une destination...",
  value,
  onChangeText,
  onSubmit,
  onFocus,
  className = "",
  style,
  ...props
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center bg-white rounded-2xl px-4 py-3 gap-3 border ${focused ? "border-primary" : "border-neutral-100"} ${className}`}
      style={[{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }, style as any]}
      {...props}
    >
      <Ionicons name="search-outline" size={20} color={focused ? colors.primary.DEFAULT : colors.neutral[400]} />
      <TextInput
        className="flex-1 text-base text-neutral-900"
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText?.("")}>
          <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
