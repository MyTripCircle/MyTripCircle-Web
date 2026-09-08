import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ActiveSubscriptionCardProps {
  /** Ligne de renouvellement déjà formatée par l'écran appelant. */
  renewalLine: string;
  onManage: () => void;
  /** Ouverture du portail de gestion en cours. */
  opening: boolean;
}

/** État « abonné » : rappel du statut et accès au portail de gestion. */
const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  renewalLine,
  onManage,
  opening,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.terraLight, borderColor: colors.terra }]}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={22} color={colors.terra} />
        <Text style={[styles.title, { color: colors.terraDark }]}>
          {t("subscription.activeBannerTitle")}
        </Text>
      </View>
      <Text style={[styles.renewal, { color: colors.textMid }]}>{renewalLine}</Text>
      <TouchableOpacity
        style={[styles.manageBtn, { backgroundColor: colors.terra }, opening && styles.disabled]}
        onPress={onManage}
        disabled={opening}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.manageBtnText}>{t("subscription.manageButton")}</Text>
        <Ionicons name="open-outline" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: 6,
  },
  title: { fontSize: FONT_SIZE.xl, fontFamily: F.sans700 },
  renewal: { fontSize: FONT_SIZE.md, fontFamily: F.sans400, marginBottom: SPACING.md },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    borderRadius: RADIUS.button,
    paddingVertical: SPACING.sm,
    cursor: "pointer",
  },
  // Le portail de paiement s'ouvre après un aller-retour réseau : on neutralise
  // le bouton le temps de la redirection pour éviter les doubles ouvertures.
  disabled: { opacity: 0.6 },
  manageBtnText: { fontSize: FONT_SIZE.base, fontFamily: F.sans600, color: "#FFFFFF" },
});

export default ActiveSubscriptionCard;
