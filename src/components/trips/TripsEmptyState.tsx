import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F, SPACING } from "../../theme";
import TripCreateButton from "./TripCreateButton";
import TripNewCard from "./TripNewCard";

interface Props {
  onCreate: () => void;
  disabled?: boolean;
}

/**
 * Écran vide des voyages.
 *
 * Dès la tablette, la carte pointillée du carrousel mobile laisse place à un
 * appel à l'action explicite, centré sous le message — la largeur disponible
 * rendrait une carte de 190 px orpheline.
 */
const TripsEmptyState: React.FC<Props> = ({ onCreate, disabled }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  return (
    <>
      <View style={[styles.emptyContainer, isTabletUp && styles.emptyContainerWide]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.terraLight }]}>
          <Ionicons name="airplane-outline" size={40} color={colors.terra} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("trips.emptyTitle")}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMid }]}>
          {t("trips.emptySubtitle")}
        </Text>
        {isTabletUp && (
          <View style={styles.emptyAction}>
            <TripCreateButton onPress={onCreate} disabled={disabled} />
          </View>
        )}
      </View>

      {!isTabletUp && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.miniScroll}
        >
          <TripNewCard onPress={onCreate} disabled={disabled} />
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 60,
    paddingBottom: 32,
  },
  emptyContainerWide: { paddingHorizontal: 0, paddingTop: SPACING.xxl, maxWidth: 520, alignSelf: "center" },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontFamily: F.sans700, marginBottom: 8, textAlign: "center" },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: F.sans400,
  },
  emptyAction: { marginTop: SPACING.md },
  miniScroll: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
});

export default TripsEmptyState;
