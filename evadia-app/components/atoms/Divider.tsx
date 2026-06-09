import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
}

export const Divider = ({ text = "OU" }: DividerProps) => {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-px bg-gray-300" />
      {text && (
        <Text className="mx-4 text-gray-500 text-sm">{text}</Text>
      )}
      <View className="flex-1 h-px bg-gray-300" />
    </View>
  );
};