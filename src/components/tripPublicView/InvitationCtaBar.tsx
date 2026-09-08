import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F } from "../../theme/fonts";
import { RADIUS, SPACING } from "../../theme";

interface Props {
  responding: boolean;
  onAccept: () => void;
  onDecline: () => void;
  insetBottom: number;
}

const InvitationCtaBar: React.FC<Props> = ({ responding, onAccept, onDecline, insetBottom }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  const hint = (
    <View style={[styles.inviteCtaHint, { backgroundColor: colors.terraLight }]}>
      <Ionicons name="mail-outline" size={16} color={colors.terra} />
      <Text style={[styles.inviteCtaHintText, { color: colors.terra }]} numberOfLines={isDesktopUp ? 2 : 1}>
        {t("tripPublicView.inviteHint")}
      </Text>
    </View>
  );

  const declineButton = (
    <TouchableOpacity
      style={[styles.inviteCtaDecline, { backgroundColor: colors.bgMid }]}
      onPress={onDecline}
      disabled={responding}
      activeOpacity={0.85}
    >
      <Ionicons name="close" size={20} color={colors.textMid} />
      <Text style={[styles.inviteCtaDeclineText, { color: colors.textMid }]}>
        {t("tripPublicView.decline")}
      </Text>
    </TouchableOpacity>
  );

  const acceptButton = (
    <TouchableOpacity
      style={[styles.inviteCtaAccept, { backgroundColor: colors.terra, shadowColor: colors.terra }]}
      onPress={onAccept}
      disabled={responding}
      activeOpacity={0.85}
    >
      {responding ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.inviteCtaAcceptText}>{t("tripPublicView.accept")}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  // Desktop : carte statique dans la colonne latérale — un bandeau plein écran
  // ancré en bas n'a de sens qu'à la largeur d'un mobile.
  if (isDesktopUp) {
    return (
      <View style={[styles.desktopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {hint}
        <View style={styles.desktopButtons}>
          {acceptButton}
          {declineButton}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inviteCta, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insetBottom + 12 }]}>
      {hint}
      <View style={styles.inviteCtaButtons}>
        {declineButton}
        {acceptButton}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inviteCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  inviteCtaHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inviteCtaHintText: { fontSize: 13, fontFamily: F.sans500, flex: 1 },
  inviteCtaButtons: { flexDirection: "row", gap: 10 },
  inviteCtaDecline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  inviteCtaDeclineText: { fontSize: 16, fontFamily: F.sans600 },
  inviteCtaAccept: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  inviteCtaAcceptText: { fontSize: 16, fontFamily: F.sans600, color: "#FFFFFF" },

  // ── Variante desktop : carte statique de la colonne latérale ──────────────
  desktopCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  desktopButtons: { gap: SPACING.xs },
});

export default InvitationCtaBar;
