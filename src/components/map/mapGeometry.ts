import type { GeoCoords } from "../../utils/geocoding";
import type { MapRegion } from "./MapCanvas.types";

// MapLibre référence son niveau de zoom sur une tuile de 512 px : au zoom 0 le
// monde entier tient dans 512 px.
const WORLD_TILE_SIZE = 512;
const MAX_ZOOM = 20;

/**
 * Convertit une région react-native-maps (amplitude en degrés) en niveau de
 * zoom MapLibre, ce qui suppose de connaître la largeur du conteneur en pixels.
 */
export const regionToZoom = (region: MapRegion, containerWidth: number): number => {
  if (containerWidth <= 0 || region.longitudeDelta <= 0) return 1;
  const worldWidthPx = (containerWidth * 360) / region.longitudeDelta;
  const zoom = Math.log2(worldWidthPx / WORLD_TILE_SIZE);
  return Math.min(Math.max(zoom, 0), MAX_ZOOM);
};

/** Boîte englobante [[ouest, sud], [est, nord]] ; null si aucun point. */
export const coordinatesToBounds = (
  coordinates: GeoCoords[],
): [[number, number], [number, number]] | null => {
  if (coordinates.length === 0) return null;

  let west = coordinates[0].longitude;
  let east = coordinates[0].longitude;
  let south = coordinates[0].latitude;
  let north = coordinates[0].latitude;

  for (const { latitude, longitude } of coordinates) {
    west = Math.min(west, longitude);
    east = Math.max(east, longitude);
    south = Math.min(south, latitude);
    north = Math.max(north, latitude);
  }

  return [
    [west, south],
    [east, north],
  ];
};
