import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";

interface Props {
  eyebrow?: string;
  onAdd: () => void;
  addDisabled: boolean;
  addStyle: StyleProp<ViewStyle>;
  /** Neutralise la marge horizontale quand un conteneur de page la gère déjà. */
  flush?: boolean;
}

/**
 * En-tête de la liste des adresses pour les paliers sans grand titre de page
 * (mobile et tablette) : compteur, titre et action d'ajout.
 *
 * Même rôle que `BookingsListHeader` pour les réservations.
 */
const AddressesListHeader: React.FC<Props> = ({ eyebrow, onAdd, addDisabled, addStyle, flush = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.header, flush && styles.headerFlush]}>
      <View style={styles.headerLeft}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.textLight }]} numberOfLines={1}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{t("addresses.header")}</Text>
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.terra }, addStyle]}
        onPress={onAdd}
        disabled={addDisabled}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={t("addresses.addAddress")}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerFlush: { paddingHorizontal: 0 },
  headerLeft: { flex: 1, marginRight: 16 },
  eyebrow: { fontFamily: F.sans400, fontSize: 14, marginBottom: 4 },
  title: { fontFamily: F.sans700, fontSize: 28, letterSpacing: -0.3 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default AddressesListHeader;
