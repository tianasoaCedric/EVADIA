import React from "react";
import { View, ViewProps } from "react-native";
import AppText from "./AppText";

interface DividerProps extends ViewProps {
  label?: string;
  className?: string;
}

export default function Divider({ label, className = "", ...props }: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center gap-3 ${className}`} {...props}>
        <View className="flex-1 h-px bg-neutral-200" />
        <AppText variant="caption" className="text-neutral-400">{label}</AppText>
        <View className="flex-1 h-px bg-neutral-200" />
      </View>
    );
  }
  return <View className={`h-px bg-neutral-200 ${className}`} {...props} />;
}
