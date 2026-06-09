import React from "react";
import { View, Image, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../atoms/AppText";
import Badge from "../atoms/Badge";
import { colors, shadows } from "../../lib/tokens";

interface CardHotelProps extends ViewProps {
  id: string;
  name: string;
  city: string;
  country: string;
  imageUri?: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
  isOffer?: boolean;
  offerLabel?: string;
  onPress?: () => void;
  onFavoritePress?: () => void;
  className?: string;
}

export default function CardHotel({
  name,
  city,
  country,
  imageUri,
  price,
  currency = "EUR",
  rating,
  reviewCount,
  isFavorite = false,
  isOffer = false,
  offerLabel,
  onPress,
  onFavoritePress,
  className = "",
  style,
  ...props
}: CardHotelProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      className={`bg-white rounded-2xl overflow-hidden ${className}`}
      style={[shadows.card, style as any]}
    >
      <View className="relative">
        <Image
          source={imageUri ? { uri: imageUri } : require("../../assets/images/placeholder.png")}
          className="w-full h-48"
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={onFavoritePress}
          className="absolute top-3 right-3 rounded-full p-2"
          style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#EF4444" : colors.neutral[600]}
          />
        </TouchableOpacity>
        {isOffer && offerLabel && (
          <View className="absolute top-3 left-3">
            <Badge label={offerLabel} variant="primary" size="sm" />
          </View>
        )}
      </View>

      <View className="p-4 gap-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <AppText variant="body" weight="semibold" numberOfLines={1}>{name}</AppText>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Ionicons name="location-outline" size={13} color={colors.neutral[400]} />
              <AppText variant="caption" className="text-neutral-500">{city}, {country}</AppText>
            </View>
          </View>
          {rating !== undefined && (
            <View className="flex-row items-center gap-1 bg-primary-50 px-2 py-1 rounded-lg">
              <Ionicons name="star" size={12} color={colors.primary.DEFAULT} />
              <AppText variant="caption" weight="semibold" className="text-primary">
                {rating.toFixed(1)}
              </AppText>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          {reviewCount !== undefined && (
            <AppText variant="caption" className="text-neutral-400">{reviewCount} avis</AppText>
          )}
          <View className="flex-row items-baseline gap-1 ml-auto">
            <AppText variant="body" weight="bold" className="text-primary">
              {price.toLocaleString()} {currency}
            </AppText>
            <AppText variant="caption" className="text-neutral-400">/nuit</AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
