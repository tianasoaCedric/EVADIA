import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/atoms/Button';
import { Divider } from '../../components/atoms/Divider';
import { LoginForm } from '../../components/molecules/LoginForm';


const oceanBg = require('../../assets/ocean.jpg');
const evadiaLogo = require('../../assets/evadia.png');
const googleIcon = require('../../assets/google-icon.png');

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleLogin = (data: any) => {
    console.log('Connexion:', data);
    router.replace('/(app)/home');
  };

  const handleGoogleLogin = () => {
    console.log('Connexion avec Google');
    router.push('/(app)/home');
  };

  const handleContinueWithEmail = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowEmailForm(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBackToOptions = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowEmailForm(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <ImageBackground
      source={oceanBg}
      className="flex-1"
      imageStyle={{ resizeMode: 'cover' }}
    >
      <View className="absolute inset-0 bg-black/25" />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim, flex: 1, width: '100%' }}>
              {showEmailForm ? (
                /* ÉCRAN FORMULAIRE (SANS CARTE BLANCHE, DIRECTEMENT SUR LE FOND) */
                <View className="flex-1 justify-center items-center px-6 pt-6 pb-20">
                  {/* Flèche de retour en haut à gauche */}
                  <TouchableOpacity
                    onPress={handleBackToOptions}
                    className="absolute top-4 left-6 flex-row items-center gap-1.5"
                    style={{ zIndex: 10 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text className="text-white text-base font-semibold">Retour</Text>
                  </TouchableOpacity>

                  {/* Logo et Slogan */}
                  <View className="items-center mb-8 mt-4">
                    <Image
                      source={evadiaLogo}
                      className="w-60 h-28"
                      resizeMode="contain"
                    />
                    <Text className="text-white text-center text-base mt-2 font-semibold tracking-wide" style={{ textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
                      Trouvez l'Hôtel parfait pour vous !
                    </Text>
                  </View>

                  {/* Titre */}
                  <Text className="text-3xl font-bold text-center text-white mb-6">
                    Connexion
                  </Text>

                  {/* Formulaire sombre */}
                  <LoginForm onSubmit={handleLogin} theme="dark" />

                  {/* Footer d'inscription */}
                  <View className="flex-row justify-center mt-6">
                    <Text className="text-white/80">Vous n'avez pas encore de compte ? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                      <Text className="text-white font-semibold">S'inscrire</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* ÉCRAN CHOIX (AVEC CARTE BLANCHE EN BAS) */
                <View className="flex-1 justify-between">
                  {/* Logo et Slogan en haut */}
                  <View className="items-center mt-10 flex-1 justify-center">
                    <Image
                      source={evadiaLogo}
                      className="w-64 h-32"
                      resizeMode="contain"
                    />
                    <Text
                      className="text-white text-lg mt-2 font-semibold text-center tracking-wide"
                      style={{
                        textShadowColor: 'rgba(0, 0, 0, 0.4)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 3
                      }}
                    >
                      Trouvez l'Hôtel parfait pour vous !
                    </Text>
                  </View>

                  {/* Carte blanche flottante au bas */}
                  <View
                    style={{
                      width: 385,
                      borderRadius: 30,
                      backgroundColor: '#fff',
                      paddingTop: 32,
                      paddingBottom: 24,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.2,
                      shadowRadius: 15,
                      elevation: 10,
                      alignSelf: 'center',
                      marginBottom: Platform.OS === 'ios' ? 35 : 45,
                    }}
                  >
                    <View style={{ width: 353, alignItems: 'center' }}>
                      {/* Bouton Continuer avec Email */}
                      <Button
                        title="Continuer avec votre Email"
                        onPress={handleContinueWithEmail}
                        variant="primary"
                      />

                      {/* Séparateur */}
                      <View style={{ width: '100%' }}>
                        <Divider text="ou" />
                      </View>

                      {/* Icône Google */}
                      <TouchableOpacity
                        onPress={handleGoogleLogin}
                        className="items-center justify-center"
                      >
                        <Image
                          source={googleIcon}
                          className="w-16 h-16"
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Footer de la carte */}
                    <View className="flex-row justify-center mt-6">
                      <Text className="text-gray-600 text-sm">Vous n'avez pas de compte ? </Text>
                      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text className="text-gray-800 font-bold text-sm">S'inscrire</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}