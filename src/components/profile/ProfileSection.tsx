import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  /** Supprime la marge horizontale, quand un conteneur de page la fournit déjà. */
  fluid?: boolean;
  /** Rend les enfants hors carte (grille de voyages publics, par exemple). */
  bare?: boolean;
}

/**
 * Groupe de lignes de profil : intitulé puis carte.
 *
 * Les séparateurs sont posés ici, entre chaque enfant réellement rendu : une
 * ligne conditionnelle (option premium) ne peut donc pas laisser de trait
 * orphelin.
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  children,
  fluid,
  bare,
}) => {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.section, fluid && styles.sectionFluid]}>
      <Text style={[styles.title, { color: colors.textLight }]}>{title}</Text>
      {bare ? (
        <View style={styles.bare}>{children}</View>
      ) : (
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {rows.map((row, index) => (
            // Liste ordonnée et stable rendue par l'écran appelant, qui porte
            // déjà ses propres clés métier sur chaque ligne.
            <React.Fragment key={index}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: colors.bg }]} />}
              {row}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionFluid: { marginHorizontal: 0, marginBottom: 0 },
  title: {
    fontSize: FONT_SIZE.sm,
    fontFamily: F.sans600,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: "hidden" },
  bare: { gap: SPACING.xs },
  divider: { height: 1, marginLeft: 52 },
});
