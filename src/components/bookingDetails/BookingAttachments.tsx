import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../theme";
import { CardGrid } from "../layout";

// Les pièces jointes sont stockées « nom::uri » ; les anciennes n'ont que l'uri.
const parseAttachment = (raw: string): { name: string; uri: string } => {
  if (raw.includes("::")) {
    const [name, uri] = raw.split("::");
    return { name, uri };
  }
  return { name: raw.split("/").pop() || raw, uri: raw };
};

const IMAGE_URI = /\.(png|jpe?g|gif|webp|heic|heif)($|\?)/i;

interface TileProps {
  name: string;
  uri: string;
  onPress: () => void;
}

/** Vignette de galerie : aperçu quand la pièce jointe est une image, icône sinon. */
const AttachmentTile: React.FC<TileProps> = ({ name, uri, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const showPreview = IMAGE_URI.test(uri) && !previewFailed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("bookings.details.viewAttachment")} : ${name}`}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.surface, borderColor: hovered ? colors.terra : colors.border },
        hovered && SHADOW.medium,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.tilePreview, { backgroundColor: colors.bgMid }]}>
        {showPreview ? (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            onError={() => setPreviewFailed(true)}
            accessibilityLabel={name}
          />
        ) : (
          <Ionicons name="document-text-outline" size={30} color={colors.textMid} />
        )}
      </View>
      <View style={styles.tileFooter}>
        <Text style={[styles.tileName, { color: colors.text }]} numberOfLines={1}>{name}</Text>
        <Ionicons name="open-outline" size={16} color={colors.textLight} />
      </View>
    </Pressable>
  );
};

interface Props {
  attachments: string[];
  onOpen: (uri: string) => void;
  /** "row" : bandeau défilant mobile. "grid" : galerie web. */
  layout: "row" | "grid";
}

const BookingAttachments: React.FC<Props> = ({ attachments, onOpen, layout }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (attachments.length === 0) return null;

  if (layout === "grid") {
    return (
      <View style={styles.gridSection}>
        <Text style={[styles.gridTitle, { color: colors.text }]}>
          {t("bookings.details.attachments")}
        </Text>
        <CardGrid minColumnWidth={200} gap={SPACING.md}>
          {attachments.map((attachment) => {
            const { name, uri } = parseAttachment(attachment);
            return <AttachmentTile key={attachment} name={name} uri={uri} onPress={() => onOpen(uri)} />;
          })}
        </CardGrid>
      </View>
    );
  }

  return (
    <View style={styles.rowSection}>
      <Text style={[styles.rowSectionLabel, { color: colors.textLight }]}>
        {t("bookings.details.attachmentsSectionTitle")}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {attachments.map((attachment) => {
          const { name, uri } = parseAttachment(attachment);
          return (
            <TouchableOpacity
              key={attachment}
              accessibilityRole="button"
              accessibilityLabel={`${t("bookings.details.viewAttachment")} : ${name}`}
              style={[styles.chip, { backgroundColor: colors.bgMid }]}
              onPress={() => onOpen(uri)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, { color: colors.textMid }]}>📄 {name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rowSection: { marginHorizontal: 18, marginBottom: 12 },
  rowSectionLabel: {
    fontSize: 12,
    fontFamily: F.sans600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  rowScroll: { gap: 8, paddingRight: 4 },
  chip: {
    borderRadius: RADIUS.input,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  chipText: { fontSize: 12, fontFamily: F.sans400 },

  gridSection: { gap: SPACING.sm },
  gridTitle: { fontSize: FONT_SIZE.h3, fontFamily: F.sans700 },
  tile: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    overflow: "hidden",
    cursor: "pointer",
  },
  pressed: { opacity: 0.85 },
  tilePreview: { height: 120, justifyContent: "center", alignItems: "center" },
  tileFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tileName: { flex: 1, fontSize: FONT_SIZE.sm, fontFamily: F.sans500 },
});

export default BookingAttachments;
