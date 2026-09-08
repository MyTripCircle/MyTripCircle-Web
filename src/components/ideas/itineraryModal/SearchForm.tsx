import React from "react";
import { TextInput, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

import { modalStyles as s } from "./itineraryModalStyles";
import type { Colors } from "./types";

interface Props {
  cityInput: string;
  onCityChange: (v: string) => void;
  daysInput: string;
  onDaysChange: (v: string) => void;
  loading: boolean;
  onGenerate: () => void;
  colors: Colors;
}

/** Première étape : ville et durée souhaitées. */
const SearchForm: React.FC<Props> = ({
  cityInput, onCityChange, daysInput, onDaysChange, loading, onGenerate, colors,
}) => {
  const { t } = useTranslation();
  const disabled = loading || !cityInput.trim();

  return (
    <>
      <TextInput
        style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder={t("ideas.itinerary.cityPlaceholder")}
        placeholderTextColor={colors.textLight}
        value={cityInput}
        onChangeText={onCityChange}
        returnKeyType="next"
        autoCapitalize="words"
        accessibilityLabel={t("ideas.itinerary.cityPlaceholder")}
      />
      <TextInput
        style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder={t("ideas.itinerary.daysPlaceholder")}
        placeholderTextColor={colors.textLight}
        value={daysInput}
        onChangeText={onDaysChange}
        keyboardType="number-pad"
        accessibilityLabel={t("ideas.itinerary.daysPlaceholder")}
      />
      <TouchableOpacity
        style={[s.primaryBtn, { backgroundColor: colors.terra, opacity: disabled ? 0.6 : 1 }]}
        onPress={onGenerate}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        {loading
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={s.primaryBtnText}>{t("ideas.itinerary.generate")}</Text>
        }
      </TouchableOpacity>
    </>
  );
};

export default SearchForm;
