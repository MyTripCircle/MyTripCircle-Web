import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { modalStyles as s } from "./itineraryModalStyles";
import type { Colors, ItineraryDay, ItinerarySlot } from "./types";

interface Props {
  day: ItineraryDay;
  colors: Colors;
}

interface Slot {
  emoji: string;
  label: string;
  data?: ItinerarySlot;
}

const SlotBlock: React.FC<{ slot: Slot; colors: Colors; stacked: boolean }> = ({
  slot, colors, stacked,
}) => (
  <View style={stacked ? s.slotRow : [s.slotRow, s.slotColumn]}>
    <Text style={s.slotEmoji}>{slot.emoji}</Text>
    <View style={s.slotColumn}>
      <Text style={[s.slotLabel, { color: colors.textMid }]}>{slot.label}</Text>
      <Text style={[s.slotActivity, { color: colors.text }]}>{slot.data?.activity}</Text>
      {slot.data?.tip ? (
        <Text style={[s.slotTip, { color: colors.textLight }]}>💡 {slot.data.tip}</Text>
      ) : null}
    </View>
  </View>
);

/**
 * Journée d'itinéraire.
 *
 * Les trois créneaux s'empilent sur mobile, faute de largeur ; dès le palier
 * tablette ils se lisent côte à côte, ce qui donne d'un coup d'œil la forme de
 * la journée plutôt qu'une liste à dérouler.
 */
const DayCard: React.FC<Props> = ({ day, colors }) => {
  const { t } = useTranslation();
  const { isTabletUp } = useBreakpoint();

  const slots: Slot[] = [
    { emoji: "🌅", label: t("ideas.itinerary.morning"), data: day.morning },
    { emoji: "☀️", label: t("ideas.itinerary.afternoon"), data: day.afternoon },
    { emoji: "🌙", label: t("ideas.itinerary.evening"), data: day.evening },
  ];
  const filled = slots.filter((slot) => slot.data);

  return (
    <View style={[s.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[s.dayTitle, { color: colors.terra }]}>
        {t("ideas.itinerary.day")} {day.day} — {day.title}
      </Text>
      <View style={isTabletUp ? s.slotsRow : undefined}>
        {filled.map((slot) => (
          <SlotBlock key={slot.label} slot={slot} colors={colors} stacked={!isTabletUp} />
        ))}
      </View>
    </View>
  );
};

export default DayCard;
