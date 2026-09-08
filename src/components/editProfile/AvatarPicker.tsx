import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { getAvatarColor, getInitials } from "../../utils/avatarUtils";
import { F, FONT_SIZE, SPACING } from "../../theme";

interface AvatarPickerProps {
  name: string;
  avatar?: string;
  uploading: boolean;
  onPick: () => void;
}

/** Photo de profil et son remplacement, en tête du formulaire. */
export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  name,
  avatar,
  uploading,
  onPick,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={onPick}
        activeOpacity={0.85}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel={t("editProfile.changePhoto")}
      >
        <View style={styles.wrapper}>
          <View style={[styles.circle, { backgroundColor: getAvatarColor(name) }]}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.photo} />
            ) : (
              <Text style={styles.initials}>{getInitials(name)}</Text>
            )}
          </View>
          <View style={[styles.camera, { backgroundColor: colors.terra }]}>
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPick} activeOpacity={0.7} disabled={uploading}>
        <Text style={[styles.link, { color: colors.terra }]}>
          {t("editProfile.changePhoto")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { alignItems: "center", paddingVertical: SPACING.xl },
  wrapper: { width: 80, height: 80, marginBottom: 10 },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  photo: { width: 80, height: 80, borderRadius: 40 },
  initials: { color: "#FFFFFF", fontSize: 26, fontFamily: F.sans700, letterSpacing: 1 },
  camera: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  link: { fontSize: FONT_SIZE.md, fontFamily: F.sans600 },
});
