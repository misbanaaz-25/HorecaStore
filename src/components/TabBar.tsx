import { useAppSelector } from "@/src/store/hooks";
import { colors, fonts } from "@/src/theme";
import { Heart, Home, Search, ShoppingCart, User } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string, params?: object) => void };
};

const ICONS = {
  index: Home,
  search: Search,
  cart: ShoppingCart,
  wishlist: Heart,
  account: User,
} as const;

const LABELS = {
  index: "Home",
  search: "Search",
  cart: "Cart",
  wishlist: "Wishlist",
  account: "Account",
} as const;

export function HorecaTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAppSelector((s) => !!s.profile.customer);
  const cartCount = useAppSelector((s) =>
    isLoggedIn
      ? s.customerCounts.cart_quantity_sum
      : s.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useAppSelector((s) =>
    isLoggedIn ? s.customerCounts.wishlist_count : s.wishlist.guestItems.length,
  );

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const name = route.name as keyof typeof ICONS;
          const Icon = ICONS[name] ?? Home;
          const isCart = name === "cart";
          const badge =
            name === "cart" ? cartCount : name === "wishlist" ? wishlistCount : 0;

          if (isCart) {
            return (
              <Pressable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={styles.cartSlot}
              >
                <View style={styles.cartBubble}>
                  <ShoppingCart size={22} color={colors.white} />
                  {badge > 0 ? (
                    <View style={styles.cartBadge}>
                      <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cartLabel}>Cart</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                if (name === "account" && !isLoggedIn) {
                  navigation.navigate("account");
                  return;
                }
                navigation.navigate(route.name);
              }}
              style={styles.slot}
            >
              {focused ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
              <View>
                <Icon
                  size={22}
                  color={focused ? colors.primary : colors.gray}
                  strokeWidth={focused ? 2.3 : 1.7}
                />
                {name === "wishlist" && badge > 0 ? (
                  <View style={styles.wishBadge}>
                    <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, focused && styles.labelOn]}>
                {LABELS[name] ?? route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    paddingHorizontal: 4,
  },
  slot: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    gap: 4,
  },
  cartSlot: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  cartBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 3.5,
    borderColor: "#fff",
  },
  cartLabel: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.primary,
  },
  label: { fontFamily: fonts.regular, fontSize: 10, color: colors.gray },
  labelOn: { fontFamily: fonts.semibold, color: colors.primary },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginBottom: 2,
  },
  dotSpacer: { width: 5, height: 5, marginBottom: 2 },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.sale,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.white,
  },
  wishBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: { color: colors.white, fontSize: 8, fontFamily: fonts.bold },
});
