import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logoutUser } from "@/src/store/slices/authSlice";
import { colors, fonts, radius } from "@/src/theme";
import { SUPPORT_PHONE, SUPPORT_PHONE_LABEL } from "@/src/theme";
import { router } from "expo-router";
import {
  ChevronRight,
  Clock,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react-native";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/src/components/ui";

const LINKS = [
  { label: "My Orders", href: "/orders", icon: Package },
  { label: "Account Settings", href: "/profile", icon: User },
  { label: "Addresses", href: "/addresses", icon: MapPin },
  { label: "Wishlist", href: "/(tabs)/wishlist", icon: Heart },
  { label: "Track Order", href: "/track-order", icon: Clock },
  { label: "Support", href: "tel", icon: HelpCircle },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const customer = useAppSelector((s) => s.profile.customer);
  const counts = useAppSelector((s) => s.customerCounts);

  if (!customer) {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + 40, paddingHorizontal: 24 }]}>
        <Text style={styles.logo}>HorecaStore</Text>
        <Text style={styles.guestTitle}>Welcome back</Text>
        <Text style={styles.guestSub}>
          Login to track orders, save addresses, and checkout faster.
        </Text>
        <PrimaryButton label="Login" onPress={() => router.push("/login")} />
        <PrimaryButton
          label="Create account"
          variant="outline"
          onPress={() => router.push("/register")}
          style={{ marginTop: 10 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.email}>{customer.email}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat label="Orders" value={counts.orders_count} />
          <Stat label="Cart" value={counts.cart_quantity_sum} />
          <Stat label="Wishlist" value={counts.wishlist_count} />
        </View>

        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.label}
              style={styles.row}
              onPress={() => {
                if (item.href === "tel") Linking.openURL(`tel:${SUPPORT_PHONE}`);
                else router.push(item.href as any);
              }}
            >
              <Icon size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <ChevronRight size={18} color={colors.gray} />
            </Pressable>
          );
        })}

        <Pressable
          style={[styles.row, { marginTop: 12 }]}
          onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
        >
          <Phone size={20} color={colors.primary} />
          <Text style={styles.rowLabel}>Call {SUPPORT_PHONE_LABEL}</Text>
        </Pressable>

        <Pressable style={styles.logout} onPress={() => dispatch(logoutUser())}>
          <LogOut size={18} color={colors.quote} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white },
  logo: { fontFamily: fonts.bold, fontSize: 26, color: colors.primary, marginBottom: 16 },
  guestTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 8 },
  guestSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontFamily: fonts.bold, fontSize: 20 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  stats: { flexDirection: "row", gap: 8, marginBottom: 16 },
  stat: {
    flex: 1,
    backgroundColor: colors.page,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "center",
  },
  statVal: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  statLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
  },
  logoutText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.quote },
});
