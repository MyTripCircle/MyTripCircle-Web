import React from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { getAvatarColor, getInitials } from "../../utils/avatarUtils";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/** Hauteur du bandeau photo, identique au rendu mobile d'origine. */
export const COVER_HEIGHT = 210;

const COVER_URI =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80&fit=crop";

interface ProfileCoverProps {
  name?: string;
  email?: string;
  avatar?: string;
  isPublicProfile?: boolean;
  onEdit: () => void;
}

/** Bandeau d'identité mobile : photo, avatar, identité et accès à l'édition. */
export const ProfileCover: React.FC<ProfileCoverProps> = ({
  name,
  email,
  avatar,
  isPublicProfile,
  onEdit,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.cover}>
      {/* Photo purement décorative : pas de libellé, elle n'apporte aucune
          information au lecteur d'écran (WCAG 1.1.1, image de décoration). */}
      <Image
        source={{ uri: COVER_URI }}
        style={StyleSheet.absoluteFill as StyleProp<ImageStyle>}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(8,4,0,0.2)", "rgba(8,4,0,0.58)"]}
        style={StyleSheet.absoluteFill as StyleProp<ViewStyle>}
      />

      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(name ?? "") }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarPhoto} />
          ) : (
            <Text style={styles.avatarText}>{getInitials(name ?? "")}</Text>
          )}
        </View>

        <View style={styles.identity}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          {!isPublicProfile && (
            <View style={styles.privatePill}>
              <Ionicons
                name="lock-closed"
                size={10}
                color="rgba(255,255,255,0.7)"
                style={styles.privateIcon}
              />
              <Text style={styles.privateText}>{t("profile.privateLabel")}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.editPill} onPress={onEdit} activeOpacity={0.8}>
          <Text style={styles.editPillText}>{t("profile.edit")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cover: { height: COVER_HEIGHT, position: "relative", justifyContent: "flex-end" },
  content: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden",
  },
  avatarPhoto: { width: 68, height: 68, borderRadius: 34 },
  avatarText: { color: "#FFFFFF", fontSize: 22, fontFamily: F.sans700 },
  identity: { flex: 1 },
  name: {
    fontSize: 22,
    fontFamily: F.sans600,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: FONT_SIZE.sm,
    fontFamily: F.sans400,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
  },
  privatePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  privateIcon: { marginRight: 4 },
  privateText: { fontSize: FONT_SIZE.xxs, fontFamily: F.sans500, color: "rgba(255,255,255,0.75)" },
  editPill: {
    alignSelf: "flex-start",
    marginBottom: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  editPillText: { fontSize: FONT_SIZE.sm, fontFamily: F.sans600, color: "#FFFFFF" },
});
