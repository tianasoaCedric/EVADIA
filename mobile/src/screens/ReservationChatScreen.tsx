import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AppText from "../components/atoms/AppText";
import Input from "../components/atoms/Input";
import { useAuth } from "../context/AuthContext";
import { chatboxApi } from "../lib/chatbox";
import { useReverbEcho } from "../hooks/useReverbEcho";
import type { ReservationMessage } from "../lib/types";
import type { ProfileStackParamList } from "../navigation/types";
import { colors } from "../lib/tokens";

type Route = RouteProp<ProfileStackParamList, "ReservationChat">;
type Nav = NativeStackNavigationProp<ProfileStackParamList, "ReservationChat">;

// Filet de sécurité si le WebSocket n'est pas connecté
const POLL_FALLBACK_INTERVAL_MS = 15000;

export default function ReservationChatScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { reservationId } = route.params;
  const { state } = useAuth();
  const userId = state.status === "authenticated" ? state.user.id : null;

  const [messages, setMessages] = useState<ReservationMessage[]>([]);
  const [chatFerme, setChatFerme] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const echo = useReverbEcho(!!userId);

  const loadMessages = useCallback(async () => {
    const res = await chatboxApi.messages(reservationId);
    setMessages(res.data);
    setChatFerme(res.chat_ferme);
  }, [reservationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!userId) return;

    if (echo) {
      const channel = echo.private(`messages.${userId}`);
      const handler = () => loadMessages();
      channel.listen(".message.sent", handler);
      return () => {
        channel.stopListening(".message.sent", handler);
        echo.leave(`messages.${userId}`);
      };
    }

    const interval = setInterval(loadMessages, POLL_FALLBACK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [echo, userId, loadMessages]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await chatboxApi.send(reservationId, input.trim());
      setInput("");
      await loadMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleChoixPaiement = async (code: string) => {
    await chatboxApi.choisirPaiement(reservationId, code);
    await loadMessages();
  };

  const dejaChoisiPaiement = messages.some(
    (m) => m.type === "choix_paiement" && m.expediteur_id === userId
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.neutral[700]} />
        </TouchableOpacity>
        <AppText variant="body" weight="semibold">Messagerie</AppText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.expediteur_id === userId}
              onChoixPaiement={handleChoixPaiement}
              disabled={chatFerme || dejaChoisiPaiement}
            />
          )}
        />

        {chatFerme ? (
          <View className="p-4 items-center border-t border-neutral-100">
            <AppText variant="caption" className="text-neutral-400">
              Cette conversation est clôturée.
            </AppText>
          </View>
        ) : (
          <View className="flex-row items-end gap-2 p-3 border-t border-neutral-100">
            <View className="flex-1">
              <Input
                value={input}
                onChangeText={setInput}
                placeholder="Votre message..."
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSending || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary.DEFAULT,
                alignItems: "center",
                justifyContent: "center",
                opacity: isSending || !input.trim() ? 0.5 : 1,
              }}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatBubble({
  message,
  isOwn,
  onChoixPaiement,
  disabled,
}: {
  message: ReservationMessage;
  isOwn: boolean;
  onChoixPaiement: (code: string) => void;
  disabled: boolean;
}) {
  if (message.type === "systeme") {
    return (
      <View className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3">
        <AppText variant="body-sm" className="text-neutral-700">{message.contenu}</AppText>
      </View>
    );
  }

  if (message.type === "choix_paiement" && message.metadata?.options) {
    return (
      <View className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 gap-2">
        <AppText variant="body-sm" className="text-neutral-700">{message.contenu}</AppText>
        <View className="flex-row flex-wrap gap-2">
          {message.metadata.options.map((opt) => (
            <TouchableOpacity
              key={opt.code}
              onPress={() => onChoixPaiement(opt.code)}
              disabled={disabled}
              style={{
                borderWidth: 1,
                borderColor: colors.primary.DEFAULT,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                opacity: disabled ? 0.4 : 1,
              }}
            >
              <AppText variant="caption" style={{ color: colors.primary.DEFAULT }}>
                {opt.libelle}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ alignItems: isOwn ? "flex-end" : "flex-start" }}>
      <View
        style={{
          maxWidth: "75%",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: isOwn ? colors.primary.DEFAULT : colors.neutral[100],
        }}
      >
        <AppText variant="body-sm" style={{ color: isOwn ? "#fff" : "#1F2937" }}>
          {message.contenu}
        </AppText>
      </View>
    </View>
  );
}
