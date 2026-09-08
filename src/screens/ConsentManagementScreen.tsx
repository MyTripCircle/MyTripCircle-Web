import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import { ConsentPreferenceRow } from "../components/consent/ConsentPreferenceRow";
import { ConsentSaveButton } from "../components/consent/ConsentSaveButton";
import { PageContainer, PageHeader } from "../components/layout";
import BackButton from "../components/ui/BackButton";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { userApi, ConsentPayload } from "../services/api/userApi";
import { CONSENT_KEY, ConsentPreferences } from "./ConsentScreen";
import { F, FONT_SIZE, RADIUS, SPACING } from "../theme";
import { RootStackParamList } from "../types";

const ConsentManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((raw) => {
      if (raw) {
        const prefs: ConsentPreferences = JSON.parse(raw);
        setLocationEnabled(prefs.location);
        setNotificationsEnabled(prefs.notifications);
      }
      setLoading(false);
    });
  }, []);

  /** Vrai si la permission système est accordée, faux si l'utilisateur refuse. */
  const ensureLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") return true;

    setLocationEnabled(false);
    Alert.alert(
      t("consentManagement.locationDeniedTitle"),
      t("consentManagement.locationDeniedMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("consentManagement.openSettings"), onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (locationEnabled && !(await ensureLocationPermission())) return;

      const prefs: ConsentPreferences = {
        data: true,
        location: locationEnabled,
        notifications: notificationsEnabled,
        acceptedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));

      const payload: ConsentPayload = {
        data: true,
        location: locationEnabled,
        notifications: notificationsEnabled,
      };
      await userApi.updateConsent(payload);

      Alert.alert(t("consentManagement.savedTitle"), t("consentManagement.savedMessage"), [
        { text: t("common.ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      if (__DEV__) console.warn("[ConsentManagementScreen] Erreur sauvegarde consentements:", e);
      Alert.alert(t("common.error"), t("consentManagement.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const renderPreferences = () => {
    if (loading) return <ActivityIndicator color={colors.terra} style={styles.loader} />;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ConsentPreferenceRow
          emoji="🔐"
          title={t("consent.dataTitle")}
          description={t("consentManagement.required")}
          value
          locked
        />
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <ConsentPreferenceRow
          emoji="📍"
          title={t("consent.locationTitle")}
          description={t("consent.locationBody")}
          value={locationEnabled}
          onToggle={setLocationEnabled}
        />
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <ConsentPreferenceRow
          emoji="🔔"
          title={t("consent.notificationsTitle")}
          description={t("consent.notificationsBody")}
          value={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {!isDesktopUp && (
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("consentManagement.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={isTabletUp ? styles.contentWide : styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Réglages de confidentialité : une colonne de lecture, pas une grille. */}
        <PageContainer width="narrow" flush={!isTabletUp}>
          {isDesktopUp ? (
            <PageHeader
              title={t("consentManagement.title")}
              subtitle={t("consentManagement.description")}
              onBack={() => navigation.goBack()}
              alwaysShowBack
              actions={
                <ConsentSaveButton
                  label={t("consentManagement.save")}
                  onPress={handleSave}
                  saving={saving}
                  disabled={loading}
                  compact
                />
              }
            />
          ) : (
            <Text style={[styles.description, { color: colors.textLight }]}>
              {t("consentManagement.description")}
            </Text>
          )}

          {renderPreferences()}

          {/* Sur desktop, l'enregistrement vit dans l'en-tête de page. */}
          {!isDesktopUp && (
            <View style={styles.saveBlock}>
              <ConsentSaveButton
                label={t("consentManagement.save")}
                onPress={handleSave}
                saving={saving}
                disabled={loading}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.privacyLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Privacy")}
            accessibilityRole="link"
            accessibilityLabel={t("consent.viewPrivacy")}
          >
            <Text style={[styles.privacyLinkText, { color: colors.terra }]}>
              {t("consent.viewPrivacy")}
            </Text>
          </TouchableOpacity>
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: SPACING.sm,
  },
  headerTitle: { fontFamily: F.sans700, fontSize: FONT_SIZE.h3, textAlign: "center" },
  headerSpacer: { width: 44 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  /** À partir du palier tablette, la marge horizontale vient du conteneur. */
  contentWide: { paddingBottom: 64 },

  description: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.md,
    lineHeight: 21,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  loader: { marginTop: 40 },
  card: { borderRadius: RADIUS.card, borderWidth: 1, overflow: "hidden", marginBottom: SPACING.xl },
  divider: { height: 1, marginHorizontal: SPACING.md },
  saveBlock: { marginBottom: SPACING.md },
  privacyLink: { alignItems: "center" },
  privacyLinkText: {
    fontFamily: F.sans500,
    fontSize: FONT_SIZE.sm,
    textDecorationLine: "underline",
  },
});

export default ConsentManagementScreen;
