import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList, Address } from "../types";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { F } from "../theme/fonts";
import { RADIUS, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { geocodeAddress, getCached, GeoCoords } from "../utils/geocoding";
import { getAddressHeroGradient, getAddressTypeBadge } from "../utils/addressHelpers";
import AddressActionButtons from "../components/addressDetails/AddressActionButtons";
import AddressDetailsSkeleton from "../components/addressDetails/AddressDetailsSkeleton";
import AddressHeroCover from "../components/addressDetails/AddressHeroCover";
import { PageContainer, TwoColumn } from "../components/layout";
import MapCanvas, { isMapAvailable } from "../components/map/MapCanvas";
import type { MapCanvasMarker } from "../components/map/MapCanvas.types";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

// Amplitude d'affichage de la vignette : ~500 m de part et d'autre de l'adresse
const THUMBNAIL_DELTA = 0.005;

type AddressDetailsScreenRouteProp      = RouteProp<RootStackParamList, "AddressDetails">;
type AddressDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, "AddressDetails">;

const AddressDetailsScreen: React.FC = () => {
  const route      = useRoute<AddressDetailsScreenRouteProp>();
  const navigation = useNavigation<AddressDetailsScreenNavigationProp>();
  const { addressId } = route.params;
  const { t }      = useTranslation();
  const insets     = useSafeAreaInsets();
  const { addresses, loading, deleteAddress } = useTrips();
  const { user }   = useAuth();
  const { colors, satelliteMap } = useTheme();
  const { isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();

  const [address, setAddress] = useState<Address | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [coords, setCoords]   = useState<GeoCoords | null>(null);

  useEffect(() => {
    if (!loading) {
      const found = addresses.find((a) => a.id === addressId) || null;
      setAddress(found);
      setIsReady(true);
    }
  }, [loading, addresses, addressId]);

  // Géocodage dès que l'adresse est connue
  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    const run = async () => {
      const cached = getCached(address.address, address.city, address.country);
      if (cached !== undefined) {
        if (!cancelled) setCoords(cached);
        return;
      }
      const result = await geocodeAddress(address.address, address.city, address.country);
      if (!cancelled) setCoords(result);
    };

    run().catch(() => {});
    return () => { cancelled = true; };
  }, [address]);

  // Mémoïsé : la variante web remonte ses marqueurs DOM à chaque nouvelle référence.
  const thumbnailMarkers = useMemo<MapCanvasMarker[]>(
    () => (coords
      ? [{ id: addressId, coordinate: coords, color: colors.terra, icon: "location", label: address?.name }]
      : []),
    [addressId, coords, colors.terra, address?.name],
  );

  const handleEditAddress   = () => navigation.navigate("AddressForm", { addressId });

  const handleDeleteAddress = () => {
    Alert.alert(
      t("addresses.details.deleteTitle"),
      t("addresses.details.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              if (deleteAddress) await deleteAddress(addressId);
              navigation.goBack();
            } catch (err) {
              console.error("Delete address error:", err);
            }
          },
        },
      ]
    );
  };

  const handleCall    = () => { if (address?.phone)   Linking.openURL(`tel:${address.phone}`); };
  const handleWebsite = () => { if (address?.website) Linking.openURL(address.website); };
  const handleMaps    = () => {
    if (!address) return;
    const q = encodeURIComponent(`${address.address}, ${address.city}, ${address.country}`);
    Linking.openURL(`https://maps.google.com/maps?daddr=${q}`);
  };

  if (!isReady || loading) return <AddressDetailsSkeleton />;

  if (!address) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.bg }]}>
        <Text style={[styles.centeredStateText, { color: colors.danger }]}>
          {t("addresses.details.notFound")}
        </Text>
      </View>
    );
  }

  const gradient = getAddressHeroGradient(address.type);
  const badge    = getAddressTypeBadge(address.type, t);
  const isOwner  = address.userId === user?.id;

  // `flush` : sur desktop, `PageContainer`/la colonne latérale portent déjà la
  // marge horizontale — ces sections ne doivent pas en ajouter une seconde.
  const ratingSection = (
    <View style={[styles.ratingRow, !isDesktopUp && styles.ratingRowInset]}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = address.rating == null ? false : star <= Math.round(address.rating);
          return (
            <Text key={star} style={[styles.star, { color: filled ? colors.terra : "#D4C4B0" }]}>★</Text>
          );
        })}
      </View>
      <Text style={[styles.shortAddress, { color: colors.textMid }]} numberOfLines={1}>
        📍 {address.address}, {address.city}
      </Text>
    </View>
  );

  const chipsSection = (address.phone || address.website) ? (
    <View style={[styles.chipsRow, !isDesktopUp && styles.chipsRowInset]}>
      {address.phone ? (
        <TouchableOpacity
          style={[styles.chip, { backgroundColor: colors.bgMid }]}
          onPress={handleCall}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, { color: colors.textMid }]}>📞 {address.phone}</Text>
        </TouchableOpacity>
      ) : null}
      {address.website ? (
        <TouchableOpacity
          style={[styles.chip, styles.chipSky]}
          onPress={handleWebsite}
          activeOpacity={0.75}
        >
          <Text style={styles.chipTextSky}>🌐 {t("addresses.details.websiteChip")}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  ) : null;

  const mapSection = (
    <View style={[styles.mapThumb, isDesktopUp ? styles.mapThumbDesktop : styles.mapThumbInset]}>
      {isMapAvailable && coords ? (
        <MapCanvas
          style={StyleSheet.absoluteFill}
          region={{
            latitude:       coords.latitude,
            longitude:      coords.longitude,
            latitudeDelta:  THUMBNAIL_DELTA,
            longitudeDelta: THUMBNAIL_DELTA,
          }}
          markers={thumbnailMarkers}
          satellite={satelliteMap}
          interactive={false}
        />
      ) : (
        <LinearGradient
          colors={["#C8D8C0", "#A8C4B0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <TouchableOpacity style={styles.openMapsBtn} onPress={handleMaps} activeOpacity={0.8}>
        <Text style={[styles.openMapsBtnText, { color: colors.textMid }]}>
          {t("addresses.details.openInMaps")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const notesSection = (
    <View style={[styles.notesCard, !isDesktopUp && styles.notesCardInset, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.notesLabel, { color: colors.textLight }]}>
        {t("addresses.details.notes")}
      </Text>
      <Text style={[styles.notesBody, { color: address.notes ? colors.text : colors.textLight }]}>
        {address.notes || t("addresses.details.noNotes")}
      </Text>
    </View>
  );

  const actionButtons = isOwner ? (
    <AddressActionButtons
      onEdit={handleEditAddress}
      onDelete={handleDeleteAddress}
      disabled={offlineDisabled}
      disabledStyle={offlineStyle}
      vertical={isDesktopUp}
    />
  ) : null;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >

        <AddressHeroCover
          address={address}
          gradient={gradient}
          badge={badge}
          insetTop={insets.top}
          onBack={() => navigation.goBack()}
        />

        {isDesktopUp ? (
          <PageContainer width="default">
            <TwoColumn
              main={(
                <View style={styles.desktopMain}>
                  {ratingSection}
                  {chipsSection}
                  {notesSection}
                </View>
              )}
              aside={(
                <View style={styles.desktopAside}>
                  {mapSection}
                  {actionButtons}
                </View>
              )}
            />
          </PageContainer>
        ) : (
          <>
            {ratingSection}
            {chipsSection}
            {mapSection}
            {notesSection}
            {actionButtons}
          </>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:           { flex: 1 },
  scroll:            { flex: 1 },
  centeredState:     { flex: 1, justifyContent: "center", alignItems: "center" },
  centeredStateText: { fontSize: 16, fontFamily: F.sans400 },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingBottom: 10,
  },
  ratingRowInset: { paddingHorizontal: 18 },
  starsRow:     { flexDirection: "row", gap: 3 },
  star:         { fontSize: 18 },
  shortAddress: { flex: 1, fontSize: 13, fontFamily: F.sans400, textAlign: "right", marginLeft: 12 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 14 },
  chipsRowInset: { paddingHorizontal: 18 },
  chip:         { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  chipText:     { fontSize: 14, fontFamily: F.sans400 },
  chipSky:      { backgroundColor: "#DCF0F5" },
  chipTextSky:  { fontSize: 14, fontFamily: F.sans400, color: "#5A8FAA" },

  mapThumb: {
    marginBottom: 14,
    height: 160,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  mapThumbInset: { marginHorizontal: 18 },
  // Desktop : la vignette vit seule dans la colonne latérale, elle peut respirer davantage.
  mapThumbDesktop: { height: 240, marginBottom: 0 },
  openMapsBtn: {
    position: "absolute",
    bottom: 10,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  openMapsBtnText: { fontSize: 13, fontFamily: F.sans400 },

  notesCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notesCardInset: { marginHorizontal: 18 },
  notesLabel: { fontSize: 12, fontFamily: F.sans400, marginBottom: 6 },
  notesBody:  { fontSize: 15, fontFamily: F.sans400, lineHeight: 22 },

  // Desktop uniquement : espacement entre sections dans chaque colonne du `TwoColumn`.
  desktopMain: { gap: SPACING.lg },
  desktopAside: { gap: SPACING.md },
});

export default AddressDetailsScreen;
