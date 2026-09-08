import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { RADIUS, SPACING } from "../../theme";
import { F } from "../../theme/fonts";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
  disabledStyle: StyleProp<ViewStyle>;
  /** Empilées dans la colonne latérale desktop, côte à côte sur mobile. */
  vertical?: boolean;
}

/** Modifier / supprimer une réservation. */
const BookingActionButtons: React.FC<Props> = ({
  onEdit,
  onDelete,
  disabled,
  disabledStyle,
  vertical = false,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.row, vertical && styles.column]}>
      <TouchableOpacity
        style={[styles.edit, vertical && styles.stacked, { backgroundColor: colors.bgMid }, disabledStyle]}
        onPress={onEdit}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={[styles.editText, { color: colors.textMid }]}>{t("bookings.details.editButton")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.delete, vertical && styles.stacked, { backgroundColor: colors.dangerLight }, disabledStyle]}
        onPress={onDelete}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={[styles.deleteText, { color: colors.danger }]}>{t("bookings.details.deleteButton")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingHorizontal: 18, paddingVertical: 8, marginTop: 8 },
  column: { flexDirection: "column", paddingHorizontal: 0, paddingVertical: 0, marginTop: 0, gap: SPACING.xs },
  edit: {
    flex: 1,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  editText: { fontSize: 14, fontFamily: F.sans600 },
  delete: {
    flex: 1,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(192,64,64,0.2)",
    cursor: "pointer",
  },
  deleteText: { fontSize: 14, fontFamily: F.sans600 },
  // Empilés, les boutons prennent toute la largeur de la colonne latérale.
  stacked: { flex: 0, width: "100%" },
});

export default BookingActionButtons;
