import type { StyleProp, ViewStyle } from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export type { DateTimePickerEvent };

export type DateTimeFieldMode = "date" | "time" | "datetime";

/** Sous-ensemble commun aux presentations iOS / Android réellement utilisées. */
export type DateTimeFieldDisplay = "default" | "spinner";

/**
 * Contrat partagé par les deux implémentations de DateTimeField.
 * Le fichier est volontairement séparé pour que la variante `.web.tsx` ne
 * puisse pas dériver du contrat natif sans que `tsc` le signale.
 */
export interface DateTimeFieldProps {
  value: Date;
  mode?: DateTimeFieldMode;
  display?: DateTimeFieldDisplay;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  /** Couleur du texte — appliquée par le picker iOS et par l'input web. */
  textColor?: string;
  /** Locale au format iOS (`fr_FR`) ; convertie en BCP-47 côté web. */
  locale?: string;
  themeVariant?: "dark" | "light";
  style?: StyleProp<ViewStyle>;
  /** Libellé pour les lecteurs d'écran (le champ web n'a pas de <label>). */
  accessibilityLabel?: string;
}
