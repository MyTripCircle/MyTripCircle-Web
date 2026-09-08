import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";
import { SPACING } from "../../theme";
import { FilterType } from "../../hooks/useAddresses";

interface Props {
  filter: FilterType;
  onAdd: () => void;
  addDisabled: boolean;
  addStyle: StyleProp<ViewStyle>;
  /**
   * Dans une page qui défile, l'état vide ne peut pas s'étirer sur la hauteur
   * restante : il se contente d'une réserve verticale. Même mécanisme que
   * `BookingsEmptyState`.
   */
  inFlow?: boolean;
}

/** État vide de la liste des adresses, partagé par la liste et la grille. */
const AddressesEmptyState: React.FC<Props> = ({ filter, onAdd, addDisabled, addStyle, inFlow = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, inFlow && styles.containerInFlow]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.terraLight }]}>
        <Ionicons name="map-outline" size={52} color={colors.terra} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{t("addresses.emptyTitle")}</Text>
      <Text style={[styles.subtitle, { color: colors.textMid }]}>
        {filter === "all"
          ? t("addresses.emptyAll")
          : t("addresses.emptyFiltered", { type: t(`addresses.filters.${filter}`) })}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.terra }, addStyle]}
        onPress={onAdd}
        disabled={addDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>{t("addresses.addAddress")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 48 },
  containerInFlow: { flex: 0, paddingVertical: SPACING.xxl * 2 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, marginBottom: 8, textAlign: "center", fontFamily: F.sans700 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 28, lineHeight: 22, fontFamily: F.sans400 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9999,
    cursor: "pointer",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontFamily: F.sans600 },
});

export default AddressesEmptyState;
