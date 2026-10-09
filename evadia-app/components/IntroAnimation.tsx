import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import LottieView from "lottie-react-native";

type Props = {
  ready: boolean; // true quand l'app a fini de charger (session, etc.)
  onDone: () => void; // appelé quand l'intro a complètement disparu
};

const BG = "#01BDA5"; // identique au splash natif (app.json) → transition invisible
const RATIO = 1290 / 410; // proportions de l'animation

export default function IntroAnimation({ ready, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  // 50 % de la largeur sur téléphone, 35 % sur tablette, 420 px max
  const logoWidth = Math.min(width * (isTablet ? 0.35 : 0.5), 420);

  const [animDone, setAnimDone] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  // On ne quitte l'intro que quand l'animation ET le chargement sont terminés
  useEffect(() => {
    if (animDone && ready) {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onDone());
    }
  }, [animDone, ready]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.bg, { opacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      {/* Un appui sur l'écran permet de passer l'animation */}
      <Pressable style={styles.center} onPress={() => setAnimDone(true)}>
        <LottieView
          source={require("../assets/evadia-intro.json")}
          autoPlay
          loop={false}
          resizeMode="contain"
          style={{ width: logoWidth, height: logoWidth / RATIO }}
          onAnimationFinish={() => setAnimDone(true)}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: BG, zIndex: 999 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
