import { View, Text, ScrollView, ImageBackground, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { router } from 'expo-router';
import { OffersCard } from '../../components/molecules/OffersCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = Math.round(screenHeight * 0.35);

const OFFERS_DATA = [
  {
    id: 'offer-1',
    imageUri: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
    badgeText: 'Offres -20% du 01 au 05 Nov',
    titleBold: 'Ylang',
    titleNormal: 'Nosy Be',
    description: 'Profitez de l\'offre exclusive : la côte vous appelle.',
  },
  {
    id: 'offer-2',
    imageUri: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600',
    badgeText: 'Offres -20% du 01 au 05 Nov',
    titleBold: 'Ylang',
    titleNormal: 'Nosy Be',
    description: 'Profitez de l\'offre exclusive : la côte vous appelle.',
  },
  {
    id: 'offer-3',
    imageUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600',
    badgeText: 'Offres -20% du 01 au 05 Nov',
    titleBold: 'Ylang',
    titleNormal: 'Nosy Be',
    description: 'Profitez de l\'offre exclusive : la côte vous appelle.',
  },
  {
    id: 'offer-4',
    imageUri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600',
    badgeText: 'Offres -20% du 01 au 05 Nov',
    titleBold: 'Ylang',
    titleNormal: 'Nosy Be',
    description: 'Profitez de l\'offre exclusive : la côte vous appelle.',
  },
];

export default function OffersScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ flex: 1 }}
      >
        {/* ── EN-TÊTE DE LA PAGE (Image & Recherche) ────────────────────────── */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800' }}
          style={{ width: screenWidth, height: HEADER_HEIGHT }}
          imageStyle={{ borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}
        >
          {/* Overlay dégradé turquoise pour intégrer parfaitement l'image au design */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.45)', 'rgba(1, 189, 165, 0.2)', '#01BDA5']}
            locations={[0, 0.6, 1]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderBottomLeftRadius: 36,
              borderBottomRightRadius: 36,
            }}
          >
            <SafeAreaView edges={['top']} style={{ flex: 1, justifyContent: 'space-between' }}>
              {/* Barre de recherche et bouton de notification */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 18,
                  marginTop: Platform.OS === 'android' ? 12 : 6,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    backgroundColor: '#ffffff',
                    paddingHorizontal: 16,
                    borderRadius: 100,
                    height: 48,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="search" size={20} color="#6b7280" />
                  <TextInput
                    placeholder="Recherche"
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      fontSize: 15,
                      fontWeight: '600',
                      color: '#1f2937',
                      padding: 0,
                    }}
                  />
                </View>

                {/* Cloche de notifications blanche */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => console.log('Notifications')}
                >
                  <Ionicons name="notifications-outline" size={22} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Titre "Offres Exclusives" */}
              <View style={{ paddingHorizontal: 18, marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: '800',
                    color: '#ffffff',
                    textShadowColor: 'rgba(0, 0, 0, 0.25)',
                    textShadowOffset: { width: 0, height: 1.5 },
                    textShadowRadius: 3,
                  }}
                >
                  Offres Exclusives
                </Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>

        {/* ── SOUS-TITRE DE LA SECTION ────────────────────────── */}
        <View style={{ alignSelf: 'flex-start', marginLeft: 18, marginTop: 22, marginBottom: 18 }}>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#374151', paddingBottom: 2 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Découvrez toutes les offres exclusives
            </Text>
          </View>
        </View>

        {/* ── LISTE DES CARTES D'OFFRES ────────────────────────── */}
        <View style={{ alignItems: 'center' }}>
          {OFFERS_DATA.filter(offer =>
            `${offer.titleBold} ${offer.titleNormal} ${offer.description}`
              .toLowerCase()
              .includes(search.toLowerCase())
          ).map((offer) => (
            <OffersCard
              key={offer.id}
              imageUri={offer.imageUri}
              badgeText={offer.badgeText}
              titleBold={offer.titleBold}
              titleNormal={offer.titleNormal}
              description={offer.description}
              onPress={() => {
                router.push({
                  pathname: '/detail-offers',
                  params: {
                    imageUri: offer.imageUri,
                    badgeText: offer.badgeText,
                    titleBold: offer.titleBold,
                    titleNormal: offer.titleNormal,
                    description: offer.description,
                  },
                });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
