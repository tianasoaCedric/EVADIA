import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/molecules/Header';
import { HotelCard } from '../../components/molecules/HotelCard';
import { Ionicons } from '@expo/vector-icons';

// Mock data reflétant fidèlement les quatre villes demandées dans les maquettes
const ACCOMMODATIONS_BY_CITY = [
  {
    city: 'Nosy Be',
    hotels: [
      {
        id: 'nb1',
        name: 'Aara Antananarivo',
        price: '225.000Ar/nuité',
        rating: 4.25,
        imageUri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300',
      },
      {
        id: 'nb2',
        name: 'Ravintsara Wellness',
        price: '310.000Ar/nuité',
        rating: 4.5,
        imageUri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300',
      },
      {
        id: 'nb3',
        name: 'Nosy Be Beach Resort',
        price: '280.000Ar/nuité',
        rating: 4.35,
        imageUri: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=300',
      },
    ]
  },
  {
    city: 'Isalo',
    hotels: [
      {
        id: 'is1',
        name: 'Aara Antananarivo',
        price: '225.000Ar/nuité',
        rating: 4.25,
        imageUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300',
      },
      {
        id: 'is2',
        name: 'Isalo Rock Lodge',
        price: '260.000Ar/nuité',
        rating: 4.6,
        imageUri: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=300',
      },
      {
        id: 'is3',
        name: 'Relais de la Reine',
        price: '195.000Ar/nuité',
        rating: 4.15,
        imageUri: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=300',
      },
    ]
  },
  {
    city: 'Antananarivo',
    hotels: [
      {
        id: 'an1',
        name: 'Aara Antananarivo',
        price: '225.000Ar/nuité',
        rating: 4.25,
        imageUri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300',
      },
      {
        id: 'an2',
        name: 'Carlton Hotel',
        price: '340.000Ar/nuité',
        rating: 4.8,
        imageUri: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=300',
      },
      {
        id: 'an3',
        name: 'Tambho Hotel & Spa',
        price: '185.000Ar/nuité',
        rating: 4.3,
        imageUri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=300',
      },
    ]
  },
  {
    city: 'Mahajanga',
    hotels: [
      {
        id: 'mj1',
        name: 'Aara Antananarivo',
        price: '225.000Ar/nuité',
        rating: 4.25,
        imageUri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300',
      },
      {
        id: 'mj2',
        name: 'Coco Lodge Majunga',
        price: '160.000Ar/nuité',
        rating: 4.0,
        imageUri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=300',
      },
      {
        id: 'mj3',
        name: 'Antsanitia Resort',
        price: '250.000Ar/nuité',
        rating: 4.45,
        imageUri: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=300',
      },
    ]
  }
];

export default function HomePage() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header unifié avec barre de recherche et slider de catégories */}
      <Header />

      {/* Liste des sections de sélections par villes */}
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 96 }} // Padding bottom plus large pour ne pas masquer les cartes sous le footer
        showsVerticalScrollIndicator={false}
      >
        {ACCOMMODATIONS_BY_CITY.map((section) => (
          <View key={section.city} className="mb-6">
            {/* Titre de la section avec flèche directionnelle */}
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-3 mt-3"
              onPress={() => console.log('Voir tout:', section.city)}
            >
              <Text className="text-[16px] font-bold text-gray-900">
                Selection d’hebergement a {section.city}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            {/* Slider horizontal d'hébergements */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {section.hotels.map((hotel) => (
                <HotelCard 
                  key={hotel.id}
                  imageUri={hotel.imageUri}
                  name={hotel.name}
                  price={hotel.price}
                  rating={hotel.rating}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}