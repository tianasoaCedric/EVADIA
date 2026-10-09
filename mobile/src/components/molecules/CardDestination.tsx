import React from "react";
import { View, Image, TouchableOpacity, ViewProps, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../atoms/AppText";
import { shadows } from "../../lib/tokens";

interface CardDestinationProps extends ViewProps {
  name: string;
  country: string;
  imageUri?: string;
  hotelCount?: number;
  onPress?: () => void;
  className?: string;
}

export default function CardDestination({
  name,
  country,
  imageUri,
  hotelCount,
  onPress,
  className = "",
  style,
  ...props
}: CardDestinationProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={[shadows.card, style as any]}
    >
      <View style={{ height: 176 }}>
        <Image
          source={imageUri ? { uri: imageUri } : require("../../assets/images/placeholder.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.65)"]}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <AppText variant="h4" weight="bold" className="text-white">{name}</AppText>
          <AppText variant="caption" className="text-white/80">
            {country}{hotelCount !== undefined ? ` · ${hotelCount} hôtels` : ""}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
