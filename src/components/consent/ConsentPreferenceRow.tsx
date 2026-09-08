import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../../theme";
import Toggle from "../ui/Toggle";

interface ConsentPreferenceRowProps {
  emoji: string;
  title: string;
  description: string;
  value: boolean;
  /** Consentement obligatoire : l'interrupteur est montré actif et figé. */
  locked?: boolean;
  onToggle?: (value: boolean) => void;
}

/**
 * Ligne de préférence de confidentialité.
 *
 * Le caractère obligatoire d'un traitement se lit dans son libellé, pas
 * seulement dans l'interrupteur figé (WCAG 1.4.1).
 */
export const ConsentPreferenceRow: React.FC<ConsentPreferenceRowProps> = ({
  emoji,
  title,
  description,
  value,
  locked,
  onToggle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textLight }]}>{description}</Text>
        </View>
      </View>
      <Toggle
        value={value}
        onToggle={onToggle ?? (() => undefined)}
        disabled={locked}
        trackColor={colors.terra}
        accessibilityLabel={title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, gap: SPACING.sm },
  emoji: { fontSize: 24 },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: F.sans600, fontSize: FONT_SIZE.base },
  description: { fontFamily: F.sans400, fontSize: FONT_SIZE.xs, lineHeight: 17 },
});
