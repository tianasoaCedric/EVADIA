import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  className?: string;
}

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  className = ''
}: ButtonProps) => {
  // Couleurs selon la variante
  const variants = {
    primary: 'bg-[#01BDA5]',     // Vert turquoise
    secondary: 'bg-gray-500',
    outline: 'bg-transparent border border-[#01BDA5]'
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-[#01BDA5]'
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`${variants[variant]} rounded-[25px] py-2.5 px-4 ${className}`}
      style={{
        width: 350,
        height: 38,
      }}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={`${textVariants[variant]} text-center font-semibold text-base`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};