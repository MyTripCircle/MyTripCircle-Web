import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { getAvatarColor, getInitials } from "../../utils/avatarUtils";
import { F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../theme";
import { ProfileStat, ProfileStats } from "./ProfileStats";
import { ProfileLogoutButton } from "./ProfileLogoutButton";

interface ProfileIdentityCardProps {
  name?: string;
  email?: string;
  avatar?: string;
  isPublicProfile?: boolean;
  stats: ProfileStat[];
  onLogout: () => void;
}

/**
 * Carte d'identité de la colonne latérale desktop.
 *
 * Elle rassemble ce qui reste vrai quelle que soit la section consultée :
 * qui l'on est, ses chiffres clés et la sortie de session. La photo de
 * couverture mobile n'y est pas reprise — sur grand écran, elle mangerait la
 * moitié de la colonne sans rien apporter.
 */
export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  name,
  email,
  avatar,
  isPublicProfile,
  stats,
  onLogout,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        SHADOW.light,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(name ?? "") }]}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarPhoto} />
        ) : (
          <Text style={styles.avatarText}>{getInitials(name ?? "")}</Text>
        )}
      </View>

      <Text accessibilityRole="header" style={[styles.name, { color: colors.text }]}>
        {name}
      </Text>
      <Text style={[styles.email, { color: colors.textMid }]}>{email}</Text>

      <View style={[styles.visibility, { backgroundColor: colors.bgMid }]}>
        <Ionicons
          name={isPublicProfile ? "earth-outline" : "lock-closed"}
          size={12}
          color={colors.textMid}
        />
        <Text style={[styles.visibilityText, { color: colors.textMid }]}>
          {isPublicProfile ? t("createTrip.public") : t("profile.privateLabel")}
        </Text>
      </View>

      <View style={styles.stats}>
        <ProfileStats stats={stats} variant="grid" />
      </View>

      <ProfileLogoutButton onPress={onLogout} standalone />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    alignItems: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  avatarPhoto: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { color: "#FFFFFF", fontSize: 28, fontFamily: F.sans700 },
  name: { fontSize: FONT_SIZE.h3, fontFamily: F.sans700, textAlign: "center" },
  email: {
    fontSize: FONT_SIZE.md,
    fontFamily: F.sans400,
    marginTop: SPACING.xxs,
    textAlign: "center",
  },
  visibility: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xxs,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.pill,
  },
  visibilityText: { fontSize: FONT_SIZE.xs, fontFamily: F.sans500 },
  stats: { width: "100%", marginTop: SPACING.lg, marginBottom: SPACING.md },
});
