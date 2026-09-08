import type { StyleSpecification } from "maplibre-gl";

/**
 * Attribution imposée par la licence ODbL d'OpenStreetMap : elle doit rester
 * visible en permanence sur la carte (voir AttributionControl dans MapCanvas.web).
 */
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/**
 * Tuiles raster servies par la fondation OSM : aucune clé d'API, mais leur
 * politique d'usage (https://operations.osmfoundation.org/policies/tiles/)
 * interdit le trafic soutenu d'une application grand public et plafonne le
 * zoom à 19. Ce style ne convient donc qu'au développement et aux petits
 * volumes : en production, pointer EXPO_PUBLIC_MAP_STYLE_URL vers son propre
 * fournisseur de tuiles.
 */
const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
};

const configuredStyleUrl = process.env.EXPO_PUBLIC_MAP_STYLE_URL;

export const mapStyle: StyleSpecification | string =
  configuredStyleUrl && configuredStyleUrl.length > 0 ? configuredStyleUrl : OSM_RASTER_STYLE;

/** Vrai quand la carte s'appuie sur les tuiles publiques OSM (repli par défaut). */
export const usesPublicOsmTiles = mapStyle === OSM_RASTER_STYLE;
