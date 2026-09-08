import React, { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

export interface HelpFaqItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  question: string;
  answer: string;
  iconColor: string;
  iconBg: string;
}

interface HelpFaqListProps {
  items: HelpFaqItem[];
  /** Supprime la marge horizontale, quand un conteneur de page la fournit déjà. */
  fluid?: boolean;
}

/** Questions fréquentes, en accordéon à une seule section ouverte. */
export const HelpFaqList: React.FC<HelpFaqListProps> = ({ items, fluid }) => {
  const { colors } = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        fluid && styles.cardFluid,
      ]}
    >
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const highlighted = hoveredId === item.id || focusedId === item.id;

        return (
          <React.Fragment key={item.id}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.bgMid }]} />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.question}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => toggle(item.id)}
              onHoverIn={() => setHoveredId(item.id)}
              onHoverOut={() => setHoveredId(null)}
              onFocus={() => setFocusedId(item.id)}
              onBlur={() => setFocusedId(null)}
              style={({ pressed }) => [
                styles.row,
                highlighted && { backgroundColor: colors.bg },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.focusMarker,
                  { backgroundColor: focusedId === item.id ? colors.terra : "transparent" },
                ]}
              />
              <View style={[styles.iconBg, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={18} color={item.iconColor} />
              </View>
              <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textLight}
              />
            </Pressable>
            {isOpen && (
              <View style={styles.answer}>
                <Text style={[styles.answerText, { color: colors.textMid }]}>{item.answer}</Text>
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 11,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  cardFluid: { marginBottom: 0 },
  divider: { height: 1, marginLeft: 56 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 17,
    cursor: "pointer",
  },
  // Repère de focus en absolu : visible sans décaler la ligne.
  focusMarker: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  pressed: { opacity: 0.7 },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.input,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  question: { flex: 1, fontSize: FONT_SIZE.lg, fontFamily: F.sans600 },
  answer: { paddingHorizontal: 62, paddingBottom: 14 },
  answerText: { fontSize: FONT_SIZE.base, lineHeight: 24, fontFamily: F.sans400 },
});
