import { View, Text, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface OffersCardProps {
  imageUri: string;
  badgeText: string;
  titleBold: string;
  titleNormal: string;
  description: string;
  onPress?: () => void;
}

export const OffersCard = ({
  imageUri,
  badgeText,
  titleBold,
  titleNormal,
  description,
  onPress,
}: OffersCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        width: screenWidth - 36, // Centered with 18px padding on each side
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <ImageBackground
        source={{ uri: imageUri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        {/* Dégradé de la couleur principale en overlay du bas vers le haut */}
        <LinearGradient
          colors={['transparent', 'rgba(1, 189, 165, 0.1)', 'rgba(0, 56, 49, 0.75)']}
          locations={[0, 0.5, 1]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '100%',
            justifyContent: 'flex-end',
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          {/* Badge de l'offre (capsule turquoise) */}
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#01BDA5',
              borderRadius: 100,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: 12,
                fontFamily: 'Outfit_700Bold',
              }}
            >
              {badgeText}
            </Text>
          </View>

          {/* Titre (Ylang, Nosy Be) */}
          <Text
            style={{
              color: '#ffffff',
              fontSize: 15,
              marginBottom: 4,
            }}
          >
            <Text style={{ fontFamily: 'Outfit_800ExtraBold' }}>{titleBold}</Text>
            {titleNormal ? `, ${titleNormal}` : ''}
          </Text>

          {/* Description */}
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 12,
              fontFamily: 'Outfit_500Medium',
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {description}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};
