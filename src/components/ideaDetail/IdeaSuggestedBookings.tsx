import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { TripIdea, SuggestedBooking } from "../../data/tripIdeas";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F } from "../../theme/fonts";

interface ThemeColors {
  text: string;
  textLight: string;
  surface: string;
  border: string;
  bgMid: string;
  terraLight: string;
  terra: string;
}

const BOOKING_ICONS: Record<string, string> = {
  flight: "airplane",
  hotel: "bed",
  activity: "bicycle",
  restaurant: "restaurant",
};

interface Props {
  idea: TripIdea;
  lang: "fr" | "en";
  colors: ThemeColors;
}

/**
 * Réservations suggérées pour l'itinéraire.
 *
 * Section pleine largeur sous l'itinéraire sur mobile ; carte de la colonne
 * latérale, aux côtés de l'action principale, dès la tablette. Les lignes de
 * réservation passent alors sur `bgMid` pour rester lisibles sur le fond
 * `surface` de la carte.
 */
const IdeaSuggestedBookings: React.FC<Props> = ({ idea, lang, colors }) => {
  const { t } = useTranslation();
  const { isTabletUp } = useBreakpoint();
  const rowBg = isTabletUp ? colors.bgMid : colors.surface;

  return (
    <View
      style={
        isTabletUp
          ? [s.asideCard, { backgroundColor: colors.surface, borderColor: colors.border }]
          : [s.section, s.sectionMobileInset]
      }
    >
      <Text style={[s.sectionTitle, { color: colors.text }]}>
        {t("ideas.detail.suggestedBookings")}
      </Text>
      <Text style={[s.suggestedNote, { color: colors.textLight }]}>
        {t("ideas.detail.suggestedNote")}
      </Text>
      {idea.suggestedBookings.map((b: SuggestedBooking) => {
        const title = lang === "fr" ? b.titleFr : b.titleEn;
        return (
          <View key={title} style={[s.bookingRow, { backgroundColor: rowBg, borderColor: colors.border }]}>
            <View style={[s.bookingIconBg, { backgroundColor: colors.terraLight }]}>
              <Ionicons name={BOOKING_ICONS[b.type] as keyof typeof Ionicons.glyphMap} size={16} color={colors.terra} />
            </View>
            <Text style={[s.bookingTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            {b.estimatedPrice != null && (
              <Text style={[s.bookingPrice, { color: colors.textLight }]}>
                ~{b.estimatedPrice} {b.currency}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  section: { paddingTop: 28, paddingBottom: 16 },
  sectionMobileInset: { paddingHorizontal: 24 },
  asideCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  sectionTitle: { fontFamily: F.sans700, fontSize: 22, marginBottom: 16 },
  suggestedNote: {
    fontFamily: F.sans400,
    fontSize: 15,
    marginTop: -8,
    marginBottom: 14,
    lineHeight: 22,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
  },
  bookingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bookingTitle: { fontFamily: F.sans500, fontSize: 16, flex: 1 },
  bookingPrice: { fontFamily: F.sans400, fontSize: 15, flexShrink: 0 },
});

export default IdeaSuggestedBookings;
