import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface RoomCardProps {
  name: string;
  price: string;
  imageUri: string;
  beds: number;
  bathrooms: number;
  persons: number;
  onReserve?: () => void;
}

export const RoomCard = ({
  name,
  price,
  imageUri,
  beds,
  bathrooms,
  persons,
  onReserve,
}: RoomCardProps) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onReserve}
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 8,
        alignItems: 'flex-start',
        width: screenWidth - 36, // Adjust to fit parent scroll width perfectly
        marginRight: 16,
      }}
    >
      {/* Thumbnail de la chambre sur la gauche */}
      <Image
        source={{ uri: imageUri }}
        style={{
          width: 106,
          height: 106,
          borderRadius: 20,
          resizeMode: 'cover',
        }}
      />

      {/* Colonne d'infos et d'actions sur la droite */}
      <View style={{ flex: 1, marginLeft: 14, height: 106, justifyContent: 'space-between' }}>
        {/* Titre et Prix */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#111827', flex: 1, marginRight: 4 }}>
            {name}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#111827' }}>
            {price}
          </Text>
        </View>

        {/* Équipements de la chambre */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bed-outline" size={16} color="#111827" />
            <Text style={{ fontSize: 12, color: '#4b5563', fontFamily: 'Outfit_500Medium', marginLeft: 4 }}>
              {t('RoomCard.beds', { count: beds })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="water-outline" size={16} color="#111827" />
            <Text style={{ fontSize: 12, color: '#4b5563', fontFamily: 'Outfit_500Medium', marginLeft: 4 }}>
              {t('RoomCard.bathrooms', { count: bathrooms })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person-outline" size={15} color="#111827" />
            <Text style={{ fontSize: 12, color: '#4b5563', fontFamily: 'Outfit_500Medium', marginLeft: 4 }}>
              {t('RoomCard.persons', { count: persons })}
            </Text>
          </View>
        </View>

        {/* Bouton Réserver dans la colonne de droite */}
        <TouchableOpacity
          onPress={onReserve}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#01BDA5',
            borderRadius: 50,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold', fontSize: 14 }}>
            {t('RoomCard.reserve')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

