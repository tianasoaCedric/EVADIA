import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.45);

export default function DetailOffersScreen() {
  const params = useLocalSearchParams();
  
  const imageUri = (params.imageUri as string) || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600';
  const badgeText = (params.badgeText as string) || 'Offres -20% du 01 au 05 Nov';
  const titleBold = (params.titleBold as string) || 'Ylang';
  const titleNormal = (params.titleNormal as string) || 'Nosy Be';
  const description = (params.description as string) || 'Profitez de l\'offre exclusive : la côte vous appelle.';

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="light" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        style={{ flex: 1 }}
      >
        {/* ── IMAGE DE COUVERTURE AVEC BOUTONS RETOUR/PARTAGE ────────────────────────── */}
        <View
          style={{
            width: screenWidth,
            height: IMAGE_HEIGHT,
            backgroundColor: '#e5e7eb',
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />

          {/* Bouton retour ← en haut à gauche */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 52 : 40,
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
              color="#ffffff"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.35)',
                textShadowOffset: { width: 0, height: 1.5 },
                textShadowRadius: 4,
              }}
            />
          </TouchableOpacity>

          {/* Bouton Partager en haut à droite */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => console.log('Partager offre')}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 52 : 40,
              right: 18,
              zIndex: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="share-social"
              size={26}
              color="#ffffff"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.35)',
                textShadowOffset: { width: 0, height: 1.5 },
                textShadowRadius: 4,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* ── CONTENU DES EXPLICATIONS ET INFOS DE L'OFFRE ────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          
          {/* Badge turquoise capsule */}
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#01BDA5',
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 7,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>
              {badgeText}
            </Text>
          </View>

          {/* Titre de l'hébergement */}
          <Text style={{ fontSize: 18, color: '#111827', marginBottom: 8 }}>
            <Text style={{ fontWeight: '800' }}>{titleBold}</Text>
            {titleNormal ? `, ${titleNormal}` : ''}
          </Text>

          {/* Description principale */}
          <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500', lineHeight: 20, marginBottom: 28 }}>
            {description}
          </Text>

          {/* Section Services inclus */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
            Services inclus
          </Text>
          <View style={{ marginBottom: 24 }}>
            {[
              'Pétit déjeuner buffet',
              'Forfait All-Inclusive pendant tout le séjour',
              'Transfert gratuit de l\'aéroport à l\'hôtel',
              'Accès à toutes les activités de l\'hôtel'
            ].map((item, index) => (
              <View key={`service-${index}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingLeft: 6 }}>
                <Text style={{ fontSize: 14, color: '#4b5563', marginRight: 8, lineHeight: 18 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', lineHeight: 18, flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Section Informations supplémentaires */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
            Informations supplémentaires
          </Text>
          <View style={{ marginBottom: 10 }}>
            {[
              'Offre valable uniquement sur réservation',
              'Annulation du réservation non remboursable'
            ].map((item, index) => (
              <View key={`info-${index}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingLeft: 6 }}>
                <Text style={{ fontSize: 14, color: '#4b5563', marginRight: 8, lineHeight: 18 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', lineHeight: 18, flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* ── BOUTON FLOTTANT FIXE DE RÉSERVATION EN BAS ────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: '#01BDA5',
            borderRadius: 100,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#01BDA5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={() => console.log('Action reserver offre')}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
            Reserver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
