import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAuth } from "../context/AuthContext";

const INTRO_VIDEO = require("../assets/intro.mp4");

export default function Index() {
  const hasNavigated = useRef(false);
  const videoEnded = useRef(false);
  const { state } = useAuth();

  const player = useVideoPlayer(INTRO_VIDEO, (player) => {
    player.play();
  });

  const goNext = () => {
    if (hasNavigated.current) return;
    if (!videoEnded.current) return;
    if (state.status === "loading") return;
    hasNavigated.current = true;
    router.replace(state.status === "authenticated" ? "/(app)/home" : "/(auth)/register");
  };

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      videoEnded.current = true;
      goNext();
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    goNext();
  }, [state.status]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
});
