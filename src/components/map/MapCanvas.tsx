import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import MapMarkerPin from "./MapMarkerPin";
import type { MapCanvasHandle, MapCanvasProps, MapRegion } from "./MapCanvas.types";

// Chargement conditionnel : react-native-maps nécessite un rebuild du dev client
let MapView: any = null;
let Marker: any = null;
let mapsAvailable = false;
try {
  const RNMaps = require("react-native-maps");
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  mapsAvailable = true;
} catch (e) {
  if (__DEV__) console.warn("[MapCanvas] react-native-maps non disponible:", e);
}

/** Faux si le module natif manque (Expo Go) : les écrans affichent alors un repli. */
export const isMapAvailable = mapsAvailable;

export const supportsSatellite = true;

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1A1714" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#A89880" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1A1714" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2E2A27" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#3A3530" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3D3830" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D1117" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#22201D" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1A2218" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#262220" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3A3530" }] },
];

const EDGE_PADDING = { top: 80, right: 40, bottom: 80, left: 40 };

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>((props, ref) => {
  const {
    style,
    initialRegion,
    region,
    markers = [],
    satellite = false,
    dark = false,
    interactive = true,
    showsUserLocation = false,
    onReady,
    onMarkerPress,
  } = props;

  const mapRef = useRef<any>(null);
  const currentRegionRef = useRef<MapRegion | undefined>(region ?? initialRegion);

  useImperativeHandle(ref, () => ({
    fitToCoordinates: (coordinates) => {
      if (coordinates.length === 0) return;
      mapRef.current?.fitToCoordinates(coordinates, { edgePadding: EDGE_PADDING, animated: true });
    },
    centerOn: (coordinate, verticalOffsetRatio = 0) => {
      const latitudeDelta = currentRegionRef.current?.latitudeDelta ?? 0;
      const latitude = coordinate.latitude - latitudeDelta * verticalOffsetRatio;
      mapRef.current?.animateCamera(
        { center: { latitude, longitude: coordinate.longitude } },
        { duration: 350 },
      );
    },
  }));

  if (!MapView) return null;

  return (
    <MapView
      ref={mapRef}
      style={[StyleSheet.absoluteFill, style]}
      initialRegion={initialRegion}
      region={region}
      mapType={satellite ? "hybrid" : "standard"}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsCompass={interactive}
      toolbarEnabled={false}
      onMapReady={onReady}
      onRegionChangeComplete={(next: MapRegion) => { currentRegionRef.current = next; }}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={interactive}
      pitchEnabled={interactive}
      customMapStyle={dark && !satellite ? DARK_MAP_STYLE : []}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges={false}
          onPress={() => onMarkerPress?.(marker.id)}
        >
          <MapMarkerPin color={marker.color} icon={marker.icon} label={marker.label} size={marker.size} />
        </Marker>
      ))}
    </MapView>
  );
});

MapCanvas.displayName = "MapCanvas";

export default MapCanvas;
