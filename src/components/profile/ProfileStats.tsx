import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

export interface ProfileStat {
  value: string | number;
  label: string;
}

interface ProfileStatsProps {
  stats: ProfileStat[];
  /** `row` : bandeau pleine largeur (mobile). `grid` : deux colonnes (carte d'identité). */
  variant?: "row" | "grid";
}

/** Chiffres clés du compte : voyages, réservations, amis, adresses. */
export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, variant = "row" }) => {
  const { colors } = useTheme();
  const isGrid = variant === "grid";

  return (
    <View style={isGrid ? styles.grid : styles.row}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[
            styles.item,
            isGrid ? styles.itemGrid : styles.itemRow,
            { backgroundColor: colors.bgMid },
          ]}
        >
          <Text style={[styles.value, { color: colors.terra }]}>{stat.value}</Text>
          <Text style={[styles.label, { color: colors.textLight }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  item: { borderRadius: RADIUS.card, paddingVertical: 14, alignItems: "center" },
  itemRow: { flex: 1 },
  // Deux colonnes qui se partagent la largeur de la carte d'identité.
  itemGrid: { flexGrow: 1, flexBasis: "45%" },
  value: { fontSize: 26, fontFamily: F.sans700, marginBottom: 3 },
  label: { fontSize: FONT_SIZE.xs, fontFamily: F.sans400 },
});
