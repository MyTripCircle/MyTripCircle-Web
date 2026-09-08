import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { formatDate } from "../../../utils/i18n";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { SPACING } from "../../../theme";
import DateTimeField from "../../ui/DateTimeField";
import { modalStyles as s } from "./itineraryModalStyles";
import type { Colors, GeneratedItinerary } from "./types";

interface Props {
  itinerary: GeneratedItinerary;
  daysInput: string;
  startDate: Date;
  onStartDateChange: (d: Date) => void;
  showDatePicker: boolean;
  onToggleDatePicker: (show: boolean) => void;
  creating: boolean;
  onCreateTrip: () => void;
  onBackFromCreate: () => void;
  colors: Colors;
}

/** Troisième étape : récapitulatif et choix de la date de départ. */
const CreateTripStep: React.FC<Props> = ({
  itinerary, daysInput, startDate, onStartDateChange, showDatePicker,
  onToggleDatePicker, creating, onCreateTrip, onBackFromCreate, colors,
}) => {
  const { t } = useTranslation();
  const { isTabletUp } = useBreakpoint();
  const [tempDate, setTempDate] = useState(startDate);

  const openPicker = () => {
    setTempDate(startDate);
    onToggleDatePicker(true);
  };

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number.parseInt(daysInput, 10) - 1);

  return (
    <ScrollView
      style={s.slotColumn}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={s.backBtn}
        onPress={onBackFromCreate}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={20} color={colors.textMid} />
        <Text style={[s.backBtnText, { color: colors.textMid }]}>{t("ideas.itinerary.back")}</Text>
      </TouchableOpacity>

      <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.summaryCity, { color: colors.text }]}>📍 {itinerary.city}</Text>
        <View style={s.summaryPillRow}>
          <View style={s.summaryPill}>
            <Ionicons name="time-outline" size={13} color={colors.terra} />
            <Text style={[s.summaryPillText, { color: colors.terra }]}>
              {daysInput} {t("ideas.addModal.days")}
            </Text>
          </View>
        </View>
        <View style={[s.summaryDatesBlock, { borderTopColor: colors.border }]}>
          <View style={s.summaryLabelsRow}>
            <View style={s.slotColumn}>
              <Text style={[s.summaryDateLabel, { color: colors.textLight }]}>
                {t("ideas.itinerary.pickStartDate")}
              </Text>
            </View>
            <View style={s.summaryArrowSpace} />
            <View style={s.slotColumn}>
              <Text style={[s.summaryDateLabel, { color: colors.textLight, textAlign: "right" }]}>
                {t("ideas.itinerary.endDate")}
              </Text>
            </View>
          </View>
          <View style={s.summaryValuesRow}>
            <View style={s.slotColumn}>
              <Text style={[s.summaryDateValue, { color: colors.text }]}>{formatDate(startDate)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.border} />
            <View style={s.slotColumn}>
              <Text style={[s.summaryDateValue, { color: colors.text, textAlign: "right" }]}>
                {formatDate(endDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[s.sectionLabel, { color: colors.textMid }]}>
        {t("ideas.itinerary.pickStartDate")}
      </Text>
      <TouchableOpacity
        style={[s.dateField, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={openPicker}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("ideas.itinerary.pickStartDate")}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.terra} />
        <Text style={[s.dateFieldText, { color: colors.text }]}>{formatDate(startDate)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </TouchableOpacity>

      {/* iOS et web : sélecteur en surcouche, avec confirmation explicite. */}
      {Platform.OS !== "android" && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => onToggleDatePicker(false)}
        >
          <TouchableOpacity
            style={[s.datePickerOverlay, isTabletUp && s.datePickerOverlayCentered]}
            activeOpacity={1}
            onPress={() => onToggleDatePicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                s.datePickerSheet,
                isTabletUp && s.datePickerSheetCentered,
                { backgroundColor: colors.bg },
              ]}
            >
              <DateTimeField
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                textColor={colors.text}
                style={s.pickerField}
                accessibilityLabel={t("ideas.itinerary.pickStartDate")}
                onChange={(_, date) => { if (date) setTempDate(date); }}
              />
              <View style={s.datePickerActions}>
                <TouchableOpacity
                  style={[s.datePickerCancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => onToggleDatePicker(false)}
                  accessibilityRole="button"
                >
                  <Text style={[s.primaryBtnText, { color: colors.textMid }]}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.datePickerConfirmBtn, { backgroundColor: colors.terra }]}
                  onPress={() => { onStartDateChange(tempDate); onToggleDatePicker(false); }}
                  accessibilityRole="button"
                >
                  <Text style={s.primaryBtnText}>{t("common.confirm")}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Android : sélecteur natif en ligne. */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimeField
          value={startDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_, date) => {
            onToggleDatePicker(false);
            if (date) onStartDateChange(date);
          }}
        />
      )}

      <TouchableOpacity
        style={[
          s.primaryBtn,
          { backgroundColor: colors.terra, marginTop: SPACING.xl, opacity: creating ? 0.6 : 1 },
        ]}
        onPress={onCreateTrip}
        disabled={creating}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        {creating
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={s.primaryBtnText}>{t("ideas.itinerary.createTrip")}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateTripStep;
