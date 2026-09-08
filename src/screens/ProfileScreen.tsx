import React from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { CardGrid, PageContainer, PageHeader, TwoColumn } from "../components/layout";
import { ProfileCover } from "../components/profile/ProfileCover";
import { ProfileEditButton } from "../components/profile/ProfileEditButton";
import { ProfileIdentityCard } from "../components/profile/ProfileIdentityCard";
import { ProfileLogoutButton } from "../components/profile/ProfileLogoutButton";
import { ProfileRow } from "../components/profile/ProfileRow";
import { ProfileSection } from "../components/profile/ProfileSection";
import { ProfileStat, ProfileStats } from "../components/profile/ProfileStats";
import ProfileScreenSkeleton from "../components/profile/ProfileScreenSkeleton";
import { PublicTripCard } from "../components/profile/PublicTripCard";
import { useAuth } from "../contexts/AuthContext";
import { useFriends } from "../contexts/FriendsContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTrips } from "../contexts/TripsContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { SPACING } from "../theme";
import { RootStackParamList, Trip } from "../types";

/** Largeur de la colonne d'identité : de quoi tenir un nom et quatre chiffres. */
const ASIDE_WIDTH = 320;

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { trips, bookings, addresses, loading: tripsLoading } = useTrips();
  const { friends, loading: friendsLoading } = useFriends();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { isPremium } = useSubscription();
  const { isDesktopUp } = useBreakpoint();
  const insets = useSafeAreaInsets();

  // La barre d'onglets flottante disparaît au palier desktop : plus de réserve basse.
  const paddingBottom = isDesktopUp ? 64 : 100 + Math.max(insets.bottom, 12);

  const handleLogout = () => {
    Alert.alert(t("profile.logoutTitle"), t("profile.logoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.logout"), style: "destructive", onPress: logout },
    ]);
  };

  const stats: ProfileStat[] = [
    { value: tripsLoading ? "…" : trips.length, label: t("profile.stats.trips") },
    { value: tripsLoading ? "…" : bookings.length, label: t("profile.stats.bookings") },
    { value: friendsLoading ? "…" : friends.length, label: t("profile.stats.friends") },
    { value: tripsLoading ? "…" : addresses.length, label: t("profile.stats.addresses") },
  ];

  const publicTrips: Trip[] = user?.isPublicProfile
    ? trips.filter((trip) => trip.visibility === "public" || (trip.isPublic && !trip.visibility))
    : [];

  const accountSection = (fluid: boolean) => (
    <ProfileSection title={t("profile.sections.account")} fluid={fluid}>
      <ProfileRow
        icon="person-outline"
        label={t("profile.personalInfo")}
        onPress={() => navigation.navigate("EditProfile")}
      />
      <ProfileRow
        icon="people-outline"
        label={t("profile.myFriends")}
        badge={friends.length > 0 ? friends.length : undefined}
        onPress={() => navigation.navigate("Friends")}
      />
      <ProfileRow
        icon="mail-outline"
        label={t("profile.invitations")}
        badge={unreadCount > 0 ? unreadCount : undefined}
        onPress={() => navigation.navigate("Invitation", {})}
      />
      <ProfileRow
        icon="notifications-outline"
        label={t("profile.notifications")}
        onPress={() => navigation.navigate("Notifications")}
      />
    </ProfileSection>
  );

  const preferencesSection = (fluid: boolean) => (
    <ProfileSection title={t("profile.sections.preferences")} fluid={fluid}>
      <ProfileRow
        icon="settings-outline"
        label={t("common.settings")}
        onPress={() => navigation.navigate("Settings")}
      />
      <ProfileRow
        icon="help-circle-outline"
        label={t("common.helpSupport")}
        onPress={() => navigation.navigate("HelpSupport")}
      />
      {isPremium() ? (
        <ProfileRow
          icon="calendar-outline"
          label={t("calendar.title")}
          tinted
          onPress={() => navigation.navigate("CalendarExport")}
        />
      ) : null}
      <ProfileRow
        icon="card-outline"
        label={isPremium() ? t("subscription.manageButton") : t("profile.subscribe")}
        tinted
        onPress={() => navigation.navigate("Subscription")}
      />
    </ProfileSection>
  );

  const publicTripsSection = (fluid: boolean) => {
    if (!publicTrips.length) return null;
    return (
      <ProfileSection title={t("profile.sections.publicTrips")} fluid={fluid} bare>
        {publicTrips.map((trip) => (
          <PublicTripCard key={trip.id} trip={trip} />
        ))}
      </ProfileSection>
    );
  };

  /**
   * Sur grand écran, l'identité et les chiffres restent visibles en colonne
   * latérale pendant que les sections de navigation s'étalent en grille : la
   * page se lit d'un coup d'œil au lieu de se dérouler.
   */
  const renderDesktop = () => (
    <PageContainer width="default">
      <PageHeader
        title={t("pageTitle.profile")}
        subtitle={user?.email}
        actions={<ProfileEditButton onPress={() => navigation.navigate("EditProfile")} />}
      />
      <TwoColumn
        asideFirst
        asideWidth={ASIDE_WIDTH}
        aside={
          <ProfileIdentityCard
            name={user?.name}
            email={user?.email}
            avatar={user?.avatar}
            isPublicProfile={user?.isPublicProfile}
            stats={stats}
            onLogout={handleLogout}
          />
        }
        main={
          <View style={styles.mainColumn}>
            <CardGrid minColumnWidth={300} gap={SPACING.lg}>
              {accountSection(true)}
              {preferencesSection(true)}
            </CardGrid>
            {publicTripsSection(true)}
          </View>
        }
      />
    </PageContainer>
  );

  const renderMobile = () => (
    <>
      <ProfileCover
        name={user?.name}
        email={user?.email}
        avatar={user?.avatar}
        isPublicProfile={user?.isPublicProfile}
        onEdit={() => navigation.navigate("EditProfile")}
      />
      <ProfileStats stats={stats} />
      {accountSection(false)}
      {preferencesSection(false)}
      {publicTripsSection(false)}
      <ProfileLogoutButton onPress={handleLogout} />
    </>
  );

  if (tripsLoading && friendsLoading) {
    return (
      <SwipeToNavigate currentIndex={4} totalTabs={5}>
        <ProfileScreenSkeleton />
      </SwipeToNavigate>
    );
  }

  return (
    <SwipeToNavigate currentIndex={4} totalTabs={5}>
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar
          barStyle={isDesktopUp ? colors.statusBar : "light-content"}
          backgroundColor="transparent"
          translucent
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom }}
        >
          {isDesktopUp ? renderDesktop() : renderMobile()}
        </ScrollView>
      </View>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  mainColumn: { gap: SPACING.lg },
});

export default ProfileScreen;
