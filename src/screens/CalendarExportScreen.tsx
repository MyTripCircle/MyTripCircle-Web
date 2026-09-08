import React, { useCallback, useEffect, useState } from "react";
import { Alert, Clipboard, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { CalendarLinkCard } from "../components/calendarExport/CalendarLinkCard";
import { PlatformInstructions } from "../components/calendarExport/PlatformInstructions";
import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import BackButton from "../components/ui/BackButton";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { calendarApi } from "../services/api/calendarApi";
import { API_BASE_URL } from "../config/api";
import { F, FONT_SIZE, RADIUS, SPACING } from "../theme";

const CalendarExportScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isTabletUp, isDesktopUp } = useBreakpoint();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const calendarUrl = token ? `${API_BASE_URL}/calendar/${token}` : null;

  const fetchToken = useCallback(async () => {
    try {
      const res = await calendarApi.getToken();
      setToken(res.token);
    } catch (e) {
      // Aucun jeton encore généré : l'écran propose alors de le créer.
      if (__DEV__) console.warn("[CalendarExportScreen] Aucun lien iCal existant:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await calendarApi.generateToken();
      setToken(res.token);
    } catch (e) {
      if (__DEV__) console.warn("[CalendarExportScreen] Échec de génération du lien:", e);
      Alert.alert(t("calendar.errorTitle"), t("calendar.errorGenerate"));
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    Alert.alert(t("calendar.regenerateTitle"), t("calendar.regenerateWarning"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("calendar.regenerateConfirm"),
        style: "destructive",
        onPress: handleGenerate,
      },
    ]);
  };

  const handleCopy = () => {
    if (!calendarUrl) return;
    Clipboard.setString(calendarUrl);
    Alert.alert(t("calendar.copiedTitle"), t("calendar.copiedMessage"));
  };

  const instructions = (
    <CardGrid minColumnWidth={320} gap={SPACING.md}>
      <PlatformInstructions
        icon="logo-apple"
        title={t("calendar.iosTitle")}
        steps={t("calendar.iosSteps", { returnObjects: true }) as string[]}
      />
      <PlatformInstructions
        icon="logo-android"
        title={t("calendar.androidTitle")}
        steps={t("calendar.androidSteps", { returnObjects: true }) as string[]}
      />
    </CardGrid>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {!isDesktopUp && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("calendar.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={isTabletUp ? styles.contentWide : styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Un mode d'emploi se lit en colonne : la mesure de ligne reste bornée. */}
        <PageContainer width="narrow" flush={!isTabletUp} style={styles.column}>
          {isDesktopUp && (
            <PageHeader
              title={t("calendar.title")}
              onBack={() => navigation.goBack()}
              alwaysShowBack
            />
          )}

          <View style={[styles.premiumBadge, { backgroundColor: colors.terraLight }]}>
            <Ionicons name="star" size={14} color={colors.terra} />
            <Text style={[styles.premiumText, { color: colors.terra }]}>
              {t("calendar.premiumBadge")}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.textLight }]}>
            {t("calendar.description")}
          </Text>

          <CalendarLinkCard
            url={calendarUrl}
            loading={loading}
            working={generating}
            onGenerate={handleGenerate}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
          />

          {instructions}

          <View style={[styles.securityNote, { backgroundColor: colors.bgMid }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.textLight} />
            <Text style={[styles.securityText, { color: colors.textLight }]}>
              {t("calendar.securityNote")}
            </Text>
          </View>
        </PageContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontFamily: F.sans600 },
  headerSpacer: { width: 40 },

  content: { padding: SPACING.lg, paddingBottom: 40 },
  /** À partir du palier tablette, la marge horizontale vient du conteneur. */
  contentWide: { paddingVertical: SPACING.lg, paddingBottom: 64 },
  column: { gap: SPACING.md },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.xl,
  },
  premiumText: { fontSize: FONT_SIZE.sm, fontFamily: F.sans600 },

  description: { fontSize: FONT_SIZE.base, fontFamily: F.sans400, lineHeight: 22 },

  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  securityText: { flex: 1, fontSize: FONT_SIZE.sm, fontFamily: F.sans400, lineHeight: 18 },
});

export default CalendarExportScreen;
