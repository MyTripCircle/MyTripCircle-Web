import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Address } from "../../types";
import { GeoCoords } from "../../utils/geocoding";
import { Region } from "../../hooks/useAddresses";
import MapCanvas, { isMapAvailable } from "../map/MapCanvas";
import type { MapCanvasMarker } from "../map/MapCanvas.types";
import { getTypeIcon, getMarkerColor } from "./addressHelpers";
import { styles } from "./addressStyles";
import { useTheme } from "../../contexts/ThemeContext";

interface AddressMapWidgetProps {
  addresses: Address[];
  mapCoords: Record<string, GeoCoords>;
  isGeocoding: boolean;
  widgetRegion: Region;
  onOpenFullMap: () => void;
  /** Neutralise la marge horizontale propre au widget quand un `PageContainer` la gère déjà. */
  flush?: boolean;
}

const AddressMapWidget: React.FC<AddressMapWidgetProps> = ({
  addresses,
  mapCoords,
  isGeocoding,
  widgetRegion,
  onOpenFullMap,
  flush = false,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // Mémoïsé : la variante web remonte ses marqueurs DOM à chaque nouvelle référence.
  const markers = useMemo<MapCanvasMarker[]>(
    () => Object.entries(mapCoords).flatMap(([addressId, coords]) => {
      const address = addresses.find((a) => a.id === addressId);
      if (!address) return [];
      return [{
        id: addressId,
        coordinate: coords,
        color: getMarkerColor(address.type),
        icon: getTypeIcon(address.type) as keyof typeof Ionicons.glyphMap,
        label: address.name,
        size: "sm" as const,
      }];
    }),
    [addresses, mapCoords],
  );

  return (
    <View style={[styles.mapWidget, flush && localStyles.flush]} pointerEvents="box-none">
      {isMapAvailable ? (
        <MapCanvas
          style={StyleSheet.absoluteFill}
          initialRegion={widgetRegion}
          markers={markers}
          dark={isDark}
          interactive={false}
          showsUserLocation
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.mapPlaceholder]}>
          <Ionicons name="map-outline" size={28} color="rgba(255,255,255,0.7)" />
          <Text style={styles.mapPlaceholderText}>Rebuild requis</Text>
        </View>
      )}

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onOpenFullMap}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={t("addresses.map.openFullMap")}
      />

      {isMapAvailable && isGeocoding && (
        <View style={styles.mapLoadingBadge}>
          <ActivityIndicator size="small" color="#5A4A3A" />
        </View>
      )}

      {isMapAvailable && Object.keys(mapCoords).length > 0 && (
        <View style={styles.mapCountBadge}>
          <Ionicons name="location" size={11} color="#5A4A3A" />
          <Text style={styles.mapCountText}>{Object.keys(mapCoords).length}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.mapSeeAll} onPress={onOpenFullMap} activeOpacity={0.8}>
        <Text style={styles.mapSeeAllText}>{t("addresses.seeMap")} →</Text>
      </TouchableOpacity>
    </View>
  );
};

const localStyles = StyleSheet.create({
  flush: { marginHorizontal: 0 },
});

export default AddressMapWidget;
