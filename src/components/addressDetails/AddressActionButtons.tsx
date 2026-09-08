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
  /** Empilés dans la colonne latérale desktop, côte à côte sur mobile. */
  vertical?: boolean;
}

/**
 * Modifier / supprimer une adresse.
 *
 * Même patron que `BookingActionButtons`, avec les valeurs déjà en place dans
 * `AddressDetailsScreen` (pas de bordure sur le bouton supprimer).
 */
const AddressActionButtons: React.FC<Props> = ({
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
        <Text style={[styles.editText, { color: colors.textMid }]}>{t("addresses.details.editButton")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.delete, vertical && styles.stacked, { backgroundColor: colors.dangerLight }, disabledStyle]}
        onPress={onDelete}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={[styles.deleteText, { color: colors.danger }]}>{t("addresses.details.deleteButton")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, paddingHorizontal: 18, paddingVertical: 6, marginTop: 6 },
  column: { flexDirection: "column", paddingHorizontal: 0, paddingVertical: 0, marginTop: 0, gap: SPACING.xs },
  edit: { flex: 1, borderRadius: RADIUS.button, paddingVertical: 15, alignItems: "center", justifyContent: "center", cursor: "pointer" },
  editText: { fontSize: 15, fontFamily: F.sans600 },
  delete: { flex: 1, borderRadius: RADIUS.button, paddingVertical: 15, alignItems: "center", justifyContent: "center", cursor: "pointer" },
  deleteText: { fontSize: 15, fontFamily: F.sans600 },
  // Empilés, les boutons prennent toute la largeur de la colonne latérale.
  stacked: { flex: 0, width: "100%" },
});

export default AddressActionButtons;
