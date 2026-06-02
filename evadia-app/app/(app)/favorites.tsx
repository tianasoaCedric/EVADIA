import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/molecules/Header';
import { HotelCard } from '../../components/molecules/HotelCard';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2; // Perfect width calculation for 2 columns with paddings

const REGIONS = ['Nord', 'Est', 'Hautes Terres Centrales', 'Ouest', 'Sud'];

const FAVORITE_HOTELS = Array.from({ length: 8 }, (_, i) => ({
  id: `fav-${i}`,
  name: 'Aara Antananarivo',
  price: '225.000Ar/nuité',
  rating: 4.25,
  imageUri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300',
}));

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      {/* En-tête de recherche et filtres de régions */}
      <Header categories={REGIONS} defaultCategory="Nord" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        style={{ flex: 1 }}
      >
        {/* Titre de la page */}
        <View style={{ paddingHorizontal: 18, paddingTop: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
            Vos Favoris
          </Text>
        </View>

        {/* Grille de favoris (2 Colonnes) */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 18,
            justifyContent: 'space-between',
          }}
        >
          {FAVORITE_HOTELS.map((hotel) => (
            <HotelCard
              key={hotel.id}
              name={hotel.name}
              price={hotel.price}
              rating={hotel.rating}
              imageUri={hotel.imageUri}
              defaultFavorite={true}
              width={CARD_WIDTH}
              marginRight={0}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
