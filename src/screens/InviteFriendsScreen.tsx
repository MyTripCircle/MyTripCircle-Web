import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import SkeletonBox from "../components/SkeletonBox";
import { useInviteFriends } from "../hooks/useInviteFriends";
import MemberRow from "../components/inviteFriends/MemberRow";
import BackButton from "../components/ui/BackButton";
import PendingRow from "../components/inviteFriends/PendingRow";
import MemberActionSheet from "../components/inviteFriends/MemberActionSheet";
import InvitePanelSheet from "../components/inviteFriends/InvitePanelSheet";
import { F, SPACING } from "../theme";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

const daysUntil = (date: Date) =>
  Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));

type ScreenRouteProp = RouteProp<RootStackParamList, "InviteFriends">;
type ScreenNavProp = StackNavigationProp<RootStackParamList, "InviteFriends">;

const InviteFriendsScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavProp>();
  const { tripId } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();

  const {
    trip,
    owner,
    activeMembers,
    pendingInvitations,
    friends,
    friendsToInvite,
    alreadyMembers,
    invitationLink,
    linkExpiry,
    loading,
    actionLoading,
    showInvitePanel,
    invitedFriends,
    emailInput,
    setEmailInput,
    sendingInvitations,
    inviteCount,
    selectedMember,
    isOwner,
    backdropAnim,
    sheetY,
    inviteAnim,
    inviteBackdrop,
    inviteY,
    openSheet,
    closeSheet,
    openInvitePanel,
    closeInvitePanel,
    handleShareLink,
    handleRenewLink,
    handleCancelInvitation,
    handleRemoveMember,
    handleTransferOwnership,
    handleViewProfile,
    toggleFriend,
    handleSendInvitations,
  } = useInviteFriends(tripId);

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
        <PageContainer
          width="default"
          flush={!isTabletUp}
          style={[{ paddingTop: 16, gap: 16 }, !isTabletUp && { paddingHorizontal: 14 }]}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
            <SkeletonBox width={180} height={20} borderRadius={8} />
          </View>

          {/* Trip info card */}
          <SkeletonBox width="100%" height={80} borderRadius={12} />

          {/* Invite link */}
          <SkeletonBox width="100%" height={52} borderRadius={12} />

          {/* Section label */}
          <SkeletonBox width={120} height={14} borderRadius={6} />

          {/* Member rows */}
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 2 }}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width="55%" height={14} borderRadius={6} />
                <SkeletonBox width="35%" height={12} borderRadius={5} />
              </View>
              <SkeletonBox width={72} height={30} borderRadius={15} />
            </View>
          ))}
        </PageContainer>
      </SafeAreaView>
    );
  }

  const inviteButton = (
    <TouchableOpacity style={[s.inviteBtn, { backgroundColor: colors.terra, shadowColor: colors.terra }, offlineStyle]} onPress={openInvitePanel} disabled={offlineDisabled}>
      <Text style={s.inviteBtnTxt}>{t("inviteFriends.inviteBtn")}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgLight} />

      <PageContainer width="default" flush={!isTabletUp} style={s.page}>
        {isDesktopUp ? (
          <PageHeader
            title={t("inviteFriends.manageMembers")}
            subtitle={trip?.title}
            actions={inviteButton}
            onBack={() => navigation.goBack()}
            alwaysShowBack
          />
        ) : (
          <View style={[s.header, !isTabletUp && s.headerMobileInset, { backgroundColor: colors.bgLight }]}>
            <BackButton onPress={() => navigation.goBack()} />
            <View style={{ flex: 1, alignItems: "center" }}>
              {trip && (
                <Text style={[s.headerSub, { color: colors.textLight }]} numberOfLines={1}>
                  {trip.title}
                </Text>
              )}
              <Text style={[s.headerTitle, { color: colors.text }]}>
                {t("inviteFriends.manageMembers")}
              </Text>
            </View>
            {inviteButton}
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.content, !isTabletUp && s.contentMobileInset, isDesktopUp && s.contentDesktop]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[s.linkCard, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
            <Text style={[s.linkTitle, { color: colors.terra }]}>
              {t("inviteFriends.linkTitle")}
            </Text>
            <View style={s.linkRow}>
              <Text
                style={[s.linkUrl, { color: colors.textMid, backgroundColor: colors.surface }]}
                numberOfLines={1}
              >
                {invitationLink || t("inviteFriends.linkGenerating")}
              </Text>
              <TouchableOpacity
                style={[s.copyBtn, { backgroundColor: colors.terra }, offlineStyle]}
                onPress={handleShareLink}
                disabled={!invitationLink || offlineDisabled}
              >
                <Text style={s.copyBtnTxt}>{t("inviteFriends.linkShare")}</Text>
              </TouchableOpacity>
            </View>
            {linkExpiry && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                <Text style={[s.expiryTxt, { color: colors.terra }]}>
                  {t("inviteFriends.linkExpiry", { count: daysUntil(linkExpiry) })}
                </Text>
                <TouchableOpacity onPress={handleRenewLink} disabled={offlineDisabled} style={offlineStyle}>
                  <Text
                    style={[
                      s.expiryTxt,
                      { color: colors.terra, fontFamily: F.sans600, textDecorationLine: "underline" },
                    ]}
                  >
                    {t("inviteFriends.linkRenew")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {owner && (
            <>
              <Text style={[s.sec, { color: colors.textMid }]}>
                {t("inviteFriends.sectionOrganizer")}
              </Text>
              <View style={isTabletUp && s.ownerRowWideSpacing}>
                <MemberRow member={owner} isOwner={isOwner} onPress={openSheet} />
              </View>
            </>
          )}

          {activeMembers.length > 0 && (
            <>
              <Text style={[s.sec, { marginTop: 4, color: colors.textMid }]}>
                {t("inviteFriends.sectionMembers", { count: activeMembers.length })}
              </Text>
              {isTabletUp ? (
                <CardGrid minColumnWidth={320}>
                  {activeMembers.map((m) => (
                    <MemberRow key={m.userId} member={m} isOwner={isOwner} onPress={openSheet} />
                  ))}
                </CardGrid>
              ) : (
                activeMembers.map((m) => (
                  <MemberRow key={m.userId} member={m} isOwner={isOwner} onPress={openSheet} />
                ))
              )}
            </>
          )}

          {pendingInvitations.length > 0 && (
            <>
              <Text style={[s.sec, { marginTop: 4, color: colors.textMid }]}>
                {t("inviteFriends.sectionPending", { count: pendingInvitations.length })}
              </Text>
              {isTabletUp ? (
                <CardGrid minColumnWidth={320}>
                  {pendingInvitations.map((inv) => (
                    <PendingRow
                      key={inv._id || inv.id}
                      invitation={inv}
                      friends={friends}
                      isOwner={isOwner}
                      onCancel={handleCancelInvitation}
                    />
                  ))}
                </CardGrid>
              ) : (
                pendingInvitations.map((inv) => (
                  <PendingRow
                    key={inv._id || inv.id}
                    invitation={inv}
                    friends={friends}
                    isOwner={isOwner}
                    onCancel={handleCancelInvitation}
                  />
                ))
              )}
            </>
          )}

          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openInvitePanel}
          >
            <View style={[s.addBtnIcon, { backgroundColor: colors.terraLight }]}>
              <Text style={{ fontSize: 22, color: colors.terra, fontFamily: F.sans400 }}>+</Text>
            </View>
            <Text style={[s.addBtnTxt, { color: colors.textLight }]}>
              {t("inviteFriends.inviteFromFriends")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </PageContainer>

      {actionLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.terra} />
        </View>
      )}

      {selectedMember && (
        <MemberActionSheet
          member={selectedMember}
          isOwner={isOwner}
          backdropAnim={backdropAnim}
          sheetY={sheetY}
          onClose={closeSheet}
          onViewProfile={handleViewProfile}
          onTransfer={handleTransferOwnership}
          onRemove={handleRemoveMember}
        />
      )}

      {showInvitePanel && (
        <InvitePanelSheet
          inviteAnim={inviteAnim}
          inviteBackdrop={inviteBackdrop}
          inviteY={inviteY}
          friendsToInvite={friendsToInvite}
          alreadyMembers={alreadyMembers}
          invitedFriends={invitedFriends}
          emailInput={emailInput}
          sendingInvitations={sendingInvitations}
          inviteCount={inviteCount}
          onClose={closeInvitePanel}
          onToggleFriend={toggleFriend}
          onChangeEmail={setEmailInput}
          onSend={handleSendInvitations}
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  page: { flex: 1 },
  content: { paddingBottom: 50, paddingTop: 10 },
  // Dès la tablette, `PageContainer` porte déjà la marge horizontale de la page.
  contentMobileInset: { paddingHorizontal: 20 },
  contentDesktop: { paddingBottom: SPACING.xxl },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 14, paddingBottom: 14 },
  headerMobileInset: { paddingHorizontal: 24 },
  // La grille porte déjà l'espacement entre cartes : la rangée seule (organisateur)
  // a besoin qu'on le lui rende.
  ownerRowWideSpacing: { marginBottom: SPACING.md },
  headerSub: { fontFamily: F.sans400, fontSize: 14, textAlign: "center" },
  headerTitle: { fontFamily: F.sans700, fontSize: 20, textAlign: "center" },
  inviteBtn: { borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 3 },
  inviteBtnTxt: { fontFamily: F.sans600, fontSize: 15, color: "#FFFFFF" },
  linkCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 18 },
  linkTitle: { fontFamily: F.sans600, fontSize: 14, marginBottom: 10 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkUrl: { flex: 1, fontFamily: F.sans400, fontSize: 13, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  copyBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  copyBtnTxt: { fontFamily: F.sans600, fontSize: 13, color: "#FFFFFF" },
  expiryTxt: { fontFamily: F.sans400, fontSize: 12 },
  sec: { fontFamily: F.sans700, fontSize: 16, textTransform: "uppercase", letterSpacing: 1.2, paddingTop: 10, paddingBottom: 10 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 2, borderStyle: "dashed", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 16, marginTop: 8 },
  addBtnIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  addBtnTxt: { fontFamily: F.sans400, fontSize: 15 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(253,250,245,0.65)", alignItems: "center", justifyContent: "center" },
});

export default InviteFriendsScreen;
