import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { Trip } from "../../types";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface Props {
  trip: Trip;
  daysUntil: number;
  /**
   * Empile les chiffres clés en colonne. Utilisé par la colonne latérale du
   * gabarit desktop, où trois pastilles côte à côte seraient trop étroites.
   */
  stacked?: boolean;
}

/** Chiffres clés du voyage mis en avant : réservations, membres, compte à rebours. */
const TripHeroStats: React.FC<Props> = ({ trip, daysUntil, stacked = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const stats = [
    { value: String(trip.stats?.totalBookings ?? 0), label: t("trips.bookingsLabel") },
    { value: String((trip.collaborators?.length ?? 0) + 1), label: t("trips.coTravelers") },
    { value: t("trips.daysShort", { count: daysUntil }), label: t("trips.beforeDeparture") },
  ];

  return (
    <View style={[styles.row, stacked && styles.stack]}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[styles.pill, { backgroundColor: colors.bgMid }, stacked && styles.pillStacked]}
        >
          <Text style={[styles.value, { color: colors.terra }, stacked && styles.valueStacked]}>
            {stat.value}
          </Text>
          <Text style={[styles.label, { color: colors.textLight }, stacked && styles.labelStacked]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 12,
  },
  pill: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  value: { fontSize: 28, fontFamily: F.sans700 },
  label: { fontSize: 13, fontFamily: F.sans400, marginTop: 3 },

  stack: {
    flexDirection: "column",
    gap: SPACING.xs,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  pillStacked: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  valueStacked: { fontSize: FONT_SIZE.h2 },
  labelStacked: {
    marginTop: 0,
    fontSize: FONT_SIZE.md,
    flexShrink: 1,
    textAlign: "right",
  },
});

export default TripHeroStats;
