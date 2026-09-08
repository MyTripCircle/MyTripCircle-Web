import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MapMarkerPinProps {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  /** "sm" pour les cartes miniatures, où la pastille standard écraserait la vue. */
  size?: "sm" | "md";
}

/**
 * Pastille de marqueur commune aux deux plateformes : sur natif elle est passée
 * en enfant d'un `<Marker>`, sur web elle est montée dans l'élément DOM du
 * marqueur MapLibre. Un visuel unique évite la divergence entre les variantes.
 */
const MapMarkerPin: React.FC<MapMarkerPinProps> = ({ color, icon, label, size = "md" }) => (
  <View
    style={[styles.pin, size === "sm" && styles.pinSmall, { backgroundColor: color }]}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Ionicons name={icon} size={size === "sm" ? 10 : 13} color="white" />
  </View>
);

const styles = StyleSheet.create({
  pin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  pinSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
});

export default MapMarkerPin;
