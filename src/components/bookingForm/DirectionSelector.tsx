import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Booking } from "../../types";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

type Direction = NonNullable<Booking["tripDirection"]>;
const DIRECTIONS: Direction[] = ["outbound", "return", "roundtrip"];

interface Props {
  value: Booking["tripDirection"];
  onChange: (direction: Direction) => void;
  colors: any;
  t: (key: string) => string;
}

/** Aller / retour / aller-retour, pour les réservations de transport (vol, train). */
const DirectionSelector: React.FC<Props> = ({ value, onChange, colors, t }) => (
  <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.direction")}</Text>
    <View style={styles.row}>
      {DIRECTIONS.map((dir) => (
        <TouchableOpacity
          key={dir}
          style={[
            styles.pill,
            { borderColor: colors.border, backgroundColor: colors.bgMid },
            value === dir && { backgroundColor: colors.terra, borderColor: colors.terra },
          ]}
          onPress={() => onChange(dir)}
          activeOpacity={0.75}
        >
          <Text style={[styles.pillText, { color: colors.textMid }, value === dir && { color: "#FFFFFF" }]}>
            {t(`bookings.directionLabels.${dir}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  fieldBox: {
    backgroundColor: "#FFFFFF", borderRadius: RADIUS.card, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 16, marginHorizontal: 20, marginBottom: 12,
  },
  fieldLabel: { fontSize: 13, fontFamily: F.sans400, marginBottom: 6 },
  row: { flexDirection: "row", gap: 8, marginTop: 4 },
  pill: {
    flex: 1, paddingVertical: 9, paddingHorizontal: 4,
    borderRadius: RADIUS.button, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  pillText: { fontSize: 14, fontFamily: F.sans600 },
});

export default DirectionSelector;
