import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "../../types";
import { SHADOW } from "../../theme";
import { getTypeIcon, getIconColors, getTagColors, getTagLabel } from "./addressHelpers";
import { styles } from "./addressStyles";

interface AddressCardProps {
  item: Address;
  colors: any;
  isDark?: boolean;
  t: (k: string) => string;
  onPress: (address: Address) => void;
  /** Surbrillance dans le panneau latéral de la carte plein écran (palier desktop). */
  selected?: boolean;
  /** Affiche un repère « Non localisée » quand l'adresse n'a pas encore de coordonnées géocodées. */
  unlocated?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
  item,
  colors,
  isDark = false,
  t,
  onPress,
  selected = false,
  unlocated = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const ic = getIconColors(item.type, isDark);
  const tag = getTagColors(item.type, isDark);
  const iconBg = ic.bg ?? colors.bgDark;
  const iconColor = ic.icon ?? colors.textMid;
  const tagBg = tag.bg ?? colors.bgDark;
  const tagText = tag.text ?? colors.textMid;

  const borderColor = (() => {
    if (selected) return colors.terra;
    if (focused) return colors.terraDark;
    return hovered ? colors.terra : colors.border;
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={() => onPress(item)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.addressCard,
        { backgroundColor: selected ? colors.terraLight : colors.surface, borderColor },
        (hovered || focused) && SHADOW.medium,
        pressed && cardStyles.pressed,
      ]}
    >
      <View style={[styles.addressIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={getTypeIcon(item.type) as keyof typeof Ionicons.glyphMap} size={26} color={iconColor} />
      </View>
      <View style={styles.addressInfo}>
        <Text style={[styles.addressName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.addressDetail, { color: colors.textLight }]} numberOfLines={1}>
          {item.city}, {item.country}
        </Text>
        {unlocated ? (
          <Text style={[cardStyles.unlocated, { color: colors.textLight }]} numberOfLines={1}>
            {t("addresses.map.notLocated")}
          </Text>
        ) : null}
      </View>
      <View style={[styles.tagPill, { backgroundColor: tagBg }]}>
        <Text style={[styles.tagText, { color: tagText }]}>
          {getTagLabel(item.type, t)}
        </Text>
      </View>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  unlocated: { fontSize: 12, marginTop: 3, fontStyle: "italic" },
});

export default AddressCard;
