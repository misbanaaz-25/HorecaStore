import { useAppSelector } from "@/src/store/hooks";
import { colors, fonts } from "@/src/theme";
import { router } from "expo-router";
import { ArrowLeft, Menu, Search } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function HomeHeader({ onMenu }: { onMenu: () => void }) {
  const insets = useSafeAreaInsets();
  const location = useAppSelector((s) => s.country.data);
  return (
    <View style={[styles.homeWrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <Pressable onPress={onMenu} hitSlop={10} style={styles.iconBtn}>
          <Menu size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.logo}>HorecaStore</Text>
          <Text style={styles.deliver} numberOfLines={1}>
            Restaurant supplies · {location?.name ?? "United States"}
          </Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/search")} hitSlop={10} style={styles.iconBtn}>
          <Search size={22} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export function StackHeader({ title, right }: { title: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.stackWrap, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
        <ArrowLeft size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.stackTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ minWidth: 36, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeWrap: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary },
  deliver: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  stackWrap: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stackTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
});
