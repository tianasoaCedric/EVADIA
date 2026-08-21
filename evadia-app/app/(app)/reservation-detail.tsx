import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { clientService, Reservation, ReservationMessage } from '../../services/client';

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

function isChatDisabledByStatut(statut: Reservation['statut']): boolean {
  return statut === 'annulee' || statut === 'refusee' || statut === 'terminee';
}

export default function ReservationDetailScreen() {
  const { t } = useTranslation();
  const { state } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservationId = Number(id);
  const currentUserId = state.status === 'authenticated' ? state.user.id : null;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ReservationMessage[]>([]);
  const [chatFerme, setChatFerme] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [choosingPayment, setChoosingPayment] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getReservation(reservationId);
      setReservation(data);
    } catch (e: any) {
      setError(e?.message ?? t('Reservations.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [reservationId])
  );

  const loadMessages = async () => {
    setChatLoading(true);
    try {
      const res = await clientService.getReservationMessages(reservationId);
      setMessages(res.data);
      setChatFerme(res.chat_ferme);
    } catch {
      // silencieux, l'utilisateur peut réessayer en rouvrant
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenChat = () => {
    setShowChat(true);
    loadMessages();
  };

  const handleSend = async () => {
    const contenu = draft.trim();
    if (!contenu || sending || chatFerme || isChatDisabledByStatut(reservation!.statut)) return;
    setSending(true);
    try {
      const message = await clientService.sendReservationMessage(reservationId, contenu);
      setMessages((prev) => [...prev, message]);
      setDraft('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert(t('Reservations.messages_error_title'), e?.data?.message ?? e?.message ?? t('Common.error_generic'));
    } finally {
      setSending(false);
    }
  };

  const handleChoixPaiement = async (modePaiement: "mobile_money" | "carte_bancaire" | "especes_arrivee") => {
    if (choosingPayment) return;
    setChoosingPayment(true);
    try {
      const message = await clientService.choisirPaiement(reservationId, modePaiement);
      setMessages((prev) => [...prev, message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert(t('Reservations.messages_error_title'), e?.data?.message ?? e?.message ?? t('Common.error_generic'));
    } finally {
      setChoosingPayment(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(t('Reservations.cancel_confirm_title'), t('Reservations.cancel_confirm_message'), [
      { text: t('Common.cancel'), style: 'cancel' },
      {
        text: t('Reservations.cancel_confirm_action'),
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await clientService.cancelReservation(reservationId);
            await load();
          } catch (e: any) {
            Alert.alert(t('Reservations.cancel_error_title'), e?.data?.message ?? e?.message ?? t('Common.error_generic'));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !reservation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="cloud-offline-outline" size={52} color="#e5e7eb" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>
            {error ?? t('Reservations.load_error')}
          </Text>
          <TouchableOpacity
            onPress={load}
            style={{ marginTop: 16, backgroundColor: '#01BDA5', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100 }}
          >
            <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold' }}>{t('Common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showChat) {
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
          <TouchableOpacity onPress={() => setShowChat(false)} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>
            {reservation.propriete?.hotel?.nom ?? reservation.hotel?.nom ?? t('Reservations.messages_title')}
          </Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {chatLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#01BDA5" />
            </View>
          ) : messages.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
              <Ionicons name="chatbubble-ellipses-outline" size={52} color="#e5e7eb" />
              <Text style={{ color: '#9ca3af', marginTop: 12, fontFamily: 'Outfit_600SemiBold', textAlign: 'center' }}>
                {t('Reservations.messages_empty')}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: 18 }}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              renderItem={({ item, index }) => {
                const isMine = item.expediteur_id === currentUserId;
                const paymentOptions: { code: string; libelle: string }[] | undefined =
                  item.type === 'choix_paiement' ? item.metadata?.options : undefined;
                const alreadyAnswered =
                  !!paymentOptions &&
                  messages
                    .slice(index + 1)
                    .some((m) => m.type === 'choix_paiement' && m.metadata?.mode_paiement);
                return (
                  <View
                    style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      backgroundColor: isMine ? '#01BDA5' : '#f3f4f6',
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      marginBottom: 10,
                      maxWidth: '80%',
                    }}
                  >
                    <Text style={{ color: isMine ? '#fff' : '#111827', fontSize: 14, lineHeight: 19 }}>{item.contenu}</Text>
                    {paymentOptions && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                        {paymentOptions.map((opt) => (
                          <TouchableOpacity
                            key={opt.code}
                            activeOpacity={0.7}
                            disabled={alreadyAnswered || chatFerme || choosingPayment}
                            onPress={() => handleChoixPaiement(opt.code as any)}
                            style={{
                              borderWidth: 1.5,
                              borderColor: alreadyAnswered ? '#d1d5db' : '#01BDA5',
                              borderRadius: 100,
                              paddingHorizontal: 14,
                              paddingVertical: 7,
                              opacity: alreadyAnswered ? 0.5 : 1,
                            }}
                          >
                            <Text
                              style={{
                                color: alreadyAnswered ? '#9ca3af' : '#01BDA5',
                                fontSize: 12,
                                fontFamily: 'Outfit_700Bold',
                              }}
                            >
                              {opt.libelle}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    <Text
                      style={{
                        color: isMine ? 'rgba(255,255,255,0.75)' : '#9ca3af',
                        fontSize: 10,
                        marginTop: 4,
                        alignSelf: 'flex-end',
                      }}
                    >
                      {new Date(item.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }}
            />
          )}

          {chatFerme || isChatDisabledByStatut(reservation.statut) ? (
            <View style={{ padding: 18, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
              <Text style={{ color: '#9ca3af', textAlign: 'center', fontFamily: 'Outfit_600SemiBold' }}>
                {t('Reservations.messages_closed')}
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: '#f3f4f6',
              }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('Reservations.messages_placeholder')}
                placeholderTextColor="#9ca3af"
                multiline
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: '#111827',
                  maxHeight: 100,
                  marginRight: 10,
                }}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={sending || !draft.trim()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: draft.trim() ? '#01BDA5' : '#e5e7eb',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
        <Text style={{ fontSize: 18, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>{t('Reservations.detail_title')}</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Outfit_800ExtraBold', color: '#111827' }}>
              {reservation.propriete?.hotel?.nom ?? reservation.hotel?.nom ?? t('Reservations.default_name')}
            </Text>
            {reservation.propriete?.nom && (
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{reservation.propriete.nom}</Text>
            )}
          </View>
          <View
            style={{
              backgroundColor: statutColor(reservation.statut),
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 100,
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#fff' }}>
              {t(`Reservations.statut_${reservation.statut}`)}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#6b7280', fontFamily: 'Outfit_600SemiBold' }}>{t('Reservations.check_in')}</Text>
            <Text style={{ color: '#111827', fontFamily: 'Outfit_700Bold' }}>{formatDate(reservation.date_debut)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#6b7280', fontFamily: 'Outfit_600SemiBold' }}>{t('Reservations.check_out')}</Text>
            <Text style={{ color: '#111827', fontFamily: 'Outfit_700Bold' }}>{formatDate(reservation.date_fin)}</Text>
          </View>
          {reservation.nb_adultes != null && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#6b7280', fontFamily: 'Outfit_600SemiBold' }}>{t('Reservations.guests')}</Text>
              <Text style={{ color: '#111827', fontFamily: 'Outfit_700Bold' }}>{reservation.nb_adultes}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6b7280', fontFamily: 'Outfit_600SemiBold' }}>{t('Reservations.total')}</Text>
            <Text style={{ color: '#01BDA5', fontFamily: 'Outfit_800ExtraBold', fontSize: 16 }}>
              {(reservation.prix_total ?? 0).toLocaleString('fr-FR')} MGA
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenChat}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#01BDA5',
            borderRadius: 100,
            height: 52,
            marginTop: 24,
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Outfit_700Bold' }}>{t('Reservations.open_messages')}</Text>
        </TouchableOpacity>

        {reservation.statut !== 'annulee' && reservation.statut !== 'refusee' && reservation.statut !== 'terminee' && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCancel}
            disabled={cancelling}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 100,
              height: 52,
              marginTop: 12,
              borderWidth: 1.5,
              borderColor: '#ef4444',
            }}
          >
            {cancelling ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text style={{ color: '#ef4444', fontSize: 15, fontFamily: 'Outfit_700Bold' }}>{t('Reservations.cancel_button')}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
