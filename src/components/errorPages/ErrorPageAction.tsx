import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ErrorPageActionProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Bouton d'une page d'erreur.
 *
 * Il occupe toute la largeur sous le palier tablette (empilement mobile) et se
 * réduit à son contenu au-delà, les deux actions tenant alors sur une ligne.
 */
export const ErrorPageAction: React.FC<ErrorPageActionProps> = ({
  label,
  onPress,
  variant = "primary",
  icon,
}) => {
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPrimary = variant === "primary";
  const background = (() => {
    if (isPrimary) return hovered ? colors.terraDark : colors.terra;
    return hovered || focused ? colors.bgMid : "transparent";
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        isTabletUp ? styles.buttonInline : styles.buttonBlock,
        {
          backgroundColor: background,
          borderColor: focused ? colors.terraDark : colors.border,
        },
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary ? colors.white : colors.textMid}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[styles.label, isPrimary ? styles.labelPrimary : { color: colors.textMid }]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: RADIUS.input,
    cursor: "pointer",
  },
  buttonBlock: { width: "100%", marginBottom: SPACING.sm },
  buttonInline: { paddingHorizontal: SPACING.xl },
  primary: {
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  secondary: { borderWidth: 1 },
  pressed: { opacity: 0.8 },
  icon: { marginRight: SPACING.xs },
  label: { fontSize: FONT_SIZE.xl, fontFamily: F.sans600 },
  labelPrimary: { color: "#FFFFFF", fontFamily: F.sans700 },
});
