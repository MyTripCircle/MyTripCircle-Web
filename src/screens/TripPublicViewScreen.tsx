import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { PageContainer, TwoColumn } from "../components/layout";
import { F } from "../theme/fonts";
import { RADIUS, SPACING } from "../theme";
import TripPublicSkeleton from "../components/tripPublicView/TripPublicSkeleton";
import TripCoverHero from "../components/tripPublicView/TripCoverHero";
import TripContentTabs from "../components/tripPublicView/TripContentTabs";
import InvitationCtaBar from "../components/tripPublicView/InvitationCtaBar";
import BackButton from "../components/ui/BackButton";
import ReportSheet from "../components/moderation/ReportSheet";
import { moderationApi } from "../services/api/moderationApi";

const tripDays = (start: string | Date, end: string | Date) =>
  Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));

const TripPublicViewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tripId, invitationToken } = route.params as { tripId: string; invitationToken?: string };
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { respondToInvitation } = useTrips();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  const [trip, setTrip] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "addresses">("bookings");
  const [responding, setResponding] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState<"pending" | "accepted" | "declined" | null>(
    invitationToken ? "pending" : null
  );
  const [reportSheetVisible, setReportSheetVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, b, a] = await Promise.all([
          ApiService.getTripById(tripId),
          ApiService.getBookingsByTripId(tripId).catch(() => []),
          ApiService.getAddressesByTripId(tripId).catch(() => []),
        ]);
        setTrip(t);
        setBookings(b);
        setAddresses(a);
      } catch (e) {
        if (__DEV__) console.warn("[TripPublicViewScreen] Chargement voyage inaccessible:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId]);

  const handleAccept = async () => {
    if (!invitationToken) return;
    setResponding(true);
    try {
      const ok = await respondToInvitation(invitationToken, "accept", user?.id);
      if (ok) {
        setInvitationStatus("accepted");
        Alert.alert(
          t("tripPublicView.joinedTitle"),
          t("tripPublicView.joinedMsg", { title: trip?.title ?? "" }),
          [{ text: t("tripPublicView.viewMyTrips"), onPress: () => navigation.navigate("Main") }]
        );
      } else {
        Alert.alert(t("common.error"), t("tripPublicView.acceptError"));
      }
    } catch (e) {
      Alert.alert(t("common.error"), parseApiError(e) || t("tripPublicView.unexpectedError"));
    } finally {
      setResponding(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      t("tripPublicView.declineTitle"),
      t("tripPublicView.declineMsg", { title: trip?.title ?? "" }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripPublicView.decline"),
          style: "destructive",
          onPress: async () => {
            if (!invitationToken) return;
            setResponding(true);
            try {
              const ok = await respondToInvitation(invitationToken, "decline", user?.id);
              if (ok) { setInvitationStatus("declined"); navigation.goBack(); }
              else Alert.alert(t("common.error"), t("tripPublicView.declineError"));
            } catch (e) {
              Alert.alert(t("common.error"), parseApiError(e) || t("tripPublicView.unexpectedError"));
            } finally {
              setResponding(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <TripPublicSkeleton />;

  if (!trip) {
    return (
      <View style={[styles.loaderFull, { backgroundColor: colors.bg }]}>
        <Ionicons name="lock-closed-outline" size={36} color={colors.textLight} />
        <Text style={[styles.noAccessText, { color: colors.textLight }]}>{t("tripPublicView.noAccess")}</Text>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  let status: "upcoming" | "past" | "ongoing";
  if (now < start) { status = "upcoming"; }
  else if (now > end) { status = "past"; }
  else { status = "ongoing"; }
  const statusLabel = {
    upcoming: t("tripPublicView.statusUpcoming"),
    past:     t("tripPublicView.statusPast"),
    ongoing:  t("tripPublicView.statusOngoing"),
  }[status];
  const statusColor = { upcoming: "#5A8FAA", past: "#7A6A58", ongoing: "#6B8C5A" }[status];
  const statusBg    = { upcoming: "#DCF0F5", past: "#EDE5D8", ongoing: "#E2EDD9" }[status];
  const days = tripDays(trip.startDate, trip.endDate);
  const membersCount = 1 + (trip.collaborators?.length ?? 0);
  const hasInviteCta = !!invitationToken && invitationStatus === "pending";

  // Extraits communs aux deux gabarits (mobile empilé / desktop deux colonnes)
  // pour ne pas dupliquer les données ni le contenu des onglets.
  const statsData = [
    { icon: "sunny-outline",     value: t("tripPublicView.statDurationDays", { count: days }), label: t("tripPublicView.statDuration") },
    { icon: "people-outline",    value: String(membersCount),     label: t("tripPublicView.statMembers")   },
    { icon: "receipt-outline",   value: String(bookings.length),  label: t("tripPublicView.statBookings")  },
    { icon: "location-outline",  value: String(addresses.length), label: t("tripPublicView.statAddresses") },
  ];

  const descriptionBlock = trip.description ? (
    <View style={[styles.descBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.descText, { color: colors.textMid }]}>{trip.description}</Text>
    </View>
  ) : null;

  const contentTabs = (
    <TripContentTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookings={bookings}
      addresses={addresses}
      onBookingPress={(id) => navigation.navigate("BookingDetails", { bookingId: id, readOnly: true })}
    />
  );

  const coverHero = (
    <TripCoverHero
      trip={trip}
      statusLabel={statusLabel}
      statusColor={statusColor}
      statusBg={statusBg}
      insetTop={insets.top}
      onBack={() => navigation.goBack()}
      onReport={trip.ownerId === user?.id ? undefined : () => setReportSheetVisible(true)}
      style={isDesktopUp ? styles.coverDesktop : undefined}
    />
  );

  const inviteCta = hasInviteCta ? (
    <InvitationCtaBar
      responding={responding}
      onAccept={handleAccept}
      onDecline={handleDecline}
      insetBottom={insets.bottom}
    />
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: isDesktopUp
            ? SPACING.xxl
            : (hasInviteCta ? 110 + insets.bottom : insets.bottom + 32),
        }}
        showsVerticalScrollIndicator={false}
      >
        {isDesktopUp ? (
          <PageContainer width="default" flush>
            {coverHero}
            <TwoColumn
              asideWidth={320}
              style={styles.twoColumnDesktop}
              main={
                <>
                  {descriptionBlock}
                  {contentTabs}
                </>
              }
              aside={
                <View style={styles.asideDesktop}>
                  <View style={[styles.statsCardDesktop, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {statsData.map((stat) => (
                      <View key={stat.label} style={[styles.statBoxDesktop, { backgroundColor: colors.bgMid }]}>
                        <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.terra} />
                        <Text style={[styles.statValue, { color: colors.terra }]}>{stat.value}</Text>
                        <Text style={[styles.statLabel, { color: colors.textLight }]}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>
                  {inviteCta}
                </View>
              }
            />
          </PageContainer>
        ) : (
          <>
            {coverHero}

            {/* Stats */}
            <View style={styles.statsRow}>
              {statsData.map((stat) => (
                <View key={stat.label} style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
                  <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.terra} />
                  <Text style={[styles.statValue, { color: colors.terra }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textLight }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {descriptionBlock}
            {contentTabs}
          </>
        )}
      </ScrollView>

      {/* Sur desktop, l'invitation vit dans la colonne latérale : plus de bandeau flottant. */}
      {!isDesktopUp && inviteCta}

      <ReportSheet
        visible={reportSheetVisible}
        targetType="trip"
        onClose={() => setReportSheetVisible(false)}
        onSubmit={async (reason) => {
          setReportSheetVisible(false);
          try {
            await moderationApi.reportTrip(tripId, reason);
            Alert.alert(t("common.ok"), t("tripPublicView.reportedSuccess"));
          } catch (e) {
            if (__DEV__) console.warn("[TripPublicViewScreen] Erreur signalement:", e);
            Alert.alert(t("common.error"), t("tripPublicView.reportError"));
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  loaderFull: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14 },
  noAccessText: { fontSize: 15, fontFamily: F.sans400 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 3,
  },
  statValue: { fontSize: 15, fontFamily: F.sans700 },
  statLabel: { fontSize: 9, textAlign: "center" },
  descBox: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  descText: { fontSize: 14, lineHeight: 21 },

  // ── Desktop : bannière contenue, colonne latérale (stats + invitation) ────
  coverDesktop: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.xl,
  },
  twoColumnDesktop: {
    marginTop: SPACING.xl,
  },
  asideDesktop: {
    gap: SPACING.md,
  },
  statsCardDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.md,
  },
  statBoxDesktop: {
    width: "47%",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 3,
  },
});

export default TripPublicViewScreen;
