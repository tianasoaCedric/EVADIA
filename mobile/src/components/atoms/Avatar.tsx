import React from "react";
import { View, Image, ViewProps } from "react-native";
import AppText from "./AppText";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends ViewProps {
  uri?: string;
  name?: string;
  size?: Size;
  className?: string;
}

const sizeMap: Record<Size, { px: number; textVariant: "caption" | "sm" | "body" | "xl" | "h3" }> = {
  xs: { px: 24, textVariant: "caption" },
  sm: { px: 32, textVariant: "sm" },
  md: { px: 40, textVariant: "body" },
  lg: { px: 56, textVariant: "xl" },
  xl: { px: 80, textVariant: "h3" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Avatar({ uri, name, size = "md", className = "", style, ...props }: AvatarProps) {
  const { px, textVariant } = sizeMap[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: px, height: px, borderRadius: px / 2 }, style as any]}
        className={className}
      />
    );
  }

  return (
    <View
      className={`rounded-full bg-primary items-center justify-center ${className}`}
      style={[{ width: px, height: px }, style as any]}
      {...props}
    >
      <AppText weight="semibold" variant={textVariant as any} className="text-white">
        {name ? getInitials(name) : "?"}
      </AppText>
    </View>
  );
}
