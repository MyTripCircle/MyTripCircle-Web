import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import { BOOKING_FILTERS, BookingFilterType } from "./bookingsFilters";

interface FilterPillProps {
  filter: BookingFilterType;
  active: boolean;
  /**
   * Repères ajoutés à partir du palier tablette (bordure de survol, graisse de
   * l'état actif) : le rendu mobile reste inchangé au pixel.
   */
  enhanced: boolean;
  onPress: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({ filter, active, enhanced, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [highlighted, setHighlighted] = useState(false);
  const label = t(`bookings.filters.${filter}`);

  const background = (() => {
    if (active) return colors.terra;
    return highlighted ? colors.bgDark : colors.bgMid;
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => setHighlighted(true)}
      onHoverOut={() => setHighlighted(false)}
      onFocus={() => setHighlighted(true)}
      onBlur={() => setHighlighted(false)}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: background },
        enhanced && styles.pillBordered,
        enhanced && highlighted && !active && { borderColor: colors.terra },
        pressed && styles.pillPressed,
      ]}
    >
      {/* La graisse redouble le repère de couleur : l'état actif reste lisible sans elle. */}
      <Text
        style={[
          styles.pillText,
          enhanced && active ? styles.pillTextActive : null,
          { color: active ? colors.white : colors.textMid },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

interface Props {
  selected: BookingFilterType;
  onSelect: (filter: BookingFilterType) => void;
}

/**
 * Barre de filtres des réservations.
 *
 * Sur mobile elle défile horizontalement, faute de place ; dès le palier
 * tablette les pastilles s'étalent sur la largeur disponible et se replient sur
 * plusieurs lignes — plus rien à faire défiler à l'aveugle.
 */
const BookingsFilterBar: React.FC<Props> = ({ selected, onSelect }) => {
  const { t } = useTranslation();
  const { isTabletUp } = useBreakpoint();

  const pills = BOOKING_FILTERS.map((filter) => (
    <FilterPill
      key={filter}
      filter={filter}
      active={selected === filter}
      enhanced={isTabletUp}
      onPress={() => onSelect(filter)}
    />
  ));

  if (isTabletUp) {
    return (
      <View
        accessibilityRole="toolbar"
        accessibilityLabel={t("bookings.filtersLabel")}
        style={styles.wrapRow}
      >
        {pills}
      </View>
    );
  }

  return (
    <View style={styles.mobileWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mobileScroll}
      >
        {pills}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileWrapper: { paddingBottom: 14 },
  mobileScroll: { paddingHorizontal: 24, gap: 10, flexDirection: "row", alignItems: "center" },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    cursor: "pointer",
  },
  // Bordure toujours présente au-delà du mobile : le survol ne décale rien.
  pillBordered: { borderWidth: 1, borderColor: "transparent" },
  pillPressed: { opacity: 0.75 },
  pillText: { fontFamily: F.sans600, fontSize: FONT_SIZE.base },
  pillTextActive: { fontFamily: F.sans700 },
});

export default BookingsFilterBar;
