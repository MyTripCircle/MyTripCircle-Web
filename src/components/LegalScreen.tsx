import React from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import BackButton from "./ui/BackButton";
import { LegalSection } from "./legal/LegalSection";
import { LegalToc } from "./legal/LegalToc";
import { useLegalToc } from "./legal/useLegalToc";
import { PageContainer, PageHeader, TwoColumn } from "./layout";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { F, FONT_SIZE, LAYOUT, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";

interface Section {
  title: string;
  body: string;
}

interface LegalScreenProps {
  readonly headerTitle: string;
  readonly lastUpdated: string;
  readonly sections: Section[];
}

/** Réserve basse et marges du contenu défilant, selon le palier atteint. */
const resolveContentStyle = (isDesktopUp: boolean, isTabletUp: boolean) => {
  if (isDesktopUp) return styles.contentDesktop;
  return isTabletUp ? styles.contentTablet : styles.content;
};

/**
 * Page légale : mesure de ligne bornée, hiérarchie de titres et sommaire
 * latéral ancré à partir du palier desktop. Sous ce palier, le bandeau compact
 * et le texte en pleine colonne d'origine sont conservés.
 */
export default function LegalScreen({ headerTitle, lastUpdated, sections }: LegalScreenProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const toc = useLegalToc();

  // Ces pages sont publiques et se partagent par lien : ouvertes directement,
  // la pile est vide et un retour arrière ne mènerait nulle part.
  const canGoBack = navigation.canGoBack();

  const body = sections.map((section, index) => (
    <LegalSection
      key={section.title}
      title={section.title}
      body={section.body}
      onMeasure={isDesktopUp ? (y) => toc.registerSection(index, y) : undefined}
    />
  ));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />

      {!isDesktopUp && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {canGoBack ? (
            <BackButton onPress={() => navigation.goBack()} />
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <Text style={[styles.headerTitle, { color: colors.text }]}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView
        ref={toc.scrollRef}
        contentContainerStyle={resolveContentStyle(isDesktopUp, isTabletUp)}
        showsVerticalScrollIndicator={false}
        onScroll={isDesktopUp ? toc.handleScroll : undefined}
        scrollEventThrottle={64}
      >
        {isDesktopUp ? (
          <PageContainer width="default">
            <PageHeader
              title={headerTitle}
              subtitle={lastUpdated || undefined}
              onBack={canGoBack ? () => navigation.goBack() : undefined}
              alwaysShowBack
            />
            <View onLayout={toc.handleBodyLayout}>
              <TwoColumn
                asideFirst
                asideWidth={240}
                main={<View style={styles.measure}>{body}</View>}
                aside={
                  <LegalToc
                    titles={sections.map((section) => section.title)}
                    activeIndex={toc.activeIndex}
                    onSelect={toc.scrollToSection}
                  />
                }
              />
            </View>
          </PageContainer>
        ) : (
          /*
           * Au palier tablette, la colonne est bornée et centrée : un texte
           * juridique lu sur 1 000 px de large devient impraticable. En dessous,
           * le conteneur s'efface, l'écran gardant ses marges d'origine.
           */
          <PageContainer width="narrow" flush={!isTabletUp}>
            <Text style={[styles.lastUpdated, { color: colors.textMid }]}>{lastUpdated}</Text>
            {body}
          </PageContainer>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === "android" ? SPACING.md : SPACING.xs,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h3,
    marginHorizontal: SPACING.xs,
  },
  headerSpacer: { width: 44 },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 40,
  },
  /** Palier tablette : la marge horizontale vient du conteneur de page. */
  contentTablet: {
    paddingTop: SPACING.lg,
    paddingBottom: 40,
  },
  // Le sommaire mesure les positions depuis le haut du contenu : aucun décalage
  // vertical ici, il serait invisible dans les mesures de mise en page.
  contentDesktop: {
    paddingBottom: 80,
  },
  /** Mesure de ligne confortable, indépendante de la largeur de la colonne. */
  measure: { maxWidth: LAYOUT.maxWidth.narrow },
  lastUpdated: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.base,
    marginBottom: SPACING.xl,
  },
});
