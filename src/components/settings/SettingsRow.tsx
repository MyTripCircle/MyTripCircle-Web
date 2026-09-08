import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { settingsStyles as styles } from "./settingsStyles";

interface SettingsRowProps {
  emoji: string;
  title: string;
  /** Contrôle placé à droite : interrupteur, badge… Absent pour une navigation. */
  control?: React.ReactNode;
  /** Valeur courante affichée avant le chevron (langue sélectionnée, devise…). */
  value?: string;
  /** Rend la ligne actionnable : chevron, survol et focus clavier. */
  onPress?: () => void;
}

/**
 * Ligne d'un écran de réglages.
 *
 * Deux natures : porteuse d'un contrôle (interrupteur) ou navigante. Dans le
 * second cas elle se comporte comme un lien de site web — curseur, survol et
 * repère de focus au clavier — sans changer d'apparence sur mobile.
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  emoji,
  title,
  control,
  value,
  onPress,
}) => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const content = (
    <>
      <View style={styles.rowLeft}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
        <Text
          style={[
            styles.rowTitle,
            isDesktopUp && styles.rowTitleDense,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>
      </View>
      {onPress ? (
        <View style={styles.rowRight}>
          {value ? (
            <Text style={[styles.rowValue, { color: colors.textLight }]}>{value}</Text>
          ) : null}
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>
      ) : (
        control
      )}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, isDesktopUp && styles.rowDense]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        styles.clickable,
        isDesktopUp && styles.rowDense,
        (hovered || focused) && { backgroundColor: colors.borderLight },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[styles.focusMarker, { backgroundColor: focused ? colors.terra : "transparent" }]}
      />
      {content}
    </Pressable>
  );
};
