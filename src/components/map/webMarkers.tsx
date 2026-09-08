import React from "react";
import { createRoot } from "react-dom/client";
import { Marker } from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import MapMarkerPin from "./MapMarkerPin";
import type { MapCanvasMarker } from "./MapCanvas.types";

const createMarkerElement = (marker: MapCanvasMarker, clickable: boolean): HTMLDivElement => {
  const element = document.createElement("div");
  element.style.cursor = clickable ? "pointer" : "default";
  if (clickable) {
    element.setAttribute("role", "button");
    element.tabIndex = 0;
  }
  if (marker.label) element.setAttribute("aria-label", marker.label);
  return element;
};

/**
 * Monte les marqueurs MapLibre et rend la pastille React dans leur élément DOM.
 * Passer par `createRoot` plutôt que par du HTML brut garde un visuel strictement
 * identique au natif (même composant, mêmes icônes Ionicons).
 * Retourne la fonction de nettoyage à appeler avant tout nouveau rendu.
 */
export const mountMarkers = (
  map: MapLibreMap,
  markers: MapCanvasMarker[],
  onMarkerPress?: (markerId: string) => void,
): (() => void) => {
  const mounted = markers.map((marker) => {
    const element = createMarkerElement(marker, Boolean(onMarkerPress));
    const root = createRoot(element);
    root.render(
      <MapMarkerPin color={marker.color} icon={marker.icon} label={marker.label} size={marker.size} />,
    );

    const handlePress = () => onMarkerPress?.(marker.id);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") handlePress();
    };
    if (onMarkerPress) {
      element.addEventListener("click", handlePress);
      element.addEventListener("keydown", handleKeyDown);
    }

    const instance = new Marker({ element, anchor: "bottom" })
      .setLngLat([marker.coordinate.longitude, marker.coordinate.latitude])
      .addTo(map);

    return { instance, element, root, handlePress, handleKeyDown };
  });

  return () => {
    for (const { instance, element, root, handlePress, handleKeyDown } of mounted) {
      element.removeEventListener("click", handlePress);
      element.removeEventListener("keydown", handleKeyDown);
      instance.remove();
      // React interdit de démonter une racine pendant un rendu : on diffère d'un tick.
      queueMicrotask(() => root.unmount());
    }
  };
};
