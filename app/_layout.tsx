import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import store from "@/src/store/store";
import { bootstrapApp } from "@/src/store/bootstrap";
import { setUnauthorizedHandler } from "@/src/api/client";
import { colors } from "@/src/theme";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;
    void bootstrapApp(store.dispatch).finally(() => {
      SplashScreen.hideAsync();
    });
    setUnauthorizedHandler(() => {
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.white },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="register" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="product/[slug]" />
          <Stack.Screen name="category/[...slug]" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="addresses" />
          <Stack.Screen name="brands" />
          <Stack.Screen name="brand/[slug]" />
          <Stack.Screen name="track-order" />
          <Stack.Screen name="quote" />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
}
