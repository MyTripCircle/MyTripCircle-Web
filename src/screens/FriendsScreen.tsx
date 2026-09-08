import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  LayoutAnimation,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useFriends } from "../contexts/FriendsContext";
import { useAuth } from "../contexts/AuthContext";
import { Friend, FriendRequest, FriendSuggestion } from "../types";
import { F, FONT_SIZE, SPACING } from "../theme";
import { ApiService } from "../services/ApiService";
import { useTranslation } from "react-i18next";
import { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { PageContainer, PageHeader } from "../components/layout";
import SkeletonBox from "../components/SkeletonBox";
import FriendsTabBar from "../components/friends/FriendsTabBar";
import FriendsTab from "../components/friends/FriendsTab";
import RequestsTab from "../components/friends/RequestsTab";
import SuggestionsTab from "../components/friends/SuggestionsTab";
import BackButton from "../components/ui/BackButton";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

type Tab = "friends" | "requests" | "suggestions";

const FriendsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();
  const {
    friends,
    friendRequests,
    suggestions,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    removeFriend,
    refreshFriendRequests,
    refreshFriends,
    refreshSuggestions,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sharingLink, setSharingLink] = useState(false);

  const handleTabChange = (tab: Tab) => {
    LayoutAnimation.configureNext({
      duration: 240,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.85 },
    });
    setActiveTab(tab);
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshFriendRequests();
      refreshFriends();
      refreshSuggestions();
    }, [])
  );

  const receivedRequests = friendRequests.filter(
    (r) => r.status === "pending" && r.senderId !== user?.id
  );
  const sentRequests = friendRequests.filter(
    (r) => r.status === "pending" && r.senderId === user?.id
  );
  const totalPending = receivedRequests.length;

  const filteredFriends = friends.filter((f) =>
    searchQuery.trim() ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSendToSuggestion = async (suggestion: FriendSuggestion) => {
    try {
      setSending(true);
      const res = await sendFriendRequest({ recipientEmail: suggestion.email });
      navigation.navigate("FriendRequestConfirmation", {
        recipientName: suggestion.name,
        recipientEmail: suggestion.email,
        autoAccepted: !!res?.autoAccepted,
      });
    } catch (error: unknown) {
      Alert.alert(t("common.error"), parseApiError(error) || t("friends.sendError"));
    } finally {
      setSending(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      await respondToFriendRequest(requestId, action);
      if (action === "accept") Alert.alert(t("friends.success"), t("friends.requestAccepted"));
    } catch (error: unknown) {
      Alert.alert(t("common.error"), parseApiError(error) || t("friends.sendError"));
    }
  };

  const handleCancelRequest = (request: FriendRequest) => {
    const name = request.recipientName || request.recipientEmail || request.recipientPhone || t("common.unknown");
    Alert.alert(
      t("friends.cancelRequest"),
      t("friends.cancelRequestConfirm", { name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("friends.cancelRequest"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancelFriendRequest(request.id);
            } catch (error: unknown) {
              Alert.alert(t("common.error"), parseApiError(error) || t("friends.sendError"));
            }
          },
        },
      ]
    );
  };

  const handleShareInviteLink = async () => {
    setSharingLink(true);
    try {
      const { link } = await ApiService.getFriendInviteLink();
      await Share.share({ message: t("friends.shareMessage", { link }), title: "MyTripCircle" });
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : "";
      if (raw !== "User did not share") {
        Alert.alert(t("common.error"), parseApiError(error) || t("friends.sendError"));
      }
    } finally {
      setSharingLink(false);
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    Alert.alert(
      t("friends.removeFriend"),
      t("friends.removeFriendConfirm", { name: friend.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("friends.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(friend.friendId);
            } catch (error: unknown) {
              Alert.alert(t("common.error"), parseApiError(error) || t("friends.sendError"));
            }
          },
        },
      ]
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={{ paddingHorizontal: 14, paddingTop: 8, gap: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 }}>
              <SkeletonBox width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width="60%" height={14} borderRadius={6} />
                <SkeletonBox width="40%" height={12} borderRadius={5} />
              </View>
              <SkeletonBox width={80} height={32} borderRadius={16} />
            </View>
          ))}
        </View>
      );
    }

    if (activeTab === "friends") {
      return (
        <FriendsTab
          friends={filteredFriends}
          sharingLink={sharingLink}
          searchQuery={searchQuery}
          colors={colors}
          t={t}
          onShareInviteLink={handleShareInviteLink}
          onSearchChange={setSearchQuery}
          onFriendPress={(friendId, friendName) => navigation.navigate("FriendProfile", { friendId, friendName })}
          onFriendLongPress={handleRemoveFriend}
        />
      );
    }

    if (activeTab === "requests") {
      return (
        <RequestsTab
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
          colors={colors}
          t={t}
          onRespond={handleRespondRequest}
          onCancel={handleCancelRequest}
        />
      );
    }

    return (
      <SuggestionsTab
        suggestions={suggestions}
        sending={sending}
        colors={colors}
        t={t}
        onSuggestionPress={(friendId, friendName) => navigation.navigate("FriendProfile", { friendId, friendName })}
        onAddSuggestion={handleSendToSuggestion}
      />
    );
  };

  const addFriendButton = (
    <TouchableOpacity
      style={[
        styles.addCircleBtn,
        { backgroundColor: colors.terra, shadowColor: colors.terra },
        isDesktopUp && styles.addFriendBtnWide,
        offlineStyle,
      ]}
      onPress={() => navigation.navigate("AddFriend")}
      disabled={offlineDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t("friends.addFriendLabel")}
    >
      {isDesktopUp ? (
        <Text style={styles.addFriendBtnLabel}>{t("friends.addFriendLabel")}</Text>
      ) : (
        <Text style={styles.addCirclePlus}>+</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <PageContainer width="wide" flush={!isTabletUp} style={styles.page}>
        {isDesktopUp ? (
          <PageHeader
            title={t("friends.title")}
            actions={addFriendButton}
            onBack={() => navigation.goBack()}
            alwaysShowBack
          />
        ) : (
          <View style={[styles.header, !isTabletUp && styles.headerMobileInset, { backgroundColor: colors.bg }]}>
            <BackButton onPress={() => navigation.goBack()} />
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t("friends.title")}</Text>
            </View>
            {addFriendButton}
          </View>
        )}

        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isDesktopUp && styles.scrollContentDesktop]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <FriendsTabBar
            activeTab={activeTab}
            friendsCount={friends.length}
            totalPending={totalPending}
            onTabChange={handleTabChange}
            t={t}
            colors={colors}
          />
          {renderTabContent()}
        </ScrollView>
      </PageContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 14, paddingBottom: 14 },
  headerMobileInset: { paddingHorizontal: 24 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: F.sans700 },
  addCircleBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  addFriendBtnWide: {
    flexDirection: "row", width: "auto", gap: SPACING.xs, paddingHorizontal: SPACING.lg,
  },
  addCirclePlus: { fontSize: 22, color: "#FFFFFF", lineHeight: 26, marginTop: -1, fontFamily: F.sans400 },
  addFriendBtnLabel: { fontSize: FONT_SIZE.base, fontFamily: F.sans600, color: "#FFFFFF" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  // Écran poussé sans îlot de navigation : une réserve basse mobile n'a plus lieu d'être.
  scrollContentDesktop: { paddingBottom: SPACING.xxl },
});

export default FriendsScreen;
