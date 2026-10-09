import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = { message: string };

export default function ErrorBanner({ message }: Props) {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={16} color="#fff" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.85)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: "100%",
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: "#fff",
    lineHeight: 16,
  },
});
