import React, { useState } from "react";
import { TextInput, View, TouchableOpacity, TextInputProps } from "react-native";
import AppText from "./AppText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  className?: string;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className = "",
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <AppText variant="label" weight="medium" className="text-neutral-700 mb-1">
          {label}
        </AppText>
      )}
      <View
        className={`flex-row items-center bg-white rounded-lg px-3 py-3 border ${
          error ? "border-red-500" : focused ? "border-primary" : "border-neutral-200"
        } ${className}`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-base text-neutral-900"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-2">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <AppText variant="caption" className="text-red-500 mt-1">
          {error}
        </AppText>
      )}
      {hint && !error && (
        <AppText variant="caption" className="text-neutral-400 mt-1">
          {hint}
        </AppText>
      )}
    </View>
  );
}
