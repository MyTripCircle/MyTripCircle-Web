import React from "react";
import { ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useSubscriptionIap } from "../hooks/useSubscriptionIap";
import { useManageSubscription } from "../hooks/useManageSubscription";
import { useSubscription } from "../contexts/SubscriptionContext";
import { formatDate } from "../utils/i18n";
import PlanCard from "../components/PlanCard";
import ActiveSubscriptionCard from "../components/subscription/ActiveSubscriptionCard";
import DemoModeBanner from "../components/subscription/DemoModeBanner";
import SubscriptionFeaturesCard from "../components/subscription/SubscriptionFeaturesCard";

/** Avantages listés par offre, dans l'ordre de retour de la boutique. */
const PLAN_ADVANTAGE_KEYS = [
  ["monthlyAdvantage1", "monthlyAdvantage2", "monthlyAdvantage3", "monthlyAdvantage4"],
  [
    "annualAdvantage1",
    "annualAdvantage2",
    "annualAdvantage3",
    "annualAdvantage4",
    "annualAdvantage5",
  ],
];

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isMobile, isTabletUp, isDesktopUp } = useBreakpoint();

  const { products, loadingId, onSubscribe, isExpoGo } = useSubscriptionIap();
  const { manageSubscription, opening } = useManageSubscription();
  const { isPremium, subscription } = useSubscription();
  const premium = isPremium();

  // Un écran de vente s'étale sur toute la largeur pour comparer les offres ;
  // la gestion d'un abonnement actif reste une colonne de lecture.
  const contentWidth = premium ? "narrow" : "default";
  const gutterOverride = isMobile ? styles.mobileGutter : undefined;

  const renewalLine = (() => {
    if (!subscription) return t("subscription.activeBannerActive");
    if (subscription.status === "cancelled" && subscription.endDate) {
      return t("subscription.activeBannerCancelledUntil", {
        date: formatDate(subscription.endDate),
      });
    }
    if (subscription.nextBillingDate) {
      return t("subscription.activeBannerNextBilling", {
        date: formatDate(subscription.nextBillingDate),
      });
    }
    return t("subscription.activeBannerActive");
  })();

  const renderPlans = () => (
    <CardGrid minColumnWidth={320} maxColumns={2} gap={SPACING.lg} style={styles.plans}>
      {products.map((product, index) => (
        <PlanCard
          key={product.productId}
          id={product.productId}
          title={product.title || product.productId}
          price={product.localizedPrice}
          advantages={(PLAN_ADVANTAGE_KEYS[index] ?? PLAN_ADVANTAGE_KEYS[0]).map((key) =>
            t(`subscription.${key}`),
          )}
          onSubscribe={onSubscribe}
          loading={loadingId === product.productId}
          recommended={index === 1}
          priceUnit={index === 0 ? t("subscription.perMonth") : t("subscription.perYear")}
        />
      ))}
    </CardGrid>
  );

  return (
    <SafeAreaView
      style={[styles.wrapper, { backgroundColor: colors.bg }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <PageContainer width={contentWidth} style={gutterOverride}>
        <PageHeader
          title={t("subscription.title")}
          subtitle={isDesktopUp ? t("subscription.subtitle") : undefined}
          onBack={() => navigation.goBack()}
          alwaysShowBack
        />
      </PageContainer>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // La gestion d'abonnement tient dans un écran mobile ; sur navigateur la
        // hauteur de fenêtre est imprévisible, le défilement reste nécessaire.
        scrollEnabled={!premium || isTabletUp}
      >
        <PageContainer width={contentWidth} style={gutterOverride}>
          {isExpoGo && <DemoModeBanner />}

          {premium ? (
            <ActiveSubscriptionCard
              renewalLine={renewalLine}
              onManage={manageSubscription}
              opening={opening}
            />
          ) : (
            renderPlans()
          )}

          <SubscriptionFeaturesCard variant={premium ? "premium" : "default"} />
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingTop: SPACING.md, paddingBottom: 64 },
  /** Marge horizontale d'origine de l'écran, conservée sous le palier tablette. */
  mobileGutter: { paddingHorizontal: SPACING.lg },
  // Le badge « recommandé » dépasse du haut de la carte : on lui laisse la place.
  plans: { paddingTop: SPACING.xs },
});

export default SubscriptionScreen;
