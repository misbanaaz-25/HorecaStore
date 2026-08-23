import { PrimaryButton } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops", headerShown: false }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.white }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 8 }}>
          Page not found
        </Text>
        <Text style={{ fontFamily: fonts.regular, color: colors.textMuted, marginBottom: 20 }}>
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <PrimaryButton label="Go home" onPress={() => {}} />
        </Link>
      </View>
    </>
  );
}
