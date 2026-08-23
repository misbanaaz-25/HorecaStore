import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const KEYS = {
  token: "token",
  loginTime: "login_time",
  user: "user",
  cart: "horeca_cart",
  wishlist: "horeca_wishlist",
  saveForLater: "horeca_save_for_later",
  location: "location",
  countryCode: "hc_cc",
  defaultAddress: "hc_default_address",
  guestToken: "guest_token",
  taxRate: "horeca_tax_rate",
  cartSummary: "hc_cart_summary",
};

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getToken(): Promise<string | null> {
  try {
    const secure = await SecureStore.getItemAsync(KEYS.token);
    if (secure) return secure.trim().replace(/^["']|["']$/g, "");
  } catch {
    // SecureStore can fail on web; fall through
  }
  const raw = await AsyncStorage.getItem(KEYS.token);
  return raw ? raw.trim().replace(/^["']|["']$/g, "") : null;
}

export async function setAuthToken(token: string): Promise<void> {
  const clean = token.trim().replace(/^["']|["']$/g, "");
  const loginTime = Date.now().toString();
  await AsyncStorage.setItem(KEYS.token, clean);
  await AsyncStorage.setItem(KEYS.loginTime, loginTime);
  try {
    await SecureStore.setItemAsync(KEYS.token, clean);
  } catch {
    // ignore
  }
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.token,
    KEYS.user,
    KEYS.loginTime,
    KEYS.defaultAddress,
  ]);
  try {
    await SecureStore.deleteItemAsync(KEYS.token);
  } catch {
    // ignore
  }
}
