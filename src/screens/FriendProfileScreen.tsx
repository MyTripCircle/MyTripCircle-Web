import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import BackButton from "../components/ui/BackButton";
import { F, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { PageContainer, TwoColumn } from "../components/layout";
import { useFriendProfileActions } from "../hooks/useFriendProfileActions";
import TripSection from "../components/friendProfile/TripSection";
import ProfileSkeleton from "../components/friendProfile/ProfileSkeleton";
import ProfileActions from "../components/friendProfile/ProfileActions";
import ReportSheet from "../components/moderation/ReportSheet";

const FriendProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors }  = useTheme();
  const insets      = useSafeAreaInsets();
  const { isTabletUp } = useBreakpoint();
  const locale      = i18n.language === "fr" ? "fr-FR" : "en-US";
  const [reportSheetVisible, setReportSheetVisible] = useState(false);

  const {
    profile, loading, sending,
    name, initials, avatarColor, isFriend,
    friendName,
    handleRemove, handleAddFriend, handleReport, handleBlock,
    goToTrip, navigateInvite, goBack,
  } = useFriendProfileActions();

  const firstName = (profile?.name || friendName).split(" ")[0];

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cover ── */}
        <View style={[styles.cover, { backgroundColor: colors.textMid }]}>
          <LinearGradient
            colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.0)", "rgba(0,0,0,0.72)"]}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />

          <BackButton variant="overlay" onPress={goBack} style={[styles.backBtn, { top: insets.top + 10 }]} />

          {!loading && (
            <View style={[styles.amiBadge, { top: insets.top + 10 }, !isFriend && styles.amiBadgeStranger]}>
              <Ionicons name={isFriend ? "checkmark" : "earth-outline"} size={15} color="#FFFFFF" />
              <Text style={styles.amiBadgeText}>{isFriend ? t("friendProfile.badgeFriend") : t("friendProfile.badgePublic")}</Text>
            </View>
          )}

          <View style={styles.identity}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatarPhoto} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View>
              <Text style={styles.coverName}>{name}</Text>
              {isFriend && profile?.friendSince && (
                <Text style={styles.coverSub}>
                  {t("friendProfile.friendSince", {
                    date: new Date(profile.friendSince).toLocaleDateString(locale, { month: "short", year: "numeric" }),
                  })}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Contenu ── */}
        <View style={[styles.body, { backgroundColor: colors.bg }]}>
          <PageContainer width="default" flush={!isTabletUp}>
            {(() => {
              if (loading) return <ProfileSkeleton />;

              const profileActions = (
                <ProfileActions
                  isFriend={isFriend}
                  sending={sending}
                  dangerBg={colors.dangerLight}
                  dangerColor={colors.danger}
                  onInvite={navigateInvite}
                  onRemove={handleRemove}
                  onAddFriend={handleAddFriend}
                  onReport={() => setReportSheetVisible(true)}
                  onBlock={handleBlock}
                />
              );

              if (profile?.isPublicProfile === false) { // NOSONAR — distingue false de undefined (profil non chargé)
                const privateCard = (
                  <View style={[styles.privateCard, !isTabletUp && styles.privateCardMobileInset, { backgroundColor: colors.bgMid, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed" size={32} color={colors.textLight} />
                    <Text style={[styles.privateTitle, { color: colors.text }]}>{t("friendProfile.privateTitle")}</Text>
                    <Text style={[styles.privateSubtitle, { color: colors.textMid }]}>
                      {t("friendProfile.privateSubtitle", { name: firstName })}
                    </Text>
                  </View>
                );

                if (isTabletUp) {
                  return <TwoColumn main={privateCard} aside={profileActions} />;
                }
                return (
                  <>
                    {privateCard}
                    {profileActions}
                  </>
                );
              }

              const recentTrips = (profile?.sharedTrips || [])
                .filter((t: any) => new Date(t.endDate) < new Date())
                .slice(0, 8);
              const friendsTrips = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "friends");
              const publicTrips  = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "public");

              const statsRow = (
                <View style={[styles.statsRow, !isTabletUp && styles.statsRowMobileInset]}>
                  {[
                    { value: profile?.stats?.totalTrips ?? 0,    label: t("friendProfile.statTrips") },
                    { value: profile?.stats?.countries ?? 0,     label: t("friendProfile.statCountries") },
                    { value: profile?.stats?.commonFriends ?? 0, label: t("friendProfile.statCommonFriends") },
                    { value: profile?.stats?.totalBookings ?? 0, label: t("friendProfile.statBookings") },
                  ].map((s) => (
                    <View key={s.label} style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
                      <Text style={[styles.statValue, { color: colors.terra }]}>{s.value}</Text>
                      <Text style={[styles.statLabel, { color: colors.textLight }]} numberOfLines={1} adjustsFontSizeToFit>{s.label}</Text>
                    </View>
                  ))}
                </View>
              );

              const commonTripsSection = isFriend && (
                <TripSection
                  title={t("friendProfile.sectionCommonTrips")}
                  marginTop={0}
                  trips={profile?.commonTrips ?? []}
                  emptyIcon="airplane-outline"
                  emptyText={t("friendProfile.emptyCommonTrips")}
                  bgMid={colors.bgMid}
                  textLight={colors.textLight}
                  onPress={goToTrip}
                />
              );

              const friendsTripsSection = isFriend && (
                <TripSection
                  title={t("friendProfile.sectionFriendsTrips")}
                  marginTop={20}
                  trips={friendsTrips}
                  emptyIcon="people-outline"
                  emptyText={t("friendProfile.emptyFriendsTrips")}
                  bgMid={colors.bgMid}
                  textLight={colors.textLight}
                  onPress={goToTrip}
                />
              );

              const publicTripsSection = (
                <TripSection
                  title={t("friendProfile.sectionPublicTrips")}
                  marginTop={20}
                  trips={publicTrips}
                  emptyIcon="earth-outline"
                  emptyText={t("friendProfile.emptyPublicTrips", { name: firstName })}
                  bgMid={colors.bgMid}
                  textLight={colors.textLight}
                  onPress={goToTrip}
                />
              );

              // Dès la tablette, l'itinéraire de lecture change : les voyages en
              // commun rejoignent les actions dans la colonne latérale, le reste
              // de la vitrine (récents, partagés, publics) reste la colonne
              // principale, sans le décalage qu'imposait la section en commun.
              if (isTabletUp) {
                return (
                  <TwoColumn
                    main={
                      <>
                        {statsRow}
                        <TripSection
                          title={t("friendProfile.sectionRecentTrips")}
                          marginTop={0}
                          trips={recentTrips}
                          emptyIcon="earth-outline"
                          emptyText={t("friendProfile.emptyRecentTrips", { name: firstName })}
                          bgMid={colors.bgMid}
                          textLight={colors.textLight}
                          onPress={goToTrip}
                        />
                        {friendsTripsSection}
                        {publicTripsSection}
                      </>
                    }
                    aside={
                      <View style={styles.asideStack}>
                        {profileActions}
                        {commonTripsSection}
                      </View>
                    }
                  />
                );
              }

              return (
                <>
                  {statsRow}
                  {commonTripsSection}
                  <TripSection
                    title={t("friendProfile.sectionRecentTrips")}
                    marginTop={isFriend ? 20 : 0}
                    trips={recentTrips}
                    emptyIcon="earth-outline"
                    emptyText={t("friendProfile.emptyRecentTrips", { name: firstName })}
                    bgMid={colors.bgMid}
                    textLight={colors.textLight}
                    onPress={goToTrip}
                  />
                  {friendsTripsSection}
                  {publicTripsSection}
                  {profileActions}
                </>
              );
            })()}
          </PageContainer>
        </View>
      </ScrollView>

      <ReportSheet
        visible={reportSheetVisible}
        targetType="user"
        onClose={() => setReportSheetVisible(false)}
        onSubmit={async (reason) => {
          setReportSheetVisible(false);
          await handleReport(reason);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  cover: {
    height: 300,
    position: "relative",
    justifyContent: "flex-end",
  },
  backBtn: {
    position: "absolute",
    left: 16,
  },
  amiBadge: {
    position: "absolute",
    top: 16, right: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(107,140,90,0.82)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  amiBadgeText:     { fontSize: 14, fontFamily: F.sans600, color: "#FFFFFF" },
  amiBadgeStranger: { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.35)" },
  identity: {
    flexDirection: "row", alignItems: "flex-end", gap: 14,
    paddingHorizontal: 18, paddingBottom: 18,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#FFFFFF",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    overflow: "hidden",
  },
  avatarPhoto: { width: 70, height: 70, borderRadius: 35 },
  avatarText:  { fontSize: 22, fontFamily: F.sans700, color: "#FFFFFF" },
  coverName:   { fontSize: 26, fontFamily: F.sans700, color: "#FFFFFF" },
  coverSub:    { fontSize: 13, fontFamily: F.sans400, color: "rgba(255,255,255,0.7)", marginTop: 3 },

  body: { flex: 1 },

  // Dès la tablette, `PageContainer` porte déjà la marge horizontale de la
  // page : la cumuler avec ces retraits mobiles décalerait le contenu.
  statsRow: {
    flexDirection: "row",
    marginTop: 16, marginBottom: 22, gap: 8,
  },
  statsRowMobileInset: { marginHorizontal: 16 },
  statBox: {
    flex: 1, borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 4, alignItems: "center",
  },
  statValue: { fontSize: 22, fontFamily: F.sans700 },
  statLabel: { fontSize: 11, fontFamily: F.sans400, textAlign: "center", marginTop: 4 },

  privateCard: {
    marginTop: 24, marginBottom: 8,
    borderRadius: 16, paddingVertical: 36, paddingHorizontal: 24,
    alignItems: "center", gap: 10, borderWidth: 1,
  },
  privateCardMobileInset: { marginHorizontal: 14 },
  privateTitle: { fontSize: 16, fontFamily: F.sans600, textAlign: "center" },
  privateSubtitle: {
    fontSize: 13, fontFamily: F.sans400,
    textAlign: "center", lineHeight: 19,
  },
  asideStack: { gap: SPACING.lg },
});

export default FriendProfileScreen;
