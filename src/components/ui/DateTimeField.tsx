import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { DateTimeFieldProps } from "./DateTimeField.types";

/**
 * Enveloppe unique du sélecteur de date/heure.
 *
 * Variante native : délègue tel quel à `@react-native-community/datetimepicker`,
 * le rendu iOS / Android reste strictement celui d'avant la migration.
 * La variante `DateTimeField.web.tsx` prend le relais dans le navigateur, où ce
 * paquet n'expose aucune implémentation.
 */
const DateTimeField: React.FC<DateTimeFieldProps> = ({
  value,
  mode = "date",
  display = "default",
  minimumDate,
  maximumDate,
  onChange,
  textColor,
  locale,
  themeVariant,
  style,
  accessibilityLabel,
}) => (
  <DateTimePicker
    value={value}
    mode={mode}
    display={display}
    minimumDate={minimumDate}
    maximumDate={maximumDate}
    onChange={onChange}
    textColor={textColor}
    locale={locale}
    themeVariant={themeVariant}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export default DateTimeField;
