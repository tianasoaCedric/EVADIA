import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ImageBackground, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OffersCard } from '../../components/molecules/OffersCard';
import { publicService, Offre } from '../../services/public';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = Math.round(screenHeight * 0.35);

function getOfferImage(offre: Offre): string {
  return offre.photo ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800';
}

function getBadgeText(offre: Offre): string {
  const pct = (offre.discount ?? offre.reduction_pct) ? `-${offre.discount ?? offre.reduction_pct}%` : '';
  const dates =
    offre.date_debut && offre.date_fin
      ? ` du ${offre.date_debut} au ${offre.date_fin}`
      : '';
  return `Offre ${pct}${dates}`.trim() || 'Offre Exclusive';
}

export default function OffersScreen() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadOffres = () => {
    setLoading(true);
    setError(null);
    publicService.getOffres()
      .then((data) => setOffres(Array.isArray(data) ? data : []))
      .catch((e: any) => setError(e?.message ?? 'Impossible de charger les offres.'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
      loadOffres();
    }, [])
  );

  const filtered = offres.filter((o) =>
    `${o.titre ?? ''} ${o.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800' }}
          style={{ width: screenWidth, height: HEADER_HEIGHT }}
          imageStyle={{ borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'rgba(1,189,165,0.2)', '#01BDA5']}
            locations={[0, 0.6, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}
          >
            <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginTop: Platform.OS === 'android' ? 12 : 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16, borderRadius: 100, height: 48, elevation: 2 }}>
                  <Ionicons name="search" size={20} color="#6b7280" />
                  <TextInput
                    placeholder="Recherche"
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                    style={{ flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#1f2937', padding: 0 }}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginLeft: 12, elevation: 2 }}
                >
                  <Ionicons name="notifications-outline" size={22} color="#000000" />
                </TouchableOpacity>
              </View>

              <View style={{ paddingHorizontal: 18, marginBottom: 20 }}>
                <Text style={{ fontSize: 30, fontWeight: '800', color: '#ffffff', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 3 }}>
                  Offres Exclusives
                </Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>

        <View style={{ alignSelf: 'flex-start', marginLeft: 18, marginTop: 22, marginBottom: 18 }}>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#374151', paddingBottom: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Découvrez toutes les offres exclusives
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator size="large" color="#01BDA5" />
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 }}>
            <Ionicons name="cloud-offline-outline" size={52} color="#ccc" />
            <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity
              onPress={loadOffres}
              style={{ marginTop: 16, backgroundColor: '#01BDA5', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            {filtered.map((offre) => (
              <OffersCard
                key={offre.id}
                imageUri={getOfferImage(offre)}
                badgeText={getBadgeText(offre)}
                titleBold={(offre.hotel_nom ?? offre.titre ?? '').split(' ')[0]}
                titleNormal={offre.city ?? ''}
                description={offre.description ?? ''}
                onPress={() => {
                  router.push({
                    pathname: '/detail-offers',
                    params: {
                      id: offre.id,
                      imageUri: getOfferImage(offre),
                      badgeText: getBadgeText(offre),
                      titleBold: (offre.hotel_nom ?? offre.titre ?? '').split(' ')[0],
                      titleNormal: offre.city ?? '',
                      description: offre.description ?? '',
                      services: JSON.stringify([]),
                    },
                  });
                }}
              />
            ))}
            {filtered.length === 0 && (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Ionicons name="pricetag-outline" size={48} color="#ccc" />
                <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>
                  Aucune offre disponible
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
