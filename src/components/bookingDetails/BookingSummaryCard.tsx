import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Booking } from "../../types";
import { formatDateLong, getBookingStatusTranslation } from "../../utils/i18n";
import { getBookingStatusColorsDetail } from "../../utils/bookingHelpers";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import { getGridThirdLabel } from "./bookingDetailsLabels";

interface RowProps {
  label: string;
  children: React.ReactNode;
}

const SummaryRow: React.FC<RowProps> = ({ label, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderTopColor: colors.borderLight }]}>
      <Text style={[styles.label, { color: colors.textLight }]}>{label}</Text>
      {children}
    </View>
  );
};

interface Props {
  booking: Booking;
}

/**
 * Colonne latérale de l'écran de détail au palier desktop : les métadonnées
 * quittent le fil de lecture pour former un encart consultable d'un coup d'œil.
 */
const BookingSummaryCard: React.FC<Props> = ({ booking }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const statusColors = getBookingStatusColorsDetail(booking.status);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("bookings.details.summaryTitle")}</Text>

      <SummaryRow label={t("bookings.details.date")}>
        <Text style={[styles.value, { color: colors.text }]}>
          {formatDateLong(booking.date)}
          {booking.endDate ? `\n– ${formatDateLong(booking.endDate)}` : ""}
        </Text>
      </SummaryRow>

      <SummaryRow label={t("bookings.details.time")}>
        <Text style={[styles.value, { color: colors.text }]}>{booking.time || "–"}</Text>
      </SummaryRow>

      <SummaryRow label={getGridThirdLabel(t, booking.type)}>
        <Text style={[styles.value, { color: colors.text }]} selectable>
          {booking.confirmationNumber || "–"}
        </Text>
      </SummaryRow>

      <SummaryRow label={t("bookings.statusLabel")}>
        <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.badgeText, { color: statusColors.color }]}>
            {booking.status ? getBookingStatusTranslation(booking.status) : t("common.unknown")}
          </Text>
        </View>
      </SummaryRow>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
    paddingTop: SPACING.md,
  },
  title: { fontSize: FONT_SIZE.lg, fontFamily: F.sans700, marginBottom: SPACING.xs },
  row: { borderTopWidth: 1, paddingVertical: SPACING.sm, gap: SPACING.xxs },
  label: { fontSize: FONT_SIZE.xs, fontFamily: F.sans400 },
  value: { fontSize: FONT_SIZE.base, fontFamily: F.sans600, lineHeight: 21 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  badgeText: { fontSize: FONT_SIZE.sm, fontFamily: F.sans600 },
});

export default BookingSummaryCard;
