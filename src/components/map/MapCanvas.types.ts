import type { StyleProp, ViewStyle } from "react-native";
import type { Ionicons } from "@expo/vector-icons";
import type { GeoCoords } from "../../utils/geocoding";

/** Zone visible exprimée comme react-native-maps : centre + amplitude en degrés. */
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapCanvasMarker {
  id: string;
  coordinate: GeoCoords;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Sert d'étiquette accessible (lecteur d'écran natif, aria-label web). */
  label?: string;
  /** "sm" pour les cartes miniatures. Défaut : "md". */
  size?: "sm" | "md";
}

export interface MapCanvasHandle {
  /** Cadre la caméra sur l'ensemble des points fournis. */
  fitToCoordinates: (coordinates: GeoCoords[]) => void;
  /**
   * Centre la caméra sur un point.
   * `verticalOffsetRatio` remonte le point d'une fraction de la hauteur visible
   * (0.2 = un cinquième plus haut), pour dégager la place d'une popup en bas.
   */
  centerOn: (coordinate: GeoCoords, verticalOffsetRatio?: number) => void;
}

export interface MapCanvasProps {
  style?: StyleProp<ViewStyle>;
  /** Cadrage initial, non piloté ensuite (mode libre). */
  initialRegion?: MapRegion;
  /** Cadrage piloté par le parent : la carte suit chaque changement (mode contrôlé). */
  region?: MapRegion;
  markers?: MapCanvasMarker[];
  /** Vue satellite — voir `supportsSatellite`, indisponible sur web. */
  satellite?: boolean;
  dark?: boolean;
  /** Autorise le déplacement, le zoom et la rotation. Défaut : true. */
  interactive?: boolean;
  showsUserLocation?: boolean;
  onReady?: () => void;
  onMarkerPress?: (markerId: string) => void;
}
