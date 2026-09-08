import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { PageContainer, PageHeader, TwoColumn } from "../components/layout";
import { AccountSection } from "../components/settings/AccountSection";
import { AppearanceSection } from "../components/settings/AppearanceSection";
import { NotificationsSection } from "../components/settings/NotificationsSection";
import { PrivacySection } from "../components/settings/PrivacySection";
import { SettingsSectionNav } from "../components/settings/SettingsSectionNav";
import { SETTINGS_SECTIONS, SettingsSectionKey } from "../components/settings/sections";
import { settingsStyles } from "../components/settings/settingsStyles";
import BackButton from "../components/ui/BackButton";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useTheme } from "../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../theme";

/** Largeur de la navigation de sections : assez pour les libellés les plus longs. */
const NAV_WIDTH = 232;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [activeKey, setActiveKey] = useState<SettingsSectionKey>("notifications");

  const renderSection = (key: SettingsSectionKey, fluid: boolean) => {
    switch (key) {
      case "notifications":
        return <NotificationsSection fluid={fluid} />;
      case "privacy":
        return <PrivacySection fluid={fluid} />;
      case "appearance":
        return <AppearanceSection fluid={fluid} />;
      default:
        return <AccountSection fluid={fluid} />;
    }
  };

  /**
   * Sur grand écran, la longue liste déroulante devient une navigation de
   * sections et un panneau : chaque réglage se trouve en un coup d'œil, sans
   * défilement, comme sur les préférences de n'importe quel site.
   */
  const renderDesktop = () => {
    const active = SETTINGS_SECTIONS.find((section) => section.key === activeKey);
    const panelTitle = active ? t(active.navLabelKey) : "";

    return (
      <PageContainer width="default">
        <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
        <TwoColumn
          asideFirst
          asideWidth={NAV_WIDTH}
          gap={SPACING.xxl}
          aside={<SettingsSectionNav active={activeKey} onSelect={setActiveKey} />}
          main={
            <View role="tabpanel" accessibilityLabel={panelTitle}>
              <Text
                accessibilityRole="header"
                style={[styles.panelTitle, { color: colors.text }]}
              >
                {panelTitle}
              </Text>
              {renderSection(activeKey, true)}
            </View>
          }
        />
      </PageContainer>
    );
  };

  const renderMobile = () =>
    SETTINGS_SECTIONS.map((section) => (
      <React.Fragment key={section.key}>
        {section.groupLabelKey ? (
          <Text style={[settingsStyles.sectionLabel, { color: colors.textLight }]}>
            {t(section.groupLabelKey)}
          </Text>
        ) : null}
        {renderSection(section.key, false)}
      </React.Fragment>
    ));

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {!isDesktopUp && (
        <View style={[styles.headerBar, { backgroundColor: colors.bg }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("settings.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          isDesktopUp
            ? styles.scrollContentDesktop
            : { paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xl }
        }
        showsVerticalScrollIndicator={false}
      >
        {isDesktopUp ? renderDesktop() : renderMobile()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContentDesktop: { paddingBottom: 64 },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h3,
    textAlign: "center",
  },
  headerSpacer: { width: 44 },

  panelTitle: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h3,
    marginBottom: SPACING.md,
  },
});

export default SettingsScreen;
