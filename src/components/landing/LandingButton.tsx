import React, { useState } from "react";
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { COLORS, F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../theme";

export type LandingButtonVariant = "primary" | "secondary" | "overlay";

interface LandingButtonProps {
  label: string;
  onPress: () => void;
  variant?: LandingButtonVariant;
  /** Occupe toute la largeur disponible : utile sur mobile où les appels à l'action s'empilent. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Appel à l'action de la page d'accueil publique.
 *
 * Les couleurs sont choisies pour rester au-dessus de 4.5:1 dans les deux
 * thèmes : `terraDark` est sombre en clair (texte blanc) et clair en sombre
 * (texte encre). Le survol et le focus ne modifient jamais la couleur de fond,
 * pour ne pas dégrader ce contraste — ils ajoutent une ombre et un anneau.
 */
export const LandingButton: React.FC<LandingButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  block = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const palette = resolvePalette(variant, colors, isDark);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.root,
        block && styles.block,
        {
          backgroundColor: palette.background,
          borderColor: focused ? palette.focusRing : palette.border,
        },
        hovered && SHADOW.medium,
        style,
      ]}
    >
      <Text style={[styles.label, { color: palette.foreground }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

interface ButtonPalette {
  background: string;
  foreground: string;
  border: string;
  focusRing: string;
}

const resolvePalette = (
  variant: LandingButtonVariant,
  colors: ReturnType<typeof useTheme>["colors"],
  isDark: boolean,
): ButtonPalette => {
  if (variant === "primary") {
    return {
      background: colors.terraDark,
      foreground: isDark ? COLORS.ink : COLORS.white,
      border: "transparent",
      focusRing: colors.text,
    };
  }
  if (variant === "secondary") {
    return {
      background: colors.surface,
      foreground: colors.text,
      border: colors.border,
      focusRing: colors.terraDark,
    };
  }
  // `overlay` : posé sur la photo du héros, elle-même assombrie par un voile
  // suffisant pour garantir le contraste du texte blanc.
  return {
    background: "rgba(255,255,255,0.16)",
    foreground: COLORS.white,
    border: "rgba(255,255,255,0.55)",
    focusRing: COLORS.white,
  };
};

const styles = StyleSheet.create({
  root: {
    minHeight: 48,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    // Bordure toujours présente : le focus ne doit pas décaler la mise en page.
    borderWidth: 2,
    cursor: "pointer",
  },
  block: {
    alignSelf: "stretch",
  },
  label: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.lg,
  },
});
