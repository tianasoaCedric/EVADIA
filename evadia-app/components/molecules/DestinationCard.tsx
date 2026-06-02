import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { useRef } from 'react';

interface DestinationCardProps {
  name: string;
  imageUri: string;
  onPress?: () => void;
}

export const DestinationCard = ({ name, imageUri, onPress }: DestinationCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={{
          margin: 6,
          height: 245,
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        {/* Image de la destination */}
        <Image
          source={{ uri: imageUri }}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
          }}
        />

        {/* Nom de la destination en bas à gauche */}
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: 20,
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

