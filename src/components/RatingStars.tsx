import { colors } from "@/src/theme";
import { Star } from "lucide-react-native";
import { View } from "react-native";

export function RatingStars({ rating, size = 13 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          color={s <= rounded ? colors.star : "#e5e7eb"}
          fill={s <= rounded ? colors.star : "#e5e7eb"}
        />
      ))}
    </View>
  );
}
