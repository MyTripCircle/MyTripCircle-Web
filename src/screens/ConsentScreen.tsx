import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { ConsentItem } from "../components/consent/ConsentItem";
import { requestPermissionAndRegisterToken } from "../hooks/usePushNotifications";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useTheme } from "../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../theme";
import { RootStackParamList } from "../types";

export const CONSENT_KEY = "@mytripcircle_consent_v1";

export interface ConsentPreferences {
  data: true;        // Obligatoire — traitement des données (toujours true)
  location: boolean; // Optionnel — géolocalisation
  notifications: boolean; // Optionnel — notifications
  acceptedAt: string;
}

interface ConsentScreenProps {
  onConsentGiven?: () => void;
}

/** Largeur de la boîte de consentement sur grand écran. */
const BOX_WIDTH = 560;

export default function ConsentScreen({ onConsentGiven }: Readonly<ConsentScreenProps>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [dataEnabled, setDataEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const saveAndContinue = async (acceptAll: boolean) => {
    const notifConsented = acceptAll ? notificationsEnabled : false;
    const prefs: ConsentPreferences = {
      data: true,
      location: acceptAll ? locationEnabled : false,
      notifications: notifConsented,
      acceptedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    if (prefs.location) {
      await Location.requestForegroundPermissionsAsync();
    }
    if (notifConsented) {
      await requestPermissionAndRegisterToken();
    }
    onConsentGiven?.();
  };

  const items = (
    <View style={styles.items}>
      <ConsentItem
        icon="🔐"
        title={t("consent.dataTitle")}
        body={t("consent.dataBody")}
        badge={t("consent.requiredBadge")}
        badgeRequired
        enabled={dataEnabled}
        onToggle={() => setDataEnabled((value) => !value)}
      />
      <ConsentItem
        icon="📍"
        title={t("consent.locationTitle")}
        body={t("consent.locationBody")}
        badge={t("consent.optionalBadge")}
        badgeRequired={false}
        enabled={locationEnabled}
        onToggle={() => setLocationEnabled((value) => !value)}
      />
      <ConsentItem
        icon="🔔"
        title={t("consent.notificationsTitle")}
        body={t("consent.notificationsBody")}
        badge={t("consent.optionalBadge")}
        badgeRequired={false}
        enabled={notificationsEnabled}
        onToggle={() => setNotificationsEnabled((value) => !value)}
      />
    </View>
  );

  const actions = (
    <View style={styles.bottom}>
      <TouchableOpacity
        style={[
          styles.btnPrimary,
          { backgroundColor: dataEnabled ? colors.terra : colors.bgDark },
        ]}
        activeOpacity={dataEnabled ? 0.85 : 1}
        onPress={() => dataEnabled && saveAndContinue(true)}
        disabled={!dataEnabled}
        accessibilityRole="button"
        accessibilityLabel={t("consent.acceptAll")}
      >
        <Text style={[styles.btnPrimaryText, { color: dataEnabled ? "#fff" : colors.textLight }]}>
          {t("consent.acceptAll")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSecondary, { borderColor: dataEnabled ? colors.border : colors.bgDark }]}
        activeOpacity={dataEnabled ? 0.7 : 1}
        onPress={() => dataEnabled && saveAndContinue(false)}
        disabled={!dataEnabled}
        accessibilityRole="button"
        accessibilityLabel={t("consent.acceptRequired")}
      >
        <Text
          style={[styles.btnSecondaryText, { color: dataEnabled ? colors.textLight : colors.bgDark }]}
        >
          {t("consent.acceptRequired")}
        </Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Privacy")}
          activeOpacity={0.7}
          accessibilityRole="link"
        >
          <Text style={[styles.link, { color: colors.terra }]}>{t("consent.viewPrivacy")}</Text>
        </TouchableOpacity>
        <Text style={[styles.linkSep, { color: colors.textLight }]}>·</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Terms")}
          activeOpacity={0.7}
          accessibilityRole="link"
        >
          <Text style={[styles.link, { color: colors.terra }]}>{t("consent.viewTerms")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      {/*
       * Sur grand écran, ce préalable au service se présente en boîte centrée,
       * comme une demande de consentement web — plutôt qu'en écran plein étiré.
       */}
      <View style={[styles.content, isTabletUp && styles.centered]}>
        <View
          style={[
            styles.column,
            isTabletUp && styles.box,
            isTabletUp && SHADOW.medium,
            isTabletUp && { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ScrollView
            style={styles.top}
            contentContainerStyle={styles.topContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel={t("nav.appName")}
              />
            </View>

            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
              {t("consent.title")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              {t("consent.subtitle")}
            </Text>

            {items}
          </ScrollView>

          {actions}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    justifyContent: "space-between",
  },
  /** Boîte centrée dans la fenêtre à partir du palier tablette. */
  centered: { alignItems: "center", justifyContent: "center" },
  column: { flex: 1, width: "100%" },
  box: {
    flexGrow: 0,
    maxWidth: BOX_WIDTH,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  top: { flex: 1 },
  topContent: { paddingBottom: SPACING.sm },
  bottom: { paddingTop: SPACING.sm },
  logoRow: { alignItems: "center", marginBottom: SPACING.sm },
  logo: { width: 64, height: 64, borderRadius: RADIUS.card },
  title: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h2,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.base,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  items: { gap: 10 },
  btnPrimary: {
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.md - 1,
    alignItems: "center",
    marginBottom: 10,
    cursor: "pointer",
  },
  btnPrimaryText: { fontFamily: F.sans700, fontSize: FONT_SIZE.xl, color: "#fff" },
  btnSecondary: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    paddingVertical: SPACING.sm + 1,
    alignItems: "center",
    marginBottom: SPACING.md,
    cursor: "pointer",
  },
  btnSecondaryText: { fontFamily: F.sans500, fontSize: FONT_SIZE.lg },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
  },
  link: { fontFamily: F.sans500, fontSize: FONT_SIZE.sm, textDecorationLine: "underline" },
  linkSep: { fontSize: FONT_SIZE.lg },
});
