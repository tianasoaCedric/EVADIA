import { TouchableOpacity, Text } from 'react-native';

interface CategoryBadgeProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

export const CategoryBadge = ({ label, isActive = false, onPress }: CategoryBadgeProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-3 py-1 ${isActive ? 'bg-[#01BDA5]' : 'bg-gray-100'}`}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
      }}
    >
      <Text
        style={{
          fontFamily: 'Outfit_400Regular',
          color: isActive ? '#ffffff' : '#464646',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
