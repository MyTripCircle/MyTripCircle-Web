import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface PlatformInstructionsProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  steps: string[];
}

/** Marche à suivre d'une plateforme pour s'abonner au calendrier. */
export const PlatformInstructions: React.FC<PlatformInstructionsProps> = ({
  icon,
  title,
  steps,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={colors.text} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {steps.map((step, index) => (
        <View key={step} style={styles.step}>
          <View style={[styles.number, { backgroundColor: colors.terraLight }]}>
            <Text style={[styles.numberText, { color: colors.terra }]}>{index + 1}</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.textLight }]}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    gap: 10,
    // Deux cartes côte à côte dans une grille doivent occuper la même hauteur.
    flex: 1,
  },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginBottom: 2 },
  title: { fontSize: FONT_SIZE.base, fontFamily: F.sans600 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  number: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  numberText: { fontSize: FONT_SIZE.xs, fontFamily: F.sans700 },
  stepText: { flex: 1, fontSize: FONT_SIZE.md, fontFamily: F.sans400, lineHeight: 20 },
});
