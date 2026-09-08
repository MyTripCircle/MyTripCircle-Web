import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { F, RADIUS } from "../../theme";
import type {
  DateTimeFieldMode,
  DateTimeFieldProps,
  DateTimePickerEvent,
} from "./DateTimeField.types";

/**
 * Variante web de DateTimeField.
 *
 * `@react-native-community/datetimepicker` n'a aucune implémentation
 * navigateur : on s'appuie sur les champs natifs `<input type="date|time|
 * datetime-local">`, qui apportent gratuitement le calendrier du navigateur,
 * la navigation clavier et le formatage selon la locale système.
 *
 * La prop `display` (spinner / default) n'a pas d'équivalent web et est donc
 * ignorée : le navigateur impose sa propre présentation.
 */

const INPUT_TYPE: Record<DateTimeFieldMode, string> = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
};

const pad = (n: number): string => String(n).padStart(2, "0");

const formatDatePart = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatTimePart = (d: Date): string => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function formatValue(date: Date, mode: DateTimeFieldMode): string {
  if (mode === "time") return formatTimePart(date);
  if (mode === "date") return formatDatePart(date);
  return `${formatDatePart(date)}T${formatTimePart(date)}`;
}

/**
 * Applique la saisie sur une copie de `previous` : en mode `date` on conserve
 * l'heure existante et en mode `time` la date, exactement comme le picker natif.
 */
function parseValue(raw: string, mode: DateTimeFieldMode, previous: Date): Date | undefined {
  if (!raw) return undefined;
  const [datePart, timePart] = mode === "time" ? ["", raw] : raw.split("T");
  const next = new Date(previous.getTime());
  if (datePart) {
    const [year, month, day] = datePart.split("-").map(Number);
    if (![year, month, day].every(Number.isFinite)) return undefined;
    next.setFullYear(year, month - 1, day);
  }
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    if (![hours, minutes].every(Number.isFinite)) return undefined;
    next.setHours(hours, minutes, 0, 0);
  }
  return Number.isNaN(next.getTime()) ? undefined : next;
}

/** Reproduit la forme de l'évènement natif pour ne pas changer le contrat. */
function buildEvent(date?: Date): DateTimePickerEvent {
  const reference = date ?? new Date();
  return {
    type: date ? "set" : "dismissed",
    nativeEvent: {
      timestamp: reference.getTime(),
      utcOffset: -reference.getTimezoneOffset(),
    },
  };
}

interface InputTone {
  background: string;
  border: string;
  text: string;
  accent: string;
  focused: boolean;
  /** Pilote le thème du calendrier natif du navigateur (clair / sombre). */
  scheme: "dark" | "light";
}

/** Reprend la boîte de saisie de FormField : fond surface, bordure fine, texte 16. */
function buildInputStyle(tone: InputTone): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: 16,
    borderRadius: RADIUS.input,
    border: `1px solid ${tone.focused ? tone.accent : tone.border}`,
    backgroundColor: tone.background,
    color: tone.text,
    fontFamily: F.sans400,
    fontSize: 16,
    // Anneau de focus explicite : une balise `<input>` stylée en ligne n'a pas
    // accès à `:focus-visible`. `outline` plutôt qu'une ombre portée, car il
    // survit au mode contrastes forcés du système.
    outline: tone.focused ? `2px solid ${tone.accent}` : "none",
    outlineOffset: 2,
    colorScheme: tone.scheme,
  };
}

const DateTimeField: React.FC<DateTimeFieldProps> = ({
  value,
  mode = "date",
  minimumDate,
  maximumDate,
  onChange,
  textColor,
  locale,
  themeVariant,
  style,
  accessibilityLabel,
}) => {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseValue(event.target.value, mode, value);
    onChange(buildEvent(next), next);
  };

  const inputStyle = buildInputStyle({
    background: colors.surface,
    border: colors.border,
    text: textColor ?? colors.text,
    accent: colors.terra,
    focused,
    scheme: themeVariant ?? (isDark ? "dark" : "light"),
  });

  return (
    // `stretch` par défaut : les conteneurs appelants centrent leur contenu,
    // sans quoi le champ se réduirait à sa largeur intrinsèque.
    <View style={[styles.wrapper, style]}>
      <input
        type={INPUT_TYPE[mode]}
        value={formatValue(value, mode)}
        min={minimumDate ? formatValue(minimumDate, mode) : undefined}
        max={maximumDate ? formatValue(maximumDate, mode) : undefined}
        lang={locale?.replace("_", "-")}
        aria-label={accessibilityLabel}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignSelf: "stretch" },
});

export default DateTimeField;
