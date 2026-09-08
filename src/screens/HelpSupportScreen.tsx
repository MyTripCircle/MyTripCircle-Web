import React from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { HelpContactCard } from "../components/help/HelpContactCard";
import { HelpFaqItem, HelpFaqList } from "../components/help/HelpFaqList";
import { HelpIntroCard } from "../components/help/HelpIntroCard";
import { PageContainer, PageHeader, TwoColumn } from "../components/layout";
import BackButton from "../components/ui/BackButton";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { F, FONT_SIZE, SPACING } from "../theme";

/** Largeur de la colonne de contact : de quoi tenir une adresse e-mail. */
const ASIDE_WIDTH = 320;

const HelpSupportScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const navigation = useNavigation();

  const faqItems: HelpFaqItem[] = [
    {
      id: "faq-1",
      icon: "airplane-outline",
      question: t("helpSupport.faq1Question"),
      answer: t("helpSupport.faq1Answer"),
      iconColor: colors.terra,
      iconBg: colors.terraLight,
    },
    {
      id: "faq-2",
      icon: "people-outline",
      question: t("helpSupport.faq2Question"),
      answer: t("helpSupport.faq2Answer"),
      iconColor: isDark ? "#8BBF76" : "#6B8C5A",
      iconBg: isDark ? "#1E2E1A" : "#E2EDD9",
    },
    {
      id: "faq-3",
      icon: "calendar-outline",
      question: t("helpSupport.faq3Question"),
      answer: t("helpSupport.faq3Answer"),
      iconColor: isDark ? "#76AACC" : "#5A8FAA",
      iconBg: isDark ? "#162230" : "#DCF0F5",
    },
    {
      id: "faq-4",
      icon: "map-outline",
      question: t("helpSupport.faq4Question"),
      answer: t("helpSupport.faq4Answer"),
      iconColor: colors.textMid,
      iconBg: colors.bgDark,
    },
  ];

  const sectionLabel = (
    <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
      {t("helpSupport.faqTitle")}
    </Text>
  );

  /**
   * Sur grand écran, un centre d'aide sépare ce qu'on lit de ce qu'on fait :
   * les questions fréquentes occupent la colonne principale, la prise de
   * contact reste visible en colonne latérale sans avoir à faire défiler.
   */
  const renderDesktop = () => (
    <PageContainer width="default">
      <PageHeader
        title={t("helpSupport.title")}
        subtitle={t("helpSupport.description")}
        onBack={() => navigation.goBack()}
        alwaysShowBack
      />
      <TwoColumn
        asideWidth={ASIDE_WIDTH}
        main={
          <View>
            {sectionLabel}
            <HelpFaqList items={faqItems} fluid />
          </View>
        }
        aside={<HelpContactCard fluid />}
      />
    </PageContainer>
  );

  const renderMobile = () => (
    // Au palier tablette la marge vient du conteneur : le corps ne la double pas.
    <View style={[styles.body, isTabletUp && styles.bodyFluid]}>
      <HelpIntroCard />
      {sectionLabel}
      <HelpFaqList items={faqItems} />
      <HelpContactCard />
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={isDesktopUp ? styles.scrollDesktop : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isDesktopUp && (
          <View style={[styles.headerBar, { backgroundColor: colors.bg }]}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("helpSupport.title")}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        )}

        {/* Sous le palier tablette, l'écran garde les marges de son corps. */}
        {isDesktopUp ? (
          renderDesktop()
        ) : (
          <PageContainer width="default" flush={!isTabletUp}>
            {renderMobile()}
          </PageContainer>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  scrollDesktop: { paddingBottom: 64 },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h3,
    fontFamily: F.sans700,
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: { width: 44 },

  body: { paddingHorizontal: SPACING.md, paddingTop: SPACING.xxs },
  bodyFluid: { paddingHorizontal: 0 },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontFamily: F.sans600,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2,
  },
});

export default HelpSupportScreen;
