import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.35);

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    console.log('Sending message:', { name, email, message });
    // Action d'envoi du message...
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ flex: 1 }}
      >
        {/* ── IMAGE D'EN-TÊTE AVEC BOUTON RETOUR ────────────────────────── */}
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
            source={{ uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800' }}
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
        </View>

        {/* ── CONTENU DU FORMULAIRE ────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Titre */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 8,
            }}
          >
            Contactez-nous !
          </Text>

          {/* Description */}
          <Text
            style={{
              fontSize: 14,
              color: '#4b5563',
              fontWeight: '500',
              lineHeight: 20,
              marginBottom: 20,
            }}
          >
            Nous serons ravis d’échanger avec vous ! Laissez-nous un message via le formulaire, et nous vous répondrons dans les plus brefs délais.
          </Text>

          {/* Saisie : Nom */}
          <TextInput
            placeholder="Votre Nom"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 100,
              height: 52,
              paddingHorizontal: 20,
              fontSize: 15,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}
          />

          {/* Saisie : Email */}
          <TextInput
            placeholder="Votre adresse Email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 100,
              height: 52,
              paddingHorizontal: 20,
              fontSize: 15,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}
          />

          {/* Saisie : Message */}
          <TextInput
            placeholder="Votre Message"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            value={message}
            onChangeText={setMessage}
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 24,
              height: 160,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 16,
              fontSize: 15,
              fontWeight: '600',
              color: '#1f2937',
              textAlignVertical: 'top',
              marginBottom: 20,
            }}
          />

          {/* Bouton Envoyer Message */}
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
              marginBottom: 24,
            }}
            onPress={handleSendMessage}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
              Envoyez Message
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── BARRE DE SÉPARATION FINALE ET INFOS DE CONTACT ────────────────────────── */}
        <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', marginHorizontal: 24, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Infos de contact textuelles */}
          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 2 }}>
              + 261 34 00 000 00
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#6b7280' }}>
              adressemail@gmail.com
            </Text>
          </View>

          {/* Logos des réseaux sociaux */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <TouchableOpacity onPress={() => console.log('Facebook')} activeOpacity={0.7}>
              <Ionicons name="logo-facebook" size={20} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('LinkedIn')} activeOpacity={0.7}>
              <Ionicons name="logo-linkedin" size={20} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Instagram')} activeOpacity={0.7}>
              <Ionicons name="logo-instagram" size={20} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('TikTok')} activeOpacity={0.7}>
              <Ionicons name="logo-tiktok" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
