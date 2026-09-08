import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { TwoColumn } from "../layout";
import { Trip } from "../../types";
import { F, FONT_SIZE, SPACING } from "../../theme";
import { SHADOW } from "../../theme/colors";
import TripHeroStats from "./TripHeroStats";

const SCREEN_WIDTH = Dimensions.get("window").width;

const formatShortDate = (date: Date, monthsShort: string[]): string => {
  const d = new Date(date);
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
};

interface Props {
  trip: Trip;
  photoUri: string;
  daysUntil: number;
  onPress: () => void;
}

/**
 * Voyage mis en avant.
 *
 * Sur desktop la carte s'étale sur la colonne principale et ses chiffres clés
 * passent en colonne latérale : une bannière large plutôt qu'un empilement
 * vertical d'éléments calibrés pour une colonne de téléphone.
 */
const TripHeroCard: React.FC<Props> = ({ trip, photoUri, daysUntil, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  const monthsShort = t("trips.months").split(",");

  const now = new Date();
  const hasStarted = now >= new Date(trip.startDate);
  let statusLabel: string;
  if (trip.status === "draft") {
    statusLabel = t("trips.statusDraft");
  } else if (hasStarted) {
    statusLabel = t("trips.statusActive");
  } else {
    statusLabel = t("trips.statusUpcoming");
  }

  const card = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={trip.title}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.heroCard,
        isTabletUp ? styles.heroCardFluid : styles.heroCardMobile,
        hovered && SHADOW.medium,
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: photoUri }} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.72)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.heroStatusBadge}>
        <Text style={styles.heroStatusText}>{statusLabel}</Text>
      </View>
      <View style={[styles.heroArrowBtn, hovered && styles.heroArrowBtnHovered]}>
        <Ionicons name="arrow-forward-outline" size={16} color={colors.terraDark} />
      </View>
      <View style={[styles.heroBottom, isTabletUp && styles.heroBottomWide]}>
        <Text style={[styles.heroTitle, isTabletUp && styles.heroTitleWide]} numberOfLines={1}>
          {trip.title}
        </Text>
        <Text style={[styles.heroMeta, isTabletUp && styles.heroMetaWide]} numberOfLines={1}>
          📍 {trip.destination} · {formatShortDate(trip.startDate, monthsShort)}–{formatShortDate(trip.endDate, monthsShort)}
        </Text>
      </View>
    </Pressable>
  );

  if (isDesktopUp) {
    return (
      <TwoColumn
        main={card}
        aside={<TripHeroStats trip={trip} daysUntil={daysUntil} stacked />}
        asideWidth={260}
        gap={SPACING.lg}
      />
    );
  }

  return (
    <>
      {card}
      <TripHeroStats trip={trip} daysUntil={daysUntil} />
    </>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    cursor: "pointer",
  },
  heroCardMobile: {
    width: SCREEN_WIDTH - 28,
    aspectRatio: 202 / 128,
    alignSelf: "center",
    marginBottom: 8,
  },
  heroCardFluid: { width: "100%", height: 320 },
  pressed: { opacity: 0.88 },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroStatusBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroStatusText: { fontSize: 12, color: "#FFFFFF", fontFamily: F.sans500 },
  heroArrowBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroArrowBtnHovered: { backgroundColor: "#FFFFFF" },
  heroBottom: { paddingHorizontal: 16, paddingBottom: 18 },
  heroBottomWide: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  heroTitle: { fontSize: 22, fontFamily: F.sans700, color: "#FFFFFF", marginBottom: 4 },
  heroTitleWide: { fontSize: FONT_SIZE.hero, marginBottom: SPACING.xxs },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: F.sans400 },
  heroMetaWide: { fontSize: FONT_SIZE.lg, color: "rgba(255,255,255,0.85)" },
});

export default TripHeroCard;
