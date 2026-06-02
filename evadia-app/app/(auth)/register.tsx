import { router } from 'expo-router';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterForm } from '../../components/molecules/RegisterForm';

const oceanBg = require('../../assets/ocean.jpg');
const evadiaLogo = require('../../assets/evadia.png');
const googleIcon = require('../../assets/google-icon.png');

export default function RegisterScreen() {
  const handleRegister = (data: any) => {
    console.log('Inscription:', data);
    router.push('/(auth)/login');
  };

  const handleGoogleLogin = () => {
    console.log('Connexion avec Google');
    router.push('/(app)/home');
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center pt-10 pb-8">

              <View className="items-center mb-6">
                <Image
                  source={evadiaLogo}
                  className="w-60 h-32"
                  resizeMode="contain"
                />
                <Text className="text-white/90 text-center text-base mt-2 font-semibold">
                  Trouvez l'hôtel parfait pour vous !
                </Text>
              </View>

              <Text className="text-3xl font-bold text-white text-center mb-6">
                S'inscrire
              </Text>

              <RegisterForm onSubmit={handleRegister} />

              <View className="flex-row items-center w-[353px] my-6">
                <View className="flex-1 h-px bg-white/50" />
                <Text className="mx-4 text-white/80 text-sm">OU</Text>
                <View className="flex-1 h-px bg-white/50" />
              </View>

              <TouchableOpacity
                onPress={handleGoogleLogin}
                className="items-center justify-center"
              >
                <Image
                  source={googleIcon}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6 mb-10">
                <Text className="text-white/80">Vous avez déjà un compte ? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text className="text-white font-semibold">Se connecter</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}