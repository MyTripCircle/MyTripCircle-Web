import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";
import { SPACING } from "../../theme";
import { BookingFilterType } from "./bookingsFilters";

interface Props {
  filter: BookingFilterType;
  onAdd: () => void;
  addDisabled: boolean;
  addStyle: StyleProp<ViewStyle>;
  /**
   * Dans une page qui défile, l'état vide ne peut pas s'étirer sur la hauteur
   * restante : il se contente d'une réserve verticale.
   */
  inFlow?: boolean;
}

/** État vide de la liste des réservations, partagé par la liste et la grille. */
const BookingsEmptyState: React.FC<Props> = ({ filter, onAdd, addDisabled, addStyle, inFlow = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, inFlow && styles.containerInFlow]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.terraLight }]}>
        <Ionicons name="calendar-outline" size={44} color={colors.terra} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{t("bookings.emptyTitle")}</Text>
      <Text style={[styles.subtitle, { color: colors.textMid }]}>
        {filter === "all"
          ? t("bookings.emptyAll")
          : t("bookings.emptyFiltered", { type: t(`bookings.filters.${filter}`) })}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.terra }, addStyle]}
        onPress={onAdd}
        disabled={addDisabled}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>{t("bookings.addBooking")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 48 },
  containerInFlow: { flex: 0, paddingVertical: SPACING.xxl * 2 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 22, fontFamily: F.sans700, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 32, lineHeight: 22, fontFamily: F.sans400 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    cursor: "pointer",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: { color: "white", fontSize: 15, fontFamily: F.sans600 },
});

export default BookingsEmptyState;
