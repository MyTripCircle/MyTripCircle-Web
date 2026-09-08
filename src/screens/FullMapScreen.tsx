import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootStackParamList, Address } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import BackButton from "../components/ui/BackButton";
import { useAddressGeocoding } from "../hooks/useAddressGeocoding";
import AddressListPanel from "../components/fullMap/AddressListPanel";
import MapMarkerPopup from "../components/fullMap/MapMarkerPopup";
import MapCanvas, { isMapAvailable, supportsSatellite } from "../components/map/MapCanvas";
import type { MapCanvasHandle, MapRegion } from "../components/map/MapCanvas.types";

type FilterType = "all" | "hotel" | "restaurant" | "activity" | "transport" | "other";

const DEFAULT_REGION: MapRegion = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const getTypeIcon = (type: Address["type"]) => {
  switch (type) {
    case "hotel":      return "bed-outline";
    case "restaurant": return "restaurant-outline";
    case "activity":   return "ticket-outline";
    case "transport":  return "car-outline";
    default:           return "location-outline";
  }
};

const getMarkerColor = (type: Address["type"]): string => {
  switch (type) {
    case "hotel":      return "#5A8FAA";
    case "restaurant": return "#C4714A";
    case "activity":   return "#6B8C5A";
    default:           return "#8B7355";
  }
};

const FullMapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { addresses }                          = useTrips();
  const { t }                                  = useTranslation();
  const { colors, isDark, satelliteMap, toggleSatelliteMap } = useTheme();
  const insets                                 = useSafeAreaInsets();
  const { isDesktopUp }                        = useBreakpoint();

  const [selectedFilter, setSelectedFilter]     = useState<FilterType>("all");
  const [selectedAddress, setSelectedAddress]   = useState<Address | null>(null);
  const mapRef                                  = useRef<MapCanvasHandle>(null);

  const { mapCoords, isGeocoding } = useAddressGeocoding(addresses);

  const filteredAddresses  = addresses.filter((a) => selectedFilter === "all" || a.type === selectedFilter);
  const filteredWithCoords = filteredAddresses.filter((a) => mapCoords[a.id] != null);

  // Mémoïsé : la variante web remonte ses marqueurs DOM à chaque nouvelle référence.
  const markers = useMemo(
    () => filteredWithCoords.map((a) => ({
      id: a.id,
      coordinate: mapCoords[a.id],
      color: getMarkerColor(a.type),
      icon: getTypeIcon(a.type) as keyof typeof Ionicons.glyphMap,
      label: a.name,
    })),
    [filteredWithCoords.map((a) => a.id).join(","), mapCoords],
  );

  const handleMapReady = () => {
    const coords = filteredWithCoords.map((a) => mapCoords[a.id]);
    if (coords.length === 0) return;
    setTimeout(() => mapRef.current?.fitToCoordinates(coords), 300);
  };

  const handleMarkerPress = useCallback((addressId: string) => {
    const address = addresses.find((a) => a.id === addressId);
    const coords  = mapCoords[addressId];
    if (!address || !coords) return;
    setSelectedAddress(address);
    // Remonte le marqueur d'un cinquième de l'écran pour dégager la popup du bas
    mapRef.current?.centerOn(coords, 0.2);
  }, [addresses, mapCoords]);

  /**
   * Sélection depuis le panneau latéral (palier desktop) : recentre la carte
   * quand l'adresse est géolocalisée, sinon se contente de la mettre en
   * surbrillance dans la liste.
   */
  const handleListItemPress = useCallback((address: Address) => {
    setSelectedAddress(address);
    const coords = mapCoords[address.id];
    if (coords) mapRef.current?.centerOn(coords, 0.2);
  }, [mapCoords]);

  const renderFilterButton = useCallback((filter: FilterType, label: string) => {
    const active = selectedFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.chip, { backgroundColor: colors.bgMid }, active && { backgroundColor: colors.terra }]}
        onPress={() => setSelectedFilter(filter)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, { color: colors.textMid }, active && { color: "#FFFFFF" }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedFilter, colors]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: colors.text }]}>{t("addresses.header")}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Filtres */}
      <View style={[styles.filters, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {renderFilterButton("all",        t("addresses.filters.all"))}
          {renderFilterButton("hotel",      t("addresses.filters.hotel"))}
          {renderFilterButton("restaurant", t("addresses.filters.restaurant"))}
          {renderFilterButton("activity",   t("addresses.filters.activity"))}
          {renderFilterButton("transport",  t("addresses.filters.transport"))}
          {renderFilterButton("other",      t("addresses.filters.other"))}
        </ScrollView>
      </View>

      {/* Carte — panneau latéral d'adresses au palier desktop, plein cadre sinon */}
      <View style={isDesktopUp ? styles.splitBody : styles.mapOnlyBody}>
        {isDesktopUp && (
          <AddressListPanel
            addresses={filteredAddresses}
            mapCoords={mapCoords}
            selectedAddressId={selectedAddress?.id ?? null}
            colors={colors}
            isDark={isDark}
            t={t}
            onSelect={handleListItemPress}
          />
        )}
        <View style={styles.mapPane}>
          {isMapAvailable ? (
            <MapCanvas
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={DEFAULT_REGION}
              markers={markers}
              satellite={satelliteMap}
              dark={isDark}
              interactive={selectedAddress === null}
              showsUserLocation
              onReady={handleMapReady}
              onMarkerPress={handleMarkerPress}
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="map-outline" size={52} color={colors.textLight} />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                {t("fullMap.unavailable", "Carte non disponible")}
              </Text>
            </View>
          )}

          {/* Bouton satellite — masqué là où les tuiles satellite ne sont pas servies (web) */}
          {isMapAvailable && supportsSatellite && (
            <TouchableOpacity
              style={[styles.satelliteBtn, { backgroundColor: colors.surface }]}
              onPress={toggleSatelliteMap}
              activeOpacity={0.8}
            >
              <Ionicons name={satelliteMap ? "map-outline" : "globe-outline"} size={20} color={colors.terra} />
            </TouchableOpacity>
          )}

          {/* Popup custom — sur desktop, la ligne en surbrillance dans le panneau
              latéral porte déjà l'information : la popup resterait redondante. */}
          {selectedAddress && !isDesktopUp && (
            <MapMarkerPopup
              address={selectedAddress}
              onClose={() => setSelectedAddress(null)}
              onNavigate={(addressId) => {
                setSelectedAddress(null);
                navigation.navigate("AddressDetails", { addressId });
              }}
            />
          )}

          {/* Aucun marqueur */}
          {filteredWithCoords.length === 0 && (
            <View style={styles.noMarkersOverlay} pointerEvents="none">
              <View style={[styles.noMarkersBadge, { backgroundColor: colors.surface }]}>
                {isGeocoding ? (
                  <>
                    <ActivityIndicator size="small" color={colors.terra} style={{ marginBottom: 6 }} />
                    <Text style={[styles.noMarkersText, { color: colors.textMid }]}>
                      {t("fullMap.geocoding", "Géocodage en cours…")}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.noMarkersText, { color: colors.textMid }]}>
                    {t("fullMap.noAddress", "Aucune adresse à afficher")}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  // Desktop : panneau latéral + carte côte à côte. Mobile/tablette : carte seule, plein cadre.
  splitBody: { flex: 1, flexDirection: "row" },
  mapOnlyBody: { flex: 1 },
  mapPane: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  title:    { flex: 1, fontSize: 20, fontFamily: F.sans700, textAlign: "center" },
  filters:  { paddingVertical: 10, borderBottomWidth: 1 },
  filtersScroll: { paddingHorizontal: 16, gap: 8 },
  chip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9999 },
  chipText: { fontSize: 13, fontFamily: F.sans600 },
  satelliteBtn: {
    position: "absolute", top: 16, right: 16,
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 4,
  },
  noMarkersOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  noMarkersBadge: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  noMarkersText:    { fontSize: 14, fontFamily: F.sans500 },
  placeholder:      { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  placeholderTitle: { fontSize: 18, fontFamily: F.sans700 },
});

export default FullMapScreen;
