import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { SPACING } from "../../../theme";
import DayCard from "./DayCard";
import { modalStyles as s } from "./itineraryModalStyles";
import type { Colors, GeneratedItinerary } from "./types";

interface Props {
  itinerary: GeneratedItinerary;
  daysInput: string;
  onDaysChange: (v: string) => void;
  loading: boolean;
  onGenerate: () => void;
  onShowCreateStep: () => void;
  onNewSearch: () => void;
  colors: Colors;
}

/** Deuxième étape : aperçu de l'itinéraire généré, jour par jour. */
const ItineraryPreview: React.FC<Props> = ({
  itinerary, daysInput, onDaysChange, loading, onGenerate, onShowCreateStep, onNewSearch, colors,
}) => {
  const { t } = useTranslation();
  const daysCount = Number.parseInt(daysInput, 10);
  const needsRegenerate = daysCount !== itinerary.days?.length;

  return (
    <ScrollView style={s.slotColumn} showsVerticalScrollIndicator={false}>
      <Text style={[s.cityTitle, { color: colors.text }]}>📍 {itinerary.city}</Text>

      <View style={s.stepperRow}>
        <TouchableOpacity
          style={[s.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => onDaysChange(String(Math.max(1, daysCount - 1)))}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("ideas.itinerary.daysPlaceholder")}
        >
          <Ionicons name="remove" size={16} color={colors.terra} />
        </TouchableOpacity>
        <Text style={[s.stepperText, { color: colors.text }]}>
          {daysInput} {t("ideas.addModal.days")}
        </Text>
        <TouchableOpacity
          style={[s.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => onDaysChange(String(Math.min(30, daysCount + 1)))}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("ideas.itinerary.daysPlaceholder")}
        >
          <Ionicons name="add" size={16} color={colors.terra} />
        </TouchableOpacity>
        {needsRegenerate && (
          <TouchableOpacity
            style={[s.regenerateBtn, { backgroundColor: colors.terra, opacity: loading ? 0.6 : 1 }]}
            onPress={onGenerate}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Text style={s.regenerateBtnText}>{t("ideas.itinerary.regenerate")}</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {itinerary.days?.map((day) => (
        <DayCard key={day.day} day={day} colors={colors} />
      ))}

      <TouchableOpacity
        style={[s.primaryBtn, { backgroundColor: colors.terra, marginBottom: SPACING.xs }]}
        onPress={() => { onDaysChange(daysInput); onShowCreateStep(); }}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={s.primaryBtnText}>{t("ideas.itinerary.createTrip")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.terra, marginBottom: SPACING.lg }]}
        onPress={onNewSearch}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={[s.primaryBtnText, { color: colors.terra }]}>{t("ideas.itinerary.newSearch")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ItineraryPreview;
