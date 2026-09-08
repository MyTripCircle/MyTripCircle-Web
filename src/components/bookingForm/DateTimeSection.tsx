import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Booking } from "../../types";
import { formatDate } from "../../utils/i18n";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useBookingForm, needsEndDate, isTransport } from "../../hooks/useBookingForm";

type FormHandle = ReturnType<typeof useBookingForm>;
type ThemeColors = ReturnType<typeof useTheme>["colors"];

function getDateFieldLabel(t: (k: string) => string, type: Booking["type"], direction: string | undefined): string {
  if (needsEndDate(type, direction)) {
    return type === "hotel" ? t("bookings.startDate") : t("bookings.departureDate");
  }
  return isTransport(type) ? t("bookings.departureDate") : t("bookings.date");
}

interface Props {
  form: FormHandle;
  colors: ThemeColors;
  t: (key: string) => string;
}

/**
 * Champs de date/heure du formulaire réservation : départ, date de fin
 * (hôtel), date et heure de retour (aller-retour vol/train).
 *
 * Les sélecteurs eux-mêmes (modale iOS/web, dialogue Android) restent pilotés
 * par `BookingForm` : ce composant ne fait qu'ouvrir/afficher les champs.
 */
const DateTimeSection: React.FC<Props> = ({ form, colors, t }) => (
  <>
    <View style={styles.dateRow}>
      <TouchableOpacity
        style={[styles.fieldBox, styles.dateRowItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => form.setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
          {getDateFieldLabel(t, form.formData.type, form.formData.tripDirection)}
        </Text>
        <Text style={[styles.fieldValue, { color: colors.text }]}>{formatDate(form.formData.date)}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.fieldBox, styles.dateRowItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => form.setShowTimePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
          {isTransport(form.formData.type) ? t("bookings.departureTime") : t("bookings.time")}
        </Text>
        <Text style={[styles.fieldValue, { color: form.formData.time ? colors.text : colors.textLight }]}>
          {form.formData.time || "12:00"}
        </Text>
      </TouchableOpacity>
    </View>

    {needsEndDate(form.formData.type, form.formData.tripDirection) && form.formData.type === "hotel" && (
      <TouchableOpacity
        style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.endDate ? styles.fieldBoxError : null]}
        onPress={() => form.setShowEndDatePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.endDate")} *</Text>
        <Text style={[styles.fieldValue, { color: colors.text }]}>{formatDate(form.formData.endDate || new Date())}</Text>
        {form.fieldErrors.endDate ? <Text style={styles.inlineError}>{form.fieldErrors.endDate}</Text> : null}
      </TouchableOpacity>
    )}

    {needsEndDate(form.formData.type, form.formData.tripDirection) && isTransport(form.formData.type) && (
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.fieldBox, styles.dateRowItem, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.endDate ? styles.fieldBoxError : null]}
          onPress={() => form.setShowEndDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.directionLabels.return")} *</Text>
          <Text style={[styles.fieldValue, { color: colors.text }]}>{formatDate(form.formData.endDate || new Date())}</Text>
          {form.fieldErrors.endDate ? <Text style={styles.inlineError}>{form.fieldErrors.endDate}</Text> : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fieldBox, styles.dateRowItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => form.setShowReturnTimePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.time")}</Text>
          <Text style={[styles.fieldValue, { color: form.formData.returnTime ? colors.text : colors.textLight }]}>
            {form.formData.returnTime || "12:00"}
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
  fieldBox: {
    backgroundColor: "#FFFFFF", borderRadius: RADIUS.card, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 16, marginHorizontal: 20, marginBottom: 12,
  },
  fieldLabel: { fontSize: 13, fontFamily: F.sans400, marginBottom: 6 },
  fieldValue: { fontSize: 18, fontFamily: F.sans400 },
  fieldBoxError: { borderColor: "#C04040", borderWidth: 1.5 },
  inlineError: { fontSize: 12, color: "#C04040", marginTop: 4, fontFamily: F.sans400 },
  dateRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 0, gap: 10 },
  dateRowItem: { flex: 1, marginHorizontal: 0, marginBottom: 10 },
});

export default DateTimeSection;
