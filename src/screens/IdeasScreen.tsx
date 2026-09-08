import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useTheme } from "../contexts/ThemeContext";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useIdeas } from "../hooks/useIdeas";
import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import IdeaCard from "../components/ideas/IdeaCard";
import IdeasToolbar from "../components/ideas/IdeasToolbar";
import ItineraryModal from "../components/ideas/ItineraryModal";
import { F, FONT_SIZE, SPACING } from "../theme";

/** Marge horizontale historique de l'écran sur mobile. */
const MOBILE_INSET = 24;
/** Largeur minimale d'une carte d'inspiration lisible. */
const MIN_CARD_WIDTH = 260;

const IdeasScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isTabletUp, isDesktopUp, gutter } = useBreakpoint();
  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    modalVisible,
    openModal,
    closeModal,
    cityInput,
    setCityInput,
    daysInput,
    setDaysInput,
    loading,
    itinerary,
    showCreateStep,
    setShowCreateStep,
    startDate,
    setStartDate,
    showDatePicker,
    setShowDatePicker,
    creating,
    CATEGORIES,
    filtered,
    generateItinerary,
    handleCreateTrip,
    resetItinerary,
  } = useIdeas();

  const inset = isTabletUp ? gutter : MOBILE_INSET;
  // L'îlot de navigation flottant disparaît au palier desktop : la réserve de
  // 100 px en bas de page n'a plus de raison d'être.
  const scrollPaddingBottom = isDesktopUp
    ? SPACING.xxl
    : 100 + Math.max(insets.bottom, 12);

  const aiButton = (
    <TouchableOpacity
      style={[
        styles.sparkleBtn,
        { backgroundColor: colors.terraLight },
        isDesktopUp && styles.sparkleBtnWide,
      ]}
      onPress={openModal}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t("ideas.aiButton")}
    >
      <Text style={[styles.sparkleBtnText, { color: colors.terra }]}>✦</Text>
      {isDesktopUp && (
        <Text style={[styles.sparkleBtnLabel, { color: colors.terra }]}>
          {t("ideas.aiButton")}
        </Text>
      )}
    </TouchableOpacity>
  );

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("ideas.noResults")}</Text>
    </View>
  );

  return (
    <SwipeToNavigate currentIndex={2} totalTabs={5}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.bg }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

        {/* `flush` : la barre de catégories défile à fond perdu sur mobile,
            chaque bloc porte donc sa propre marge horizontale. */}
        <PageContainer width="wide" flush style={styles.page}>
          {isDesktopUp ? (
            <View style={{ paddingHorizontal: inset }}>
              <PageHeader
                title={t("ideas.title")}
                subtitle={t("ideas.subtitle")}
                actions={aiButton}
              />
            </View>
          ) : (
            <View style={[styles.header, { paddingHorizontal: inset }]}>
              <View>
                <Text style={[styles.headerEyebrow, { color: colors.textLight }]}>
                  {t("ideas.subtitle")}
                </Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {t("ideas.title")}
                </Text>
              </View>
              {aiButton}
            </View>
          )}

          <IdeasToolbar
            search={search}
            onSearchChange={setSearch}
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            inset={inset}
          />

          {isTabletUp ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={{
                paddingHorizontal: inset,
                paddingBottom: scrollPaddingBottom,
              }}
              showsVerticalScrollIndicator={false}
            >
              {filtered.length === 0 ? (
                emptyState
              ) : (
                <CardGrid minColumnWidth={MIN_CARD_WIDTH}>
                  {filtered.map((item, index) => (
                    <IdeaCard key={item.id} item={item} index={index} />
                  ))}
                </CardGrid>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              numColumns={2}
              style={styles.flex}
              renderItem={({ item, index }) => <IdeaCard item={item} index={index} />}
              contentContainerStyle={{
                paddingHorizontal: inset,
                paddingBottom: scrollPaddingBottom,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={emptyState}
            />
          )}
        </PageContainer>

        <ItineraryModal
          visible={modalVisible}
          onClose={closeModal}
          cityInput={cityInput}
          onCityChange={setCityInput}
          daysInput={daysInput}
          onDaysChange={setDaysInput}
          loading={loading}
          itinerary={itinerary}
          showCreateStep={showCreateStep}
          onShowCreateStep={() => { setStartDate(new Date()); setShowCreateStep(true); }}
          onBackFromCreate={() => setShowCreateStep(false)}
          startDate={startDate}
          onStartDateChange={setStartDate}
          showDatePicker={showDatePicker}
          onToggleDatePicker={setShowDatePicker}
          creating={creating}
          onGenerate={generateItinerary}
          onCreateTrip={handleCreateTrip}
          onNewSearch={resetItinerary}
        />
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.md,
    paddingBottom: 14,
  },
  headerEyebrow: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xxs,
  },
  headerTitle: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h1,
  },
  sparkleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  sparkleBtnWide: {
    flexDirection: "row",
    width: "auto",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
  sparkleBtnText: {
    fontSize: FONT_SIZE.h3,
    fontFamily: F.sans400,
  },
  sparkleBtnLabel: {
    fontSize: FONT_SIZE.base,
    fontFamily: F.sans600,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    fontFamily: F.sans400,
  },
});

export default IdeasScreen;
