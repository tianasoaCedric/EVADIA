import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

// L'intro animée est jouée par-dessus la navigation (voir IntroAnimation dans
// app/_layout.tsx) : cette route ne fait plus que rediriger.
export default function Index() {
  const { state } = useAuth();

  if (state.status === "loading") return null;

  return <Redirect href={state.status === "authenticated" ? "/(app)/home" : "/(auth)/register"} />;
}
