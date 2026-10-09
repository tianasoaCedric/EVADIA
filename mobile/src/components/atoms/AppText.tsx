import React from "react";
import { Text, TextProps } from "react-native";

type Variant = "h1" | "h2" | "h3" | "h4" | "body" | "body-sm" | "caption" | "label" | "lg" | "sm";
type Weight = "light" | "regular" | "medium" | "semibold" | "bold";

interface AppTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  h1: "text-4xl",
  h2: "text-3xl",
  h3: "text-2xl",
  h4: "text-xl",
  body: "text-base",
  "body-sm": "text-sm",
  caption: "text-xs",
  label: "text-sm",
  lg: "text-lg",
  sm: "text-sm",
};

const weightClasses: Record<Weight, string> = {
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export default function AppText({
  variant = "body",
  weight = "regular",
  className = "",
  children,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      className={`${variantClasses[variant]} ${weightClasses[weight]} text-neutral-900 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
