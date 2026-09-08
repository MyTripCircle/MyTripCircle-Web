import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { PageContainer, PageHeader } from "../components/layout";
import { MarkAllReadButton } from "../components/notifications/MarkAllReadButton";
import NotifEmptyState from "../components/notifications/NotifEmptyState";
import NotifList from "../components/notifications/NotifList";
import NotifSkeleton from "../components/notifications/NotifSkeleton";
import { NotifInvitation } from "../components/notifications/types";
import BackButton from "../components/ui/BackButton";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTrips } from "../contexts/TripsContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { F, FONT_SIZE, SPACING } from "../theme";
import { parseApiError } from "../utils/i18n";

/** Priorité d'affichage : ce qui attend une réponse d'abord. */
const STATUS_ORDER: Record<string, number> = { pending: 0, accepted: 1, declined: 2 };

const sortInvitations = (invitations: NotifInvitation[]): NotifInvitation[] =>
  [...invitations].sort((a, b) => {
    const diff = (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3);
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { getUserInvitations, respondToInvitation } = useTrips();
  const { user } = useAuth();
  const { markAllAsRead, markAsRead, readIds } = useNotifications();

  const [invitations, setInvitations] = useState<NotifInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingToken, setRespondingToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.email) return;
    try {
      setInvitations(sortInvitations(await getUserInvitations(user.email)));
    } catch (e) {
      console.error("NotificationsScreen load error:", e);
    }
  }, [user?.email]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const doRespond = async (token: string, action: "accept" | "decline") => {
    setRespondingToken(token);
    try {
      const ok = await respondToInvitation(token, action, user?.id);
      if (!ok) {
        Alert.alert(t("common.error"), t("notifications.declineError"));
        return;
      }
      markAsRead(token);
      await load();
    } catch (e) {
      Alert.alert(t("common.error"), parseApiError(e) || t("friendInvitation.errorOccurred"));
    } finally {
      setRespondingToken(null);
    }
  };

  const handleDecline = (token: string) => {
    Alert.alert(
      t("notifications.declineConfirmTitle"),
      t("notifications.declineConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("notifications.decline"),
          style: "destructive",
          onPress: () => doRespond(token, "decline"),
        },
      ],
    );
  };

  const pendingCount = invitations.filter((invitation) => invitation.status === "pending").length;

  const renderBody = () => {
    if (loading) return <NotifSkeleton fluid={isTabletUp} />;
    if (invitations.length === 0) return <NotifEmptyState />;
    return (
      <NotifList
        invitations={invitations}
        readIds={readIds}
        respondingToken={respondingToken}
        onRead={markAsRead}
        onAccept={(token) => doRespond(token, "accept")}
        onDecline={handleDecline}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} translucent={false} />

      {!isDesktopUp && (
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("notifications.title")}
            </Text>
          </View>
          <MarkAllReadButton onPress={markAllAsRead} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          isDesktopUp ? styles.scrollContentDesktop : styles.scrollContent,
          !isDesktopUp && invitations.length === 0 && styles.scrollEmpty,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terra} />
        }
      >
        {/*
         * Le conteneur s'efface sous le palier tablette : l'écran garde alors
         * les marges portées par chaque carte de notification.
         */}
        <PageContainer width="default" flush={!isTabletUp}>
          {isDesktopUp && (
            <PageHeader
              title={t("notifications.title")}
              subtitle={
                pendingCount > 0
                  ? t("notifications.pendingCount", { count: pendingCount })
                  : t("notifications.allRead")
              }
              actions={<MarkAllReadButton onPress={markAllAsRead} framed />}
            />
          )}
          {renderBody()}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerCenter: { flex: 1 },
  title: { fontSize: FONT_SIZE.h3, fontFamily: F.sans700, textAlign: "center" },

  scrollContent: { paddingTop: SPACING.xs, paddingBottom: SPACING.xxl },
  scrollContentDesktop: { paddingBottom: 64 },
  scrollEmpty: { flex: 1 },
});

export default NotificationsScreen;
