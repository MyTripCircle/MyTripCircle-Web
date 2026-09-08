import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Booking } from "../../types";
import { formatDateLong } from "../../utils/i18n";
import { useTheme } from "../../contexts/ThemeContext";
import { RADIUS } from "../../theme";
import { F } from "../../theme/fonts";
import { getGridThirdLabel } from "./bookingDetailsLabels";

interface Props {
  booking: Booking;
}

/** Trois informations clés en pastilles, mise en page mobile de l'écran de détail. */
const BookingInfoPills: React.FC<Props> = ({ booking }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
        <Text style={[styles.label, { color: colors.textLight }]}>{t("bookings.details.date")}</Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={2}>
          {formatDateLong(booking.date)}
          {booking.endDate ? `\n– ${formatDateLong(booking.endDate)}` : ""}
        </Text>
      </View>
      <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
        <Text style={[styles.label, { color: colors.textLight }]}>{t("bookings.details.time")}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{booking.time || "–"}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
        <Text style={[styles.label, { color: colors.textLight }]}>
          {getGridThirdLabel(t, booking.type)}
        </Text>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {booking.confirmationNumber || "–"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 18, paddingVertical: 14 },
  pill: { flex: 1, minWidth: 80, borderRadius: RADIUS.input, paddingHorizontal: 12, paddingVertical: 8 },
  label: { fontSize: 11, fontFamily: F.sans400, marginBottom: 3 },
  value: { fontSize: 14, fontFamily: F.sans600, lineHeight: 19 },
});

export default BookingInfoPills;
