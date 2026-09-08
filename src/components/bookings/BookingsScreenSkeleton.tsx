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
const CARD_MIN_WIDTH = 380;

const SkeletonCard: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.card}>
      <SkeletonBox width={6} height={96} borderRadius={0} style={{ borderRadius: 0 }} />
      <View style={{ flex: 1, backgroundColor: colors.bgMid, padding: 14, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SkeletonBox width={130} height={16} borderRadius={6} />
          <SkeletonBox width={70} height={22} borderRadius={10} />
        </View>
        <SkeletonBox width="80%" height={12} borderRadius={5} />
        <SkeletonBox width="50%" height={12} borderRadius={5} />
      </View>
    </View>
  );
};

const BookingsScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();

  const header = (
    <View style={[styles.header, isTabletUp && styles.headerFlush]}>
      <SkeletonBox width={isDesktopUp ? 260 : 160} height={isDesktopUp ? 40 : 28} borderRadius={8} />
      <SkeletonBox width={isDesktopUp ? 190 : 44} height={44} borderRadius={isDesktopUp ? 14 : 22} />
    </View>
  );

  const pills = (
    <View style={[styles.pillsRow, isTabletUp && styles.pillsRowFlush]}>
      {[{ id: "p1", w: 80 }, { id: "p2", w: 60 }, { id: "p3", w: 60 }, { id: "p4", w: 80 }, { id: "p5", w: 70 }].map(({ id, w }) => (
        <SkeletonBox key={id} width={w} height={34} borderRadius={20} />
      ))}
    </View>
  );

  const body = isTabletUp ? (
    <PageContainer width="wide">
      {header}
      {pills}
      <CardGrid minColumnWidth={CARD_MIN_WIDTH}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </CardGrid>
    </PageContainer>
  ) : (
    <>
      {header}
      {pills}
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
    <SwipeToNavigate currentIndex={1} totalTabs={5}>
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
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerFlush: { paddingHorizontal: 0, paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  pillsRow: { flexDirection: "row", paddingHorizontal: 14, gap: 8, marginBottom: 16 },
  pillsRowFlush: { paddingHorizontal: 0, marginBottom: SPACING.lg },
  cardList: { paddingHorizontal: 14, gap: 12 },
  card: { borderRadius: 16, overflow: "hidden", flexDirection: "row" },
});

export default BookingsScreenSkeleton;
