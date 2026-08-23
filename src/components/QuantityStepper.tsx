import { colors, fonts, radius } from "@/src/theme";
import { Minus, Plus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function QuantityStepper({
  count,
  min,
  onChange,
  isFixed,
}: {
  count: number;
  min: number;
  onChange: (next: number) => void;
  isFixed?: boolean;
}) {
  const step = isFixed ? min : 1;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChange(Math.max(min, count - step))}
        disabled={count <= min}
        style={[styles.btn, count <= min && { opacity: 0.3 }]}
      >
        <Minus size={14} color={colors.textSecondary} />
      </Pressable>
      <Text style={styles.val}>{count}</Text>
      <Pressable
        onPress={() => onChange(Math.min(99, count + step))}
        disabled={count >= 99}
        style={styles.btn}
      >
        <Plus size={14} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.counterBorder,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.white,
    height: 34,
  },
  btn: { width: 30, height: "100%", alignItems: "center", justifyContent: "center" },
  val: {
    minWidth: 28,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
});
