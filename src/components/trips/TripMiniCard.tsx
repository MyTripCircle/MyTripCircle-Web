import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { Trip } from "../../types";
import { F, FONT_SIZE, SPACING } from "../../theme";
import { SHADOW } from "../../theme/colors";

const formatShortDate = (date: Date, monthsShort: string[]): string => {
  const d = new Date(date);
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
};

interface Props {
  trip: Trip;
  photoUri: string;
  onPress: () => void;
  /**
   * Laisse la grille imposer la largeur, au lieu des 190 px du carrousel
   * mobile. La carte gagne alors la destination, que la largeur permet.
   */
  fluid?: boolean;
}

const TripMiniCard: React.FC<Props> = ({ trip, photoUri, onPress, fluid = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const monthsShort = t("trips.months").split(",");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={trip.title}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.miniCard,
        fluid ? styles.miniCardFluid : styles.miniCardFixed,
        { backgroundColor: colors.bgMid },
        hovered && SHADOW.medium,
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: photoUri }}
        style={fluid ? styles.miniPhotoFluid : styles.miniPhoto}
        resizeMode="cover"
      />
      <View style={[styles.miniBottom, fluid && styles.miniBottomFluid]}>
        <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>{trip.title}</Text>
        {fluid && trip.destination ? (
          <Text style={[styles.miniDest, { color: colors.textMid }]} numberOfLines={1}>
            📍 {trip.destination}
          </Text>
        ) : null}
        <Text style={[styles.miniDate, { color: colors.textLight }]}>
          {formatShortDate(trip.startDate, monthsShort)}–{formatShortDate(trip.endDate, monthsShort)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  miniCard: { borderRadius: 16, overflow: "hidden", cursor: "pointer" },
  miniCardFixed: { width: 190, height: 176 },
  miniCardFluid: { width: "100%", height: 240 },
  pressed: { opacity: 0.85 },
  miniPhoto: { width: 190, height: 112 },
  miniPhotoFluid: { width: "100%", height: 150 },
  miniBottom: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, justifyContent: "center" },
  miniBottomFluid: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 2 },
  miniName: { fontSize: 16, fontFamily: F.sans600 },
  miniDest: { fontSize: FONT_SIZE.md, fontFamily: F.sans400 },
  miniDate: { fontSize: 13, fontFamily: F.sans400, marginTop: 2 },
});

export default TripMiniCard;
