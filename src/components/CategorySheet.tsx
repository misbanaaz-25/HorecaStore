import { colors, fonts } from "@/src/theme";
import type { ApiCategory } from "@/src/types";
import { categoryHref, resolveStr } from "@/src/utils/product";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronDown, ChevronRight, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CategorySheet({
  visible,
  onClose,
  categories,
}: {
  visible: boolean;
  onClose: () => void;
  categories: ApiCategory[];
}) {
  const insets = useSafeAreaInsets();
  const [openId, setOpenId] = useState<number | null>(null);

  const go = (href: string) => {
    onClose();
    router.push(href as any);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
        <View style={styles.head}>
          <Text style={styles.title}>Shop by Category</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {categories.map((cat) => {
            const name = resolveStr(cat.name);
            const open = openId === cat.id;
            const hasKids = (cat.children?.length ?? 0) > 0;
            return (
              <View key={cat.id} style={styles.block}>
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    if (hasKids) setOpenId(open ? null : cat.id);
                    else go(cat.slug === "shop-by-brands" ? "/brands" : `/category/${cat.slug}`);
                  }}
                >
                  {cat.image_url ? (
                    <Image source={{ uri: cat.image_url }} style={styles.icon} contentFit="contain" />
                  ) : null}
                  <Text style={styles.name}>{name}</Text>
                  {hasKids ? (
                    <ChevronDown
                      size={18}
                      color={colors.gray}
                      style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
                    />
                  ) : (
                    <ChevronRight size={18} color={colors.gray} />
                  )}
                </Pressable>
                {open
                  ? cat.children.map((child) => (
                      <Pressable
                        key={child.id}
                        style={styles.child}
                        onPress={() =>
                          go(
                            child.slug === "shop-by-brands"
                              ? "/brands"
                              : categoryHref(cat.slug, child.slug),
                          )
                        }
                      >
                        <Text style={styles.childName}>{resolveStr(child.name)}</Text>
                        <ChevronRight size={16} color={colors.gray} />
                      </Pressable>
                    ))
                  : null}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  block: { borderBottomWidth: 1, borderBottomColor: colors.border },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  icon: { width: 28, height: 28 },
  name: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  child: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 54,
    paddingRight: 16,
    backgroundColor: colors.page,
  },
  childName: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
});
