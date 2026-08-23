import { ProductCard } from "@/src/components/ProductCard";
import { Chip, EmptyState, Loader } from "@/src/components/ui";
import { NLP_SEARCH_URL, colors, fonts } from "@/src/theme";
import type { RawApiProduct } from "@/src/types";
import { anyToRawProduct } from "@/src/utils/product";
import axios from "axios";
import { Search, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TRENDING = [
  "Commercial Refrigerator",
  "Gas Range",
  "Deep Fryer",
  "Ice Machine",
  "Prep Table",
  "Dishwasher",
  "Mixer",
  "Oven",
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<RawApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const cardW = (Dimensions.get("window").width - 42) / 2;

  const run = useCallback(async (query: string, sortDir?: "asc" | "desc") => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string | number> = {
        query: query.trim(),
        page: 1,
        length: 24,
      };
      if (sortDir) {
        params.sort_by = "price";
        params.sort_dir = sortDir;
      }
      const res = await axios.get(NLP_SEARCH_URL, { params });
      const list = res.data?.data?.products ?? [];
      setProducts(list.map((p: unknown) => anyToRawProduct(p)));
      setTotal(res.data?.data?.total_records ?? list.length);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.searchRow}>
        <Search size={18} color={colors.gray} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search 100,000+ products..."
          placeholderTextColor={colors.gray}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => run(q, sort === "default" ? undefined : sort)}
        />
        {q ? (
          <Pressable
            onPress={() => {
              setQ("");
              setProducts([]);
              setSearched(false);
            }}
          >
            <X size={18} color={colors.gray} />
          </Pressable>
        ) : null}
      </View>

      {!searched ? (
        <View style={{ padding: 16 }}>
          <Text style={styles.trendTitle}>Trending searches</Text>
          <View style={styles.chips}>
            {TRENDING.map((t) => (
              <Pressable
                key={t}
                style={styles.trend}
                onPress={() => {
                  setQ(t);
                  void run(t);
                }}
              >
                <Text style={styles.trendText}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : loading ? (
        <Loader />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 120, gap: 10, paddingTop: 8 }}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
              <Text style={styles.count}>
                {total} results for “{q}”
              </Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Chip
                  label="Default"
                  active={sort === "default"}
                  onPress={() => {
                    setSort("default");
                    void run(q);
                  }}
                />
                <Chip
                  label="Price ↑"
                  active={sort === "asc"}
                  onPress={() => {
                    setSort("asc");
                    void run(q, "asc");
                  }}
                />
                <Chip
                  label="Price ↓"
                  active={sort === "desc"}
                  onPress={() => {
                    setSort("desc");
                    void run(q, "desc");
                  }}
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState title="No products found" subtitle="Try another keyword or browse categories." />
          }
          renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white },
  searchRow: {
    marginHorizontal: 16,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.page,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  trendTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  trend: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trendText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
});
