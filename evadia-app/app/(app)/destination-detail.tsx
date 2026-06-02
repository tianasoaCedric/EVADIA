import { View, Text, TouchableOpacity, FlatList, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/atoms/SearchBar';
import { DestinationHotelCard } from '../../components/molecules/DestinationHotelCard';
import { Ionicons } from '@expo/vector-icons';

// Données statiques fidèles à la maquette avec carrousel d'images
const HOTELS_BY_DESTINATION: Record<string, Array<{
  id: string;
  name: string;
  price: string;
  rating: number;
  location: string;
  imageUris: string[];
}>> = {
  "Sainte Marie": [
    {
      id: 'sm1',
      name: 'Aara Ecolodge',
      price: '225.000ar/Nuitée',
      rating: 4.25,
      location: 'Lonkitsy, Sainte Marie',
      imageUris: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
      ],
    },
    {
      id: 'sm2',
      name: 'Aara Ecolodge',
      price: '225.000ar/Nuitée',
      rating: 4.25,
      location: 'Lonkitsy, Sainte Marie',
      imageUris: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
      ],
    },
    {
      id: 'sm3',
      name: 'Aara Ecolodge',
      price: '225.000ar/Nuitée',
      rating: 4.25,
      location: 'Lonkitsy, Sainte Marie',
      imageUris: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
      ],
    },
  ],
  "Andasibe": [
    {
      id: 'ad1',
      name: 'Andasibe Lemur Lodge',
      price: '195.000ar/Nuitée',
      rating: 4.5,
      location: 'National Park, Andasibe',
      imageUris: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600',
      ],
    },
    {
      id: 'ad2',
      name: 'Vakona Forest Lodge',
      price: '280.000ar/Nuitée',
      rating: 4.75,
      location: 'Vakona Reserve, Andasibe',
      imageUris: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600',
      ],
    },
    {
      id: 'ad3',
      name: 'Eulophiella Lodge',
      price: '210.000ar/Nuitée',
      rating: 4.15,
      location: 'Forêt d’Andasibe, Andasibe',
      imageUris: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600',
      ],
    },
  ],
};

// Récupérateur dynamique d'hôtels avec données par défaut de secours
const getHotelsForDestination = (destName: string) => {
  if (HOTELS_BY_DESTINATION[destName]) {
    return HOTELS_BY_DESTINATION[destName];
  }
  return [
    {
      id: `${destName}-h1`,
      name: `Aara ${destName} Resort`,
      price: '240.000ar/Nuitée',
      rating: 4.65,
      location: `Centre Ville, ${destName}`,
      imageUris: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
      ],
    },
    {
      id: `${destName}-h2`,
      name: `${destName} Wellness Lodge`,
      price: '185.000ar/Nuitée',
      rating: 4.35,
      location: `Nature Park, ${destName}`,
      imageUris: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
      ],
    },
    {
      id: `${destName}-h3`,
      name: `${destName} Beach Hotel`,
      price: '295.000ar/Nuitée',
      rating: 4.8,
      location: `Bord de Mer, ${destName}`,
      imageUris: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
      ],
    },
  ];
};

export default function DestinationDetailScreen() {
  const params = useLocalSearchParams();
  const destinationName = (params.name as string) || "Destination";
  const [searchQuery, setSearchQuery] = useState("");

  const hotels = getHotelsForDestination(destinationName);

  // Animation d'entrée fluide (fade-in + slide-up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filtrer les hôtels par la recherche
  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        {/* Barre de Recherche et Notifications */}
        <View className="flex-row items-center px-4 pt-3 pb-2">
          <SearchBar 
            placeholder="Recherche" 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <TouchableOpacity 
            className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center ml-3"
            onPress={() => console.log('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Bouton de retour et titre de la destination */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mb-2">
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.replace('/(app)/destination')}
            className="flex-row items-center justify-center w-8 h-8 rounded-full"
          >
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text 
            style={{ 
              fontSize: 22, 
              fontWeight: '800', 
              color: '#000', 
              marginLeft: 8,
              letterSpacing: -0.5 
            }}
          >
            {destinationName}
          </Text>
        </View>

        {/* Liste des hôtels */}
        <FlatList
          data={filteredHotels}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 110, // Reste visible au dessus de la barre des onglets
          }}
          renderItem={({ item }) => (
            <DestinationHotelCard
              name={item.name}
              price={item.price}
              rating={item.rating}
              location={item.location}
              imageUris={item.imageUris}
              onPress={() => router.push({
                pathname: '/(app)/hotel-detail',
                params: {
                  name: item.name,
                  location: item.location,
                  rating: item.rating,
                  imageUris: JSON.stringify(item.imageUris),
                },
              })}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-24 px-6">
              <Ionicons name="search-outline" size={48} color="#cccccc" />
              <Text className="text-gray-500 font-semibold text-center mt-4">
                Aucun hôtel trouvé pour "{searchQuery}" dans la région {destinationName}
              </Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

