import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  BackHandler,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.42);

const ROOM_AMENITIES = [
  { icon: 'wifi', label: 'Wifi ultra-rapide' },
  { icon: 'snow', label: 'Climatisation' },
  { icon: 'tv', label: 'Smart TV 4K' },
  { icon: 'cafe', label: 'Machine à café' },
  { icon: 'briefcase', label: 'Espace de travail' },
  { icon: 'wine', label: 'Mini-bar' },
  { icon: 'key', label: 'Coffre-fort' },
  { icon: 'shirt', label: 'Service de blanchisserie' },
] as const;

export default function ProprieterDetailScreen() {
  const params = useLocalSearchParams();
  const roomName = (params.name as string) || 'Chambre de Luxe';
  const roomPrice = (params.price as string) || '225.000Ariary/nuit';
  const roomImage = (params.imageUri as string) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800';
  const beds = parseInt((params.beds as string) || '2');
  const bathrooms = parseInt((params.bathrooms as string) || '1');
  const persons = parseInt((params.persons as string) || '2');
  const location = (params.location as string) || 'Madagascar';
  const hotelName = (params.hotelName as string) || '';
  const hotelRating = (params.hotelRating as string) || '4.5';
  const hotelImageUris = (params.hotelImageUris as string) || '';

  const [activeIndex, setActiveIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  const imageUris = [
    roomImage,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800',
  ];

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

  // Gérer le bouton de retour physique Android
  useEffect(() => {
    const backAction = () => {
      if (isBooking) {
        setIsBooking(false);
        return true; // Bloque le retour par défaut de l'application
      }
      return false; // Laisse faire le retour normal
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isBooking]);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  // Extraire et formater le prix propre (ex: "225.000ar")
  const rawPriceText = roomPrice.split('/')[0];
  const cleanPrice = rawPriceText
    .toLowerCase()
    .replace('ariary', 'ar')
    .replace(' ', '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={[]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* ── Carrousel d'images de la chambre scrollable ────────────────────────── */}
          <View
            style={{
              width: screenWidth,
              height: IMAGE_HEIGHT,
              backgroundColor: '#e5e7eb',
              position: 'relative',
              borderBottomLeftRadius: 36,
              borderBottomRightRadius: 36,
              overflow: 'hidden',
            }}
          >
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ width: screenWidth, height: IMAGE_HEIGHT }}
            >
              {imageUris.map((uri, idx) => (
                <Image
                  key={`room-img-${idx}`}
                  source={{ uri }}
                  style={{
                    width: screenWidth,
                    height: IMAGE_HEIGHT,
                    resizeMode: 'cover',
                  }}
                />
              ))}
            </ScrollView>

            {/* Bouton retour ← en haut à gauche */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (isBooking) {
                  setIsBooking(false);
                } else {
                  if (hotelName) {
                    router.replace({
                      pathname: '/(app)/hotel-detail',
                      params: {
                        name: hotelName,
                        location: location,
                        rating: hotelRating,
                        imageUris: hotelImageUris,
                      },
                    });
                  } else {
                    if (router.canGoBack()) {
                      router.back();
                    } else {
                      router.replace('/(app)/hotel-detail');
                    }
                  }
                }
              }}
              style={{
                position: 'absolute',
                top: 52,
                left: 18,
                zIndex: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="chevron-back"
                size={30}
                color="#fff"
                style={{
                  textShadowColor: 'rgba(0,0,0,0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
              />
            </TouchableOpacity>

            {/* Bouton partage en haut à droite (masqué en mode réservation) */}
            {!isBooking && (
              <View
                style={{
                  position: 'absolute',
                  top: 52,
                  right: 18,
                  zIndex: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => console.log('Partager')}
                >
                  <Ionicons
                    name="share-outline"
                    size={26}
                    color="#fff"
                    style={{
                      textShadowColor: 'rgba(0,0,0,0.35)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Dots indicateurs en bas de l'image */}
            {imageUris.length > 1 && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                {imageUris.map((_, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <View
                      key={`dot-${idx}`}
                      style={{
                        width: active ? 24 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: active
                          ? '#01BDA5'
                          : 'rgba(255,255,255,0.75)',
                        marginRight: idx < imageUris.length - 1 ? 6 : 0,
                      }}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {/* ── AFFICHAGE DYNAMIQUE SELON L'ÉTAT (isBooking) ────────────────────────── */}
          {!isBooking ? (
            /* ── VUE INITIALE : Détails complets (Idem à la maquette) ── */
            <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
              {/* Nom de la Chambre */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: -0.3,
                }}
              >
                {roomName}
              </Text>

              {/* Localisation / Hôtel Parent */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 6,
                  marginBottom: 18,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#6b7280"
                  style={{ marginRight: 6 }}
                />
                <Text style={{ fontSize: 13, color: '#4b5563', fontWeight: '500' }}>
                  {location}
                </Text>
              </View>

              {/* ── À propos ── */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: 8,
                }}
              >
                A propos
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#4b5563',
                  lineHeight: 20,
                  fontWeight: '400',
                  marginBottom: 20,
                }}
              >
                Nichées au cœur de villas de style malagasy et du manoir, nos chambres, situées tout au long de la côte, proposent des lits jumeaux ou un lit king-size. Chaque chambre dispose d'un balcon privé. Elles peuvent accueillir soit 3 adultes, soit 2 adultes et 1 adolescent (ou 1 enfant).
              </Text>

              {/* ── Details ── */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: 10,
                }}
              >
                Details
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 22,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="bed-outline" size={24} color="#111827" />
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500', marginLeft: 8 }}>
                    Lits :  {beds}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="water-outline" size={24} color="#111827" />
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500', marginLeft: 8 }}>
                    SDB :  {bathrooms}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={24} color="#111827" />
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500', marginLeft: 8 }}>
                    Pers :  {persons}
                  </Text>
                </View>
              </View>

              {/* ── Équipements ── */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: 14,
                }}
              >
                Équipements
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: 'wifi-outline', label: 'Wi-Fi haut débit' },
                  { icon: 'restaurant-outline', label: 'Cuisine équipée' },
                  { icon: 'tv-outline', label: 'Télévision 4K' },
                  { icon: 'barbell-outline', label: 'Salle de sport' },
                  { icon: 'snow-outline', label: 'Climatisation' },
                  { icon: 'shirt-outline', label: 'Lave-linge' },
                  { icon: 'water-outline', label: 'Piscine privée' },
                  { icon: 'shield-checkmark-outline', label: 'Détecteur de fumée' },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: '50%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Ionicons name={item.icon as any} size={22} color="#4b5563" />
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#4b5563',
                        fontWeight: '500',
                        marginLeft: 10,
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            /* ── VUE DE RÉSERVATION (Conforme à la Maquette) ── */
            <View style={{ paddingTop: 20 }}>
              {/* En-tête : Prix + Badge Réduction */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 18,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>
                    {cleanPrice}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600', marginLeft: 2 }}>
                    /nuit
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#01BDA5',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                    Offre 20%
                  </Text>
                </View>
              </View>

              {/* Séparateur */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 18, marginTop: 14, marginBottom: 18 }} />

              {/* Section Dates & Voyageurs */}
              <View style={{ paddingHorizontal: 18, gap: 16 }}>
                {/* Check In */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Check In</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={20} color="#111827" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '600' }}>01/01/2026</Text>
                  </View>
                </View>

                {/* Check Out */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Check Out</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={20} color="#111827" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '600' }}>03/01/2026</Text>
                  </View>
                </View>

                {/* Nombre de voyageurs */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Nombre de voyageurs</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people-outline" size={20} color="#111827" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '600' }}>2 personnes</Text>
                  </View>
                </View>
              </View>

              {/* Séparateur */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 18, marginTop: 18, marginBottom: 18 }} />

              {/* Section Tarification */}
              <View style={{ paddingHorizontal: 18, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Sejour</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}>675.000ar</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Frais de services</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}>0ar</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Reduction</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}>135.000ar</Text>
                </View>
              </View>

              {/* Séparateur */}
              <View style={{ height: 1, backgroundColor: '#cbd5e1', marginHorizontal: 18, marginTop: 18, marginBottom: 24 }} />

              {/* Total */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 18,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937' }}>Total</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>540.000ar</Text>
              </View>
            </View>
          )}
        </ScrollView>

      {/* ── BARRE DE RÉSERVATION DYNAMIQUE EN BAS ────────────────────────── */}
      {!isBooking ? (
        /* Barre standard pour la vue initiale */
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827' }}>
                {cleanPrice}
              </Text>
              <Text style={{ fontSize: 12, color: '#111827', fontWeight: '700' }}>/Nuit</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500', marginTop: 2 }}>
              11 - 12 Mai
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setIsBooking(true);
            }}
            style={{
              backgroundColor: '#01BDA5',
              paddingVertical: 12,
              paddingHorizontal: 36,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#01BDA5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>
              Reserver
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Grand Bouton Réserver pour la vue de validation conforme à la maquette */
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              console.log('Réservation validée !');
            }}
            style={{
              backgroundColor: '#01BDA5',
              paddingVertical: 15,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#01BDA5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
              width: '100%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
              Reserver
            </Text>
          </TouchableOpacity>
        </View>
      )}
      </Animated.View>
    </SafeAreaView>
  );
}

