import React from "react";
import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View } from "react-native";
import AppText from "./AppText";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary active:bg-primary-dark",
  secondary: "bg-neutral-100",
  outline: "border border-primary bg-transparent",
  ghost: "bg-transparent",
  danger: "bg-red-500",
};

const textVariantClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-neutral-800",
  outline: "text-primary",
  ghost: "text-neutral-700",
  danger: "text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 rounded-md",
  md: "px-5 py-3 rounded-lg",
  lg: "px-6 py-4 rounded-xl",
};

const textSizeClasses: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : "self-start"} ${isDisabled ? "opacity-50" : ""} ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#fff" : "#01BDA5"}
        />
      ) : (
        <>
          {leftIcon}
          <AppText weight="semibold" className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
            {children}
          </AppText>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}
