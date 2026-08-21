import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clientService, Reservation } from '../../services/client';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statutColor(statut: Reservation['statut']): string {
  if (statut === 'acceptee' || statut === 'terminee') return '#01BDA5';
  if (statut === 'refusee' || statut === 'annulee') return '#ef4444';
  return '#f59e0b';
}

export default function ReservationsScreen() {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getReservations();
      setReservations(data);
    } catch (e: any) {
      setError(e?.message ?? t('Reservations.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>{t('Reservations.title')}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="cloud-offline-outline" size={52} color="#e5e7eb" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            onPress={load}
            style={{ marginTop: 16, backgroundColor: '#01BDA5', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100 }}
          >
            <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold' }}>{t('Common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : reservations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="calendar-outline" size={52} color="#e5e7eb" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>
            {t('Reservations.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/(app)/reservation-detail', params: { id: String(item.id) } })}
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#f3f4f6',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 15, fontFamily: 'Outfit_700Bold', color: '#111827' }}>
                    {item.propriete?.hotel?.nom ?? item.hotel?.nom ?? t('Reservations.default_name')}
                  </Text>
                  {item.propriete?.nom && (
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.propriete.nom}</Text>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor: statutColor(item.statut),
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 100,
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#fff' }}>
                    {t(`Reservations.statut_${item.statut}`)}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                {formatDate(item.date_debut)} — {formatDate(item.date_fin)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 15, fontFamily: 'Outfit_800ExtraBold', color: '#01BDA5' }}>
                  {(item.prix_total ?? 0).toLocaleString('fr-FR')} MGA
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
