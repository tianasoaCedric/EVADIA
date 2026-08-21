import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  BackHandler,
  Modal,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { clientService } from '../../services/client';
import { useDevise } from '../../context/DeviseContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.42);

export default function ProprieterDetailScreen() {
  const { t } = useTranslation();
  const { symbole } = useDevise();
  const params = useLocalSearchParams();
  const roomId = params.id ? Number(params.id) : null;
  const roomName = (params.name as string) || t('ProprieterDetail.default_room_name');
  const roomPrice = (params.price as string) || '225.000Ariary/nuit';
  const roomDescription = (params.description as string) || '';
  const roomImage = (params.imageUri as string) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800';
  const beds = parseInt((params.beds as string) || '2');
  const bathrooms = parseInt((params.bathrooms as string) || '1');
  const persons = parseInt((params.persons as string) || '2');
  const location = (params.location as string) || 'Madagascar';
  const hotelName = (params.hotelName as string) || '';
  const hotelRating = (params.hotelRating as string) || '4.5';
  const hotelImageUris = (params.hotelImageUris as string) || '';
  const [submitting, setSubmitting] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  const imageUris = [roomImage];

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

  // Parser le prix numérique pour le calcul dynamique
  const numericPricePerNight = parseInt(rawPriceText.replace(/[^0-9]/g, ''), 10) || 225000;

  // États pour les dates de réservation
  const [checkInDate, setCheckInDate] = useState<Date>(new Date(2026, 0, 1));
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(2026, 0, 3));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePickerType, setActivePickerType] = useState<'in' | 'out'>('in');
  const [calendarMonth, setCalendarMonth] = useState(0); // 0 = Janvier
  const [calendarYear, setCalendarYear] = useState(2026);

  const MONTH_NAMES = [
    t('ProprieterDetail.month_january'), t('ProprieterDetail.month_february'), t('ProprieterDetail.month_march'),
    t('ProprieterDetail.month_april'), t('ProprieterDetail.month_may'), t('ProprieterDetail.month_june'),
    t('ProprieterDetail.month_july'), t('ProprieterDetail.month_august'), t('ProprieterDetail.month_september'),
    t('ProprieterDetail.month_october'), t('ProprieterDetail.month_november'), t('ProprieterDetail.month_december')
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajuster pour Lundi = 0
  };

  const openDatePicker = (type: 'in' | 'out') => {
    setActivePickerType(type);
    const dateToUse = type === 'in' ? checkInDate : checkOutDate;
    setCalendarMonth(dateToUse.getMonth());
    setCalendarYear(dateToUse.getFullYear());
    setShowDatePicker(true);
  };

  const selectDay = (day: number) => {
    const selected = new Date(calendarYear, calendarMonth, day);
    if (activePickerType === 'in') {
      setCheckInDate(selected);
      if (selected >= checkOutDate) {
        const nextDay = new Date(selected);
        nextDay.setDate(selected.getDate() + 1);
        setCheckOutDate(nextDay);
      }
    } else {
      if (selected <= checkInDate) {
        const prevDay = new Date(selected);
        prevDay.setDate(selected.getDate() - 1);
        setCheckInDate(prevDay);
      }
      setCheckOutDate(selected);
    }
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatDateRangeShort = (inDate: Date, outDate: Date) => {
    const inDay = inDate.getDate();
    const outDay = outDate.getDate();
    const inMonthName = MONTH_NAMES[inDate.getMonth()].substring(0, 4) + '.';
    const outMonthName = MONTH_NAMES[outDate.getMonth()].substring(0, 4) + '.';
    if (inDate.getMonth() === outDate.getMonth()) {
      return `${inDay} - ${outDay} ${inMonthName}`;
    }
    return `${inDay} ${inMonthName} - ${outDay} ${outMonthName}`;
  };

  // Calculs de séjour dynamiques
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const stayCost = numericPricePerNight * nights;
  const discountCost = Math.round(stayCost * 0.20); // Réduction de 20%
  const totalCost = stayCost - discountCost;

  const formatPrice = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + symbole;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={[]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        {/* ── Carrousel d'images de la chambre scrollable ────────────────────────── */}
        <View
          style={{
            width: screenWidth,
            height: IMAGE_HEIGHT,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
            zIndex: 10,
          }}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              overflow: 'hidden',
              backgroundColor: '#e5e7eb',
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
                  router.replace('/hotel-detail');
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
                  onPress={() => {}}
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
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          style={{ flex: 1 }}
        >

          {/* ── AFFICHAGE DYNAMIQUE SELON L'ÉTAT (isBooking) ────────────────────────── */}
          {!isBooking ? (
            /* ── VUE INITIALE : Détails complets (Idem à la maquette) ── */
            <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
              {/* Nom de la Chambre */}
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Outfit_700Bold',
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
                <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Outfit_500Medium' }}>
                  {location}
                </Text>
              </View>

              {/* ── À propos ── */}
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Outfit_700Bold',
                  color: '#111827',
                  marginBottom: 8,
                }}
              >
                {t('ProprieterDetail.about')}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#4b5563',
                  lineHeight: 20,
                  fontFamily: 'Outfit_400Regular',
                  marginBottom: 20,
                }}
              >
                {roomDescription || t('ProprieterDetail.default_description')}
              </Text>

              {/* ── Details ── */}
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Outfit_700Bold',
                  color: '#111827',
                  marginBottom: 10,
                }}
              >
                {t('ProprieterDetail.details')}
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
                  <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'Outfit_500Medium', marginLeft: 8 }}>
                    {t('ProprieterDetail.beds_label')} :  {beds}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="water-outline" size={24} color="#111827" />
                  <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'Outfit_500Medium', marginLeft: 8 }}>
                    {t('ProprieterDetail.bathrooms_label')} :  {bathrooms}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={24} color="#111827" />
                  <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'Outfit_500Medium', marginLeft: 8 }}>
                    {t('ProprieterDetail.persons_label')} :  {persons}
                  </Text>
                </View>
              </View>

              {/* ── Équipements ── */}
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Outfit_700Bold',
                  color: '#111827',
                  marginBottom: 14,
                }}
              >
                {t('ProprieterDetail.equipments')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: 'wifi-outline', label: t('ProprieterDetail.equip_wifi') },
                  { icon: 'restaurant-outline', label: t('ProprieterDetail.equip_kitchen') },
                  { icon: 'tv-outline', label: t('ProprieterDetail.equip_tv') },
                  { icon: 'barbell-outline', label: t('ProprieterDetail.equip_gym') },
                  { icon: 'snow-outline', label: t('ProprieterDetail.equip_ac') },
                  { icon: 'shirt-outline', label: t('ProprieterDetail.equip_washer') },
                  { icon: 'water-outline', label: t('ProprieterDetail.equip_private_pool') },
                  { icon: 'shield-checkmark-outline', label: t('ProprieterDetail.equip_smoke_detector') },
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
                        fontFamily: 'Outfit_500Medium',
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
                  <Text style={{ fontSize: 24, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>
                    {cleanPrice}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_600SemiBold', marginLeft: 2 }}>
                    {t('ProprieterDetail.per_night')}
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
                  <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Outfit_700Bold' }}>
                    {t('ProprieterDetail.offer_20')}
                  </Text>
                </View>
              </View>

              {/* Séparateur */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 18, marginTop: 14, marginBottom: 18 }} />

              {/* Section Dates & Voyageurs */}
              <View style={{ paddingHorizontal: 18, gap: 16 }}>
                {/* Check In */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_500Medium' }}>{t('ProprieterDetail.check_in')}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => openDatePicker('in')}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#01BDA5" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', fontFamily: 'Outfit_600SemiBold' }}>{formatDate(checkInDate)}</Text>
                  </TouchableOpacity>
                </View>

                {/* Check Out */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_500Medium' }}>{t('ProprieterDetail.check_out')}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => openDatePicker('out')}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#01BDA5" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', fontFamily: 'Outfit_600SemiBold' }}>{formatDate(checkOutDate)}</Text>
                  </TouchableOpacity>
                </View>

                {/* Nombre de voyageurs */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_500Medium' }}>{t('ProprieterDetail.travelers_count')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people-outline" size={20} color="#111827" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', fontFamily: 'Outfit_600SemiBold' }}>{t('ProprieterDetail.persons_count', { count: persons })}</Text>
                  </View>
                </View>
              </View>

              {/* Séparateur */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 18, marginTop: 18, marginBottom: 18 }} />

              {/* Section Tarification */}
              <View style={{ paddingHorizontal: 18, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_500Medium' }}>{t('ProprieterDetail.stay_nights', { count: nights })}</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'Outfit_600SemiBold' }}>{formatPrice(stayCost)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_500Medium' }}>{t('ProprieterDetail.service_fees')}</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'Outfit_600SemiBold' }}>0ar</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Outfit_500Medium' }}>{t('ProprieterDetail.discount_20')}</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'Outfit_600SemiBold' }}>{formatPrice(discountCost)}</Text>
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
                <Text style={{ fontSize: 15, fontFamily: 'Outfit_800ExtraBold', color: '#1f2937' }}>{t('ProprieterDetail.total')}</Text>
                <Text style={{ fontSize: 24, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>{formatPrice(totalCost)}</Text>
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
              <Text style={{ fontSize: 17, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>
                {cleanPrice}
              </Text>
              <Text style={{ fontSize: 12, color: '#111827', fontFamily: 'Outfit_700Bold' }}>{t('ProprieterDetail.per_night_short')}</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Outfit_500Medium', marginTop: 2 }}>
              {formatDateRangeShort(checkInDate, checkOutDate)}
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
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Outfit_800ExtraBold' }}>
              {t('ProprieterDetail.reserve')}
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
            disabled={submitting}
            onPress={async () => {
              if (!roomId) {
                Alert.alert(t('ProprieterDetail.error_title'), t('ProprieterDetail.room_not_found'));
                return;
              }
              setSubmitting(true);
              try {
                const toISO = (d: Date) => d.toISOString().split('T')[0];
                await clientService.createReservation({
                  propriete_id: roomId,
                  date_debut: toISO(checkInDate),
                  date_fin: toISO(checkOutDate),
                  nb_adultes: persons,
                });
                Alert.alert(t('ProprieterDetail.reservation_confirmed'), t('ProprieterDetail.reservation_confirmed_message'), [
                  { text: t('Contact.ok'), onPress: () => router.replace('/(app)/home') },
                ]);
              } catch (err: any) {
                const msg = err?.data?.message ?? err?.message ?? t('Common.error_generic');
                Alert.alert(t('ProprieterDetail.reservation_error_title'), msg);
              } finally {
                setSubmitting(false);
              }
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
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Outfit_800ExtraBold' }}>
              {t('ProprieterDetail.reserve')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── MODAL DATE PICKER ── */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: screenWidth - 40,
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            {/* Header Calendrier */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(calendarYear - 1);
                  } else {
                    setCalendarMonth(calendarMonth - 1);
                  }
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-back" size={24} color="#1f2937" />
              </TouchableOpacity>

              <Text style={{ fontSize: 16, fontFamily: 'Outfit_700Bold', color: '#1f2937' }}>
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(calendarYear + 1);
                  } else {
                    setCalendarMonth(calendarMonth + 1);
                  }
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-forward" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            {/* Jours de la semaine */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                <Text
                  key={idx}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 12,
                    fontFamily: 'Outfit_600SemiBold',
                    color: '#9ca3af',
                  }}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Grid des jours */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {/* Espaces vides pour le premier jour du mois */}
              {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, idx) => (
                <View key={`empty-${idx}`} style={{ width: `${100 / 7}%`, height: 40 }} />
              ))}

              {/* Jours du mois */}
              {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, idx) => {
                const dayNum = idx + 1;
                const currentGridDate = new Date(calendarYear, calendarMonth, dayNum);
                const isSelected = activePickerType === 'in' 
                  ? checkInDate.getDate() === dayNum && checkInDate.getMonth() === calendarMonth && checkInDate.getFullYear() === calendarYear
                  : checkOutDate.getDate() === dayNum && checkOutDate.getMonth() === calendarMonth && checkOutDate.getFullYear() === calendarYear;
                
                const isPast = currentGridDate < new Date(new Date().setHours(0, 0, 0, 0));
                const isDisabled = activePickerType === 'out' && currentGridDate <= checkInDate;

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    onPress={() => !isPast && !isDisabled && selectDay(dayNum)}
                    disabled={isPast || isDisabled}
                    style={{
                      width: `${100 / 7}%`,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 20,
                      backgroundColor: isSelected ? '#01BDA5' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: isSelected ? 'Outfit_700Bold' : 'Outfit_500Medium',
                        color: isSelected 
                          ? '#fff' 
                          : (isPast || isDisabled) 
                            ? '#d1d5db' 
                            : '#374151',
                      }}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bouton Annuler */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              style={{
                marginTop: 20,
                alignItems: 'center',
                paddingVertical: 10,
                backgroundColor: '#f3f4f6',
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#4b5563' }}>
                {t('Common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}

