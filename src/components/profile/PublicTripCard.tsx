import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { COLORS, F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import type { Trip } from "../../types";

/** Voyage visible par tous, listé sur le profil public. */
export const PublicTripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        <Ionicons name="earth-outline" size={18} color={colors.terra} style={styles.icon} />
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {trip.title}
          </Text>
          {trip.destination ? (
            <Text style={[styles.destination, { color: colors.textLight }]} numberOfLines={1}>
              {trip.destination}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{t("createTrip.public")}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: SPACING.sm,
  },
  left: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10, marginRight: SPACING.xs },
  icon: { marginTop: 1 },
  texts: { flex: 1 },
  title: { fontSize: FONT_SIZE.base, fontFamily: F.sans600 },
  destination: { fontSize: FONT_SIZE.xs, fontFamily: F.sans400, marginTop: 2 },
  // Pastille « ciel » de la palette, reprise telle quelle du rendu mobile.
  pill: {
    backgroundColor: COLORS.skyLight,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: FONT_SIZE.xxs, fontFamily: F.sans600, color: COLORS.sky },
});
