import React from "react";
import { View, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeToNavigate } from "../../hooks/useSwipeToNavigate";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { CardGrid, PageContainer } from "../layout";
import { SPACING } from "../../theme";
import SkeletonBox from "../SkeletonBox";

// Doit refléter la grille réelle pour que le squelette annonce la bonne mise en page.
const CARD_MIN_WIDTH = 320;

const SkeletonCard: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bgMid }]}>
      <SkeletonBox width={58} height={58} borderRadius={14} style={{ marginRight: 16 }} />
      <View style={{ flex: 1, gap: 10, marginRight: 10 }}>
        <SkeletonBox width="60%" height={16} borderRadius={6} />
        <SkeletonBox width="80%" height={13} borderRadius={5} />
      </View>
      <SkeletonBox width={56} height={30} borderRadius={999} />
    </View>
  );
};

/**
 * Squelette de chargement de la page Adresses.
 *
 * Même rôle que `BookingsScreenSkeleton` : la mise en page reflète la grille
 * réelle dès le palier tablette, pour ne pas annoncer une colonne unique qui
 * changerait de forme une fois les données arrivées.
 */
const AddressesScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();

  const header = (
    <View style={[styles.header, isTabletUp && styles.headerFlush]}>
      <SkeletonBox width={isDesktopUp ? 260 : 160} height={isDesktopUp ? 40 : 28} borderRadius={8} />
      <SkeletonBox width={isDesktopUp ? 190 : 44} height={44} borderRadius={isDesktopUp ? 14 : 22} />
    </View>
  );

  const chips = (
    <View style={[styles.chipsRow, isTabletUp && styles.chipsRowFlush]}>
      {[{ id: "f1", w: 60 }, { id: "f2", w: 80 }, { id: "f3", w: 70 }, { id: "f4", w: 65 }].map(({ id, w }) => (
        <SkeletonBox key={id} width={w} height={32} borderRadius={999} />
      ))}
    </View>
  );

  const mapWidget = (
    <SkeletonBox width="100%" height={130} borderRadius={16} style={{ marginBottom: 16 }} />
  );

  const body = isTabletUp ? (
    <PageContainer width="wide">
      {header}
      {chips}
      {mapWidget}
      <CardGrid minColumnWidth={CARD_MIN_WIDTH}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </CardGrid>
    </PageContainer>
  ) : (
    <>
      {header}
      {chips}
      <View style={{ marginHorizontal: 16 }}>{mapWidget}</View>
      <View style={styles.cardList}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </View>
    </>
  );

  const screen = (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: isDesktopUp ? SPACING.xxl : 100 }}
      >
        {body}
      </ScrollView>
    </SafeAreaView>
  );

  if (isDesktopUp) return screen;

  return (
    <SwipeToNavigate currentIndex={3} totalTabs={5}>
      {screen}
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerFlush: { paddingHorizontal: 0, paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  chipsRow: { flexDirection: "row", paddingHorizontal: 24, gap: 8, marginBottom: 12 },
  chipsRowFlush: { paddingHorizontal: 0, marginBottom: SPACING.lg },
  cardList: { paddingHorizontal: 16, gap: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
});

export default AddressesScreenSkeleton;
