import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { View, StyleSheet } from "react-native";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AttributionControl,
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
} from "maplibre-gl";
import logger from "../../utils/logger";
import { coordinatesToBounds, regionToZoom } from "./mapGeometry";
import { mapStyle } from "./webMapStyle";
import { mountMarkers } from "./webMarkers";
import type { MapCanvasHandle, MapCanvasProps, MapRegion } from "./MapCanvas.types";

export const isMapAvailable = true;

/** Aucune imagerie satellite libre de droits sans clé : le toggle est masqué sur web. */
export const supportsSatellite = false;

const FALLBACK_REGION: MapRegion = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const FIT_PADDING = { top: 80, right: 40, bottom: 80, left: 40 };
const FIT_MAX_ZOOM = 16;

// Les tuiles raster OSM n'ont pas de déclinaison sombre (contrairement au
// customMapStyle natif) : on assombrit le canvas sans toucher aux marqueurs.
const DARK_CANVAS_FILTER = "brightness(0.78) saturate(0.85)";

const applyRegion = (map: MapLibreMap, region: MapRegion): void => {
  map.jumpTo({
    center: [region.longitude, region.latitude],
    zoom: regionToZoom(region, map.getContainer().clientWidth),
  });
};

const setInteractivity = (map: MapLibreMap, enabled: boolean): void => {
  const handlers = [
    map.dragPan,
    map.scrollZoom,
    map.doubleClickZoom,
    map.touchZoomRotate,
    map.dragRotate,
    map.keyboard,
    map.boxZoom,
  ];
  handlers.forEach((handler) => (enabled ? handler.enable() : handler.disable()));
};

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>((props, ref) => {
  const {
    style,
    initialRegion,
    region,
    markers = [],
    dark = false,
    interactive = true,
    showsUserLocation = false,
    onReady,
    onMarkerPress,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const regionRef = useRef(region);
  regionRef.current = region;

  useImperativeHandle(ref, () => ({
    fitToCoordinates: (coordinates) => {
      const bounds = coordinatesToBounds(coordinates);
      if (!bounds || !mapRef.current) return;
      mapRef.current.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, animate: true });
    },
    centerOn: (coordinate, verticalOffsetRatio = 0) => {
      const map = mapRef.current;
      if (!map) return;
      const offsetY = map.getContainer().clientHeight * verticalOffsetRatio;
      map.easeTo({
        center: [coordinate.longitude, coordinate.latitude],
        offset: [0, offsetY],
        duration: 350,
      });
    },
  }));

  // Une seule instance MapLibre pour la durée de vie du composant : elle est
  // détruite au démontage, faute de quoi son contexte WebGL et ses écouteurs fuient.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const startRegion = region ?? initialRegion ?? FALLBACK_REGION;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: mapStyle,
        center: [startRegion.longitude, startRegion.latitude],
        zoom: regionToZoom(startRegion, container.clientWidth),
        attributionControl: false,
      });
    } catch (error) {
      logger.warn("[MapCanvas.web] initialisation MapLibre impossible", error);
      return;
    }

    // Attribution OSM toujours dépliée et à l'opposé des boutons flottants des écrans.
    map.addControl(new AttributionControl({ compact: false }), "bottom-left");
    map.on("load", () => {
      // Le conteneur peut n'avoir aucune largeur au montage : on rejoue le
      // cadrage contrôlé une fois la carte réellement dimensionnée.
      if (regionRef.current) applyRegion(map, regionRef.current);
      onReadyRef.current?.();
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !interactive) return;

    const navigation = new NavigationControl({ showZoom: true, showCompass: true });
    map.addControl(navigation, "top-left");

    // Pas de `trigger()` : la géolocalisation ne part qu'au clic de l'utilisateur.
    const geolocate = showsUserLocation ? new GeolocateControl({ trackUserLocation: false }) : null;
    if (geolocate) map.addControl(geolocate, "top-left");

    return () => {
      map.removeControl(navigation);
      if (geolocate) map.removeControl(geolocate);
    };
  }, [interactive, showsUserLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setInteractivity(map, interactive);
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) map.getCanvas().style.filter = dark ? DARK_CANVAS_FILTER : "";
  }, [dark]);

  // Dépendances éclatées : le parent recrée l'objet région à chaque rendu.
  useEffect(() => {
    const map = mapRef.current;
    if (map && region) applyRegion(map, region);
  }, [region?.latitude, region?.longitude, region?.latitudeDelta, region?.longitudeDelta]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    return mountMarkers(map, markers, onMarkerPress);
  }, [markers, onMarkerPress]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
    </View>
  );
});

MapCanvas.displayName = "MapCanvas";

export default MapCanvas;
