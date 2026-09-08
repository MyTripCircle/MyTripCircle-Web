import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { TripIdea } from "../../data/tripIdeas";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F } from "../../theme/fonts";

interface ThemeColors {
  text: string;
  textMid: string;
  textLight: string;
  surface: string;
  border: string;
  terraLight: string;
  terra: string;
}

interface Props {
  idea: TripIdea;
  lang: "fr" | "en";
  customDays: number;
  colors: ThemeColors;
}

/** Clé de traduction et émoji de chacun des trois moments de la journée. */
const DAY_PARTS = [
  { key: "ideas.itinerary.morning", emoji: "🌅" },
  { key: "ideas.itinerary.afternoon", emoji: "☀️" },
  { key: "ideas.itinerary.evening", emoji: "🌙" },
] as const;

interface DaySlotsProps {
  buckets: string[][];
  colors: ThemeColors;
}

/**
 * Les activités d'une journée réparties en trois colonnes matin/après-midi/soir.
 *
 * La donnée n'a pas de créneaux nommés : les deux premières activités portent
 * les deux premières colonnes, et toute activité supplémentaire rejoint la
 * colonne du soir plutôt que d'inventer un quatrième créneau.
 */
const DaySlots: React.FC<DaySlotsProps> = ({ buckets, colors }) => {
  const { t } = useTranslation();
  return (
    <View style={s.slotsRow}>
      {DAY_PARTS.map((part, index) => {
        const activities = buckets[index];
        if (activities.length === 0) return null;
        return (
          <View key={part.key} style={s.slotColumn}>
            <Text style={[s.slotLabel, { color: colors.terra }]}>
              {part.emoji} {t(part.key)}
            </Text>
            {activities.map((act) => (
              <View key={act} style={s.activityRow}>
                <View style={[s.activityBullet, { backgroundColor: colors.terra }]} />
                <Text style={[s.activityText, { color: colors.textMid }]}>{act}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const IdeaItinerary: React.FC<Props> = ({ idea, lang, customDays, colors }) => {
  const { t } = useTranslation();
  const { isTabletUp } = useBreakpoint();
  const highlights = lang === "fr" ? idea.highlightsFr : idea.highlightsEn;

  return (
    <>
      <View style={[s.section, !isTabletUp && s.sectionMobileInset]}>
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          {t("ideas.detail.highlights")}
        </Text>
        {highlights.map((h) => (
          <View key={h} style={s.highlightRow}>
            <View style={[s.highlightDot, { backgroundColor: colors.terra }]} />
            <Text style={[s.highlightText, { color: colors.textMid }]}>{h}</Text>
          </View>
        ))}
      </View>

      <View style={[s.section, s.lastSection, !isTabletUp && s.sectionMobileInset]}>
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          {t("ideas.detail.itinerary", { count: customDays })}
        </Text>
        {idea.itinerary.slice(0, customDays).map((day) => {
          const dayTitle = lang === "fr" ? day.titleFr : day.titleEn;
          const activities = lang === "fr" ? day.activitiesFr : day.activitiesEn;
          // Les activités au-delà de la 3e rejoignent la colonne du soir.
          const buckets: string[][] = [[], [], []];
          activities.forEach((act, index) => buckets[Math.min(index, 2)].push(act));

          return (
            <View
              key={day.day}
              style={[s.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={s.dayHeader}>
                <View style={[s.dayBadge, { backgroundColor: colors.terra }]}>
                  <Text style={s.dayBadgeText}>{day.day}</Text>
                </View>
                <Text style={[s.dayTitle, { color: colors.text }]}>{dayTitle}</Text>
              </View>

              {isTabletUp ? (
                <DaySlots buckets={buckets} colors={colors} />
              ) : (
                <View style={s.activitiesList}>
                  {activities.map((act) => (
                    <View key={act} style={s.activityRow}>
                      <View style={[s.activityBullet, { backgroundColor: colors.terra }]} />
                      <Text style={[s.activityText, { color: colors.textMid }]}>{act}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </>
  );
};

const s = StyleSheet.create({
  section: { paddingTop: 28 },
  // Dès la tablette, `PageContainer` porte déjà la marge horizontale de la page.
  sectionMobileInset: { paddingHorizontal: 24 },
  lastSection: { paddingBottom: 16 },
  sectionTitle: { fontFamily: F.sans700, fontSize: 22, marginBottom: 16 },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 12,
  },
  highlightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 7,
    flexShrink: 0,
  },
  highlightText: { fontFamily: F.sans400, fontSize: 16, lineHeight: 24, flex: 1 },
  dayCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 14 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  dayBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayBadgeText: { fontFamily: F.sans700, fontSize: 15, color: "#FFFFFF" },
  dayTitle: { fontFamily: F.sans600, fontSize: 17, flex: 1 },
  activitiesList: { paddingLeft: 52, gap: 8 },
  // Les trois colonnes du jour ne sont plus indentées sous le badge : chacune
  // porte son propre en-tête de créneau et son propre espacement vertical.
  slotsRow: { flexDirection: "row", gap: 20 },
  slotColumn: { flex: 1, gap: 8 },
  slotLabel: {
    fontFamily: F.sans600,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  activityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
    opacity: 0.6,
    flexShrink: 0,
  },
  activityText: { fontFamily: F.sans400, fontSize: 15, lineHeight: 23, flex: 1 },
});

export default IdeaItinerary;
