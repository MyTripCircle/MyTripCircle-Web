import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import { F, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import TripsScreenSkeleton from "../components/trips/TripsScreenSkeleton";
import TripHeroCard from "../components/trips/TripHeroCard";
import TripMiniCard from "../components/trips/TripMiniCard";
import TripAllRow from "../components/trips/TripAllRow";
import TripNewCard from "../components/trips/TripNewCard";
import TripCreateButton from "../components/trips/TripCreateButton";
import TripsEmptyState from "../components/trips/TripsEmptyState";
import TripsHeader from "../components/trips/TripsHeader";
import { getCachedDestinationPhoto } from "../utils/destinationPhoto";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80&fit=crop",
];

const MINI_PHOTOS = [
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=200&q=80&fit=crop",
];

type TripsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

const TripsScreen: React.FC = () => {
  const navigation = useNavigation<TripsScreenNavigationProp>();
  const { trips, loading, refreshData } = useTrips();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled } = useOfflineDisabled();

  const [showAllTrips, setShowAllTrips] = useState(false);
  // Photos auto-fetchées pour les voyages sans coverImage : tripId → URL
  const [fetchedPhotos, setFetchedPhotos] = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  // Pour chaque voyage sans coverImage, on fetch la photo depuis Google Places
  useEffect(() => {
    const tripsNeedingPhoto = trips.filter((t) => !t.coverImage && t.destination);
    if (tripsNeedingPhoto.length === 0) return;

    tripsNeedingPhoto.forEach(async (trip) => {
      if (fetchedPhotos[trip.id]) return; // déjà fetché
      const url = await getCachedDestinationPhoto(trip.destination);
      if (url) {
        setFetchedPhotos((prev) => ({ ...prev, [trip.id]: url }));
      }
    });
  }, [trips]);

  const handleCreateTrip = () => navigation.navigate("CreateTrip");
  const handleTripPress = (trip: Trip) => navigation.navigate("TripDetails", { tripId: trip.id });

  const getFirstName = () => user?.name?.trim().split(" ")[0] ?? "";

  const daysUntil = (date: Date): number => {
    const diffMs = new Date(date).getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const photoFor = (trip: Trip, index: number): string =>
    trip.coverImage || fetchedPhotos[trip.id] || MINI_PHOTOS[index % MINI_PHOTOS.length];

  if (loading) return <TripsScreenSkeleton />;

  const now = new Date();
  const upcomingTrips = trips
    .filter((t) => new Date(t.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  // Priorité : voyage en cours (déjà commencé), sinon le plus proche à venir
  const heroTrip: Trip | null =
    upcomingTrips.find((t) => new Date(t.startDate) <= now) ?? upcomingTrips[0] ?? null;
  const miniTrips: Trip[] = heroTrip ? upcomingTrips.filter((t) => t.id !== heroTrip.id) : [];

  /** Grille sur grand écran, carrousel ou liste empilée sur mobile. */
  const renderTripsList = () => {
    const cards = miniTrips.map((trip, idx) => (
      <TripMiniCard
        key={trip.id ?? `mini-${idx}`}
        trip={trip}
        photoUri={photoFor(trip, idx)}
        onPress={() => handleTripPress(trip)}
        fluid={isTabletUp}
      />
    ));

    if (isTabletUp) {
      return (
        <CardGrid minColumnWidth={260} gap={SPACING.md}>
          {cards}
          <TripNewCard key="new" onPress={handleCreateTrip} disabled={offlineDisabled} fluid />
        </CardGrid>
      );
    }

    if (showAllTrips) {
      return (
        <View style={styles.allTripsContainer}>
          {miniTrips.map((trip, idx) => (
            <TripAllRow
              key={trip.id ?? `all-${idx}`}
              trip={trip}
              photoUri={photoFor(trip, idx)}
              onPress={() => handleTripPress(trip)}
            />
          ))}
          <TripNewCard onPress={handleCreateTrip} disabled={offlineDisabled} />
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniScroll}>
        {cards}
        <TripNewCard onPress={handleCreateTrip} disabled={offlineDisabled} />
      </ScrollView>
    );
  };

  return (
    <SwipeToNavigate currentIndex={0} totalTabs={5}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, isDesktopUp && styles.scrollContentDesktop]}
          scrollEnabled={showAllTrips || isTabletUp}
        >
          {/* Sur mobile le conteneur reste transparent : chaque bloc garde ses marges d'origine. */}
          <PageContainer width="wide" flush={!isTabletUp}>
            {isDesktopUp ? (
              <PageHeader
                title={t("trips.header")}
                subtitle={t("trips.greeting", { name: getFirstName() })}
                actions={<TripCreateButton onPress={handleCreateTrip} disabled={offlineDisabled} />}
              />
            ) : (
              <TripsHeader
                firstName={getFirstName()}
                onCreate={handleCreateTrip}
                disabled={offlineDisabled}
              />
            )}

            {upcomingTrips.length === 0 ? (
              <TripsEmptyState onCreate={handleCreateTrip} disabled={offlineDisabled} />
            ) : (
              <>
                {heroTrip && (
                  <TripHeroCard
                    trip={heroTrip}
                    photoUri={heroTrip.coverImage || fetchedPhotos[heroTrip.id] || HERO_PHOTOS[trips.indexOf(heroTrip) % HERO_PHOTOS.length]}
                    daysUntil={daysUntil(heroTrip.startDate)}
                    onPress={() => handleTripPress(heroTrip)}
                  />
                )}

                <View style={[styles.sectionHeader, isTabletUp && styles.sectionHeaderFlush]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("trips.upcomingTrips")}</Text>
                  {/* La grille montre déjà tout : le dépliage n'a de sens qu'en colonne unique. */}
                  {!isTabletUp && (
                    <TouchableOpacity onPress={() => setShowAllTrips((v) => !v)} activeOpacity={0.7}>
                      <Text style={[styles.sectionLink, { color: colors.terra }]}>
                        {showAllTrips ? t("trips.showLess") : t("trips.showAll")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {renderTripsList()}
              </>
            )}
          </PageContainer>
        </ScrollView>
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  // Sans îlot de navigation flottant, la réserve basse du mobile est inutile.
  scrollContentDesktop: { paddingBottom: SPACING.xxl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
  },
  sectionHeaderFlush: {
    paddingHorizontal: 0,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  sectionTitle: { fontSize: 22, fontFamily: F.sans700 },
  sectionLink: { fontSize: 13, fontFamily: F.sans500 },
  miniScroll: { paddingHorizontal: 14, paddingBottom: 16, gap: 12, flexDirection: "row", alignItems: "flex-start" },
  allTripsContainer: { paddingHorizontal: 14, paddingBottom: 8, gap: 8 },
});

export default TripsScreen;
