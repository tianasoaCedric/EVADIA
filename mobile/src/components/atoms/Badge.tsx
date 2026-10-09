import React from "react";
import { View, ViewProps } from "react-native";
import AppText from "./AppText";

type Variant = "primary" | "success" | "warning" | "error" | "neutral";
type Size = "sm" | "md";

interface BadgeProps extends ViewProps {
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: "bg-primary-50", text: "text-primary" },
  success: { bg: "bg-green-50", text: "text-green-700" },
  warning: { bg: "bg-amber-50", text: "text-amber-700" },
  error: { bg: "bg-red-50", text: "text-red-500" },
  neutral: { bg: "bg-neutral-100", text: "text-neutral-600" },
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2 py-0.5 rounded-full",
  md: "px-3 py-1 rounded-full",
};

export default function Badge({
  label,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const { bg, text } = variantClasses[variant];

  return (
    <View className={`self-start ${bg} ${sizeClasses[size]} ${className}`} {...props}>
      <AppText variant={size === "sm" ? "caption" : "label"} weight="medium" className={text}>
        {label}
      </AppText>
    </View>
  );
}
