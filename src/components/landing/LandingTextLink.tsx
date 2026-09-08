import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface LandingTextLinkProps {
  label: string;
  onPress: () => void;
  /**
   * `always` pour les liens listés (pied de page) : le soulignement les
   * distingue du texte courant sans recourir à la seule couleur (WCAG 1.4.1).
   */
  underline?: "always" | "hover";
}

/** Lien textuel de la page d'accueil publique : en-tête et pied de page. */
export const LandingTextLink: React.FC<LandingTextLinkProps> = ({
  label,
  onPress,
  underline = "hover",
}) => {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const underlined = underline === "always" || hovered || focused;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.root, { borderColor: focused ? colors.terraDark : "transparent" }]}
    >
      <Text
        style={[
          styles.label,
          { color: colors.text },
          underlined && styles.underlined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.sm,
    // Bordure permanente : l'anneau de focus ne doit pas déplacer le texte.
    borderWidth: 2,
    cursor: "pointer",
  },
  label: {
    fontFamily: F.sans500,
    fontSize: FONT_SIZE.base,
  },
  underlined: {
    textDecorationLine: "underline",
  },
});
