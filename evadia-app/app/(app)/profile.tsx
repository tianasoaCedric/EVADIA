import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfilePage() {
  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        style={{ flex: 1 }}
      >
        {/* ── SECTION UTILISATEUR (Avatar + Infos) ────────────────────────── */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {/* Avatar Placeholder */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Ionicons name="person" size={54} color="#e5e7eb" />
          </View>

          {/* Nom d'utilisateur */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#111827',
              marginTop: 16,
            }}
          >
            Nantenaina
          </Text>

          {/* Email */}
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              fontWeight: '500',
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            nantenkf@gmail.com
          </Text>

          {/* Bouton Modifier le profil */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor: '#01BDA5',
              borderRadius: 100,
              paddingHorizontal: 22,
              paddingVertical: 10,
              shadowColor: '#01BDA5',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 2,
            }}
            onPress={() => console.log('Modifier le profil')}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              Modifier le profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── GROUPE : PAIEMENT ────────────────────────── */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
            Paiement
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
            onPress={() => console.log('Informations de paiement')}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Informations de paiement
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* ── GROUPE : PARAMÈTRES ────────────────────────── */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
            Parametres
          </Text>
          
          {/* Devise */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Devise
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              Ariary
            </Text>
          </View>

          {/* Langage */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Langage
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              Francais
            </Text>
          </View>

          {/* Notifications */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Notifications
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              Desactiver
            </Text>
          </View>
        </View>

        {/* ── GROUPE : SUPPORT ────────────────────────── */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
            Support
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          onPress={() => router.push('/contact')}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Contact
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* ── GROUPE : APPLICATION ────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
            Application
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Version
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              V1.00
            </Text>
          </View>
        </View>

        {/* ── BOUTON SE DÉCONNECTER ────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: '#ff4d4d',
            borderRadius: 100,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#ff4d4d',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
            Se Deconnecter
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}