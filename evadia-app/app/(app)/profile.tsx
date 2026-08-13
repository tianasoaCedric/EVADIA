import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clientService, ClientProfile } from '../../services/client';
import { useAuth } from '../../context/AuthContext';
import { useDevise } from '../../context/DeviseContext';
import { setLanguage } from '../../lib/i18n';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { state, logout } = useAuth();
  const { devise, setDevise } = useDevise();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const authUser = state.status === 'authenticated' ? state.user : null;

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      clientService.getProfile()
        .then((data: any) => {
          const p = data?.data ?? data;
          setProfile(p);
        })
        .catch(() => {
          // profil non chargé — on affiche les données de l'AuthContext comme fallback
        })
        .finally(() => setLoading(false));
    }, [])
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleToggleLanguage = () => {
    setLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  const nom = profile?.nom ?? authUser?.nom ?? '';
  const prenom = profile?.prenom ?? authUser?.prenom ?? '';
  const displayName = prenom || nom
    ? `${prenom} ${nom}`.trim()
    : (profile?.name ?? authUser?.name ?? '—');
  const displayEmail = profile?.email ?? authUser?.email ?? '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        style={{ flex: 1 }}
      >
        {/* Avatar + Infos */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', elevation: 1 }}>
            <Ionicons name="person" size={54} color="#e5e7eb" />
          </View>

          {loading ? (
            <ActivityIndicator color="#01BDA5" style={{ marginTop: 16 }} />
          ) : (
            <>
              <Text style={{ fontSize: 22, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginTop: 16 }}>
                {displayName}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', fontFamily: 'Outfit_500Medium', marginTop: 4, marginBottom: 16 }}>
                {displayEmail}
              </Text>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={{ backgroundColor: '#01BDA5', borderRadius: 100, paddingHorizontal: 22, paddingVertical: 10, elevation: 2 }}
            onPress={() => {}}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: 'Outfit_700Bold' }}>
              {t('Profile.edit_profile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Paiement */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginBottom: 8 }}>{t('Profile.payment')}</Text>
          <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#374151' }}>{t('Profile.payment_info')}</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Parametres */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginBottom: 8 }}>{t('Profile.settings')}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDevise(devise === 'MGA' ? 'EUR' : 'MGA')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 }}
          >
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#374151' }}>{t('Profile.currency')}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#6b7280' }}>
              {devise === 'MGA' ? 'Ariary' : 'Euro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleLanguage}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 }}
          >
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#374151' }}>{t('Profile.language')}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#6b7280' }}>
              {i18n.language === 'fr' ? 'Français' : 'English'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#374151' }}>{t('Profile.notifications')}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#6b7280' }}>{t('Profile.notifications_off')}</Text>
          </View>
        </View>

        {/* Support */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginBottom: 8 }}>{t('Profile.support')}</Text>
          <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }} onPress={() => router.push('/contact')}>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#374151' }}>{t('Profile.contact')}</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Application */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Outfit_800ExtraBold', color: '#111827', marginBottom: 8 }}>{t('Profile.application')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#374151' }}>{t('Profile.version')}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: '#6b7280' }}>V1.00</Text>
          </View>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ backgroundColor: '#ff4d4d', borderRadius: 100, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 3 }}
          onPress={handleLogout}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'Outfit_700Bold' }}>{t('Profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
