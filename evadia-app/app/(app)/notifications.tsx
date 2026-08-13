import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { notificationService, AppNotification } from '../../services/notifications';

function timeAgo(dateStr: string, t: (key: string, opts?: any) => string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t('Notifications.timeAgoJustNow');
  if (minutes < 60) return t('Notifications.timeAgoMinutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('Notifications.timeAgoHours', { count: hours });
  const days = Math.floor(hours / 24);
  return t('Notifications.timeAgoDays', { count: days });
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (e: any) {
      setError(e?.message ?? t('Notifications.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handlePress = async (item: AppNotification) => {
    if (!item.lu) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: true } : n)));
      try {
        await notificationService.markRead(item.id);
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await notificationService.markAllRead();
    } catch {}
  };

  const hasUnread = notifications.some((n) => !n.lu);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>{t('Notifications.title')}</Text>
        </View>
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#01BDA5' }}>{t('Notifications.mark_all_read')}</Text>
          </TouchableOpacity>
        )}
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
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="notifications-off-outline" size={52} color="#e5e7eb" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>
            {t('Notifications.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handlePress(item)}
              style={{
                flexDirection: 'row',
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
                backgroundColor: item.lu ? '#fff' : 'rgba(1,189,165,0.06)',
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: item.lu ? 'transparent' : '#01BDA5',
                  marginTop: 6,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#111827' }}>{item.titre}</Text>
                <Text style={{ fontSize: 13, color: '#4b5563', marginTop: 4, lineHeight: 18 }}>{item.contenu}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{timeAgo(item.date_envoi, t)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
