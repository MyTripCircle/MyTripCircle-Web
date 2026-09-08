import React from "react";
import { View, StyleSheet, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { CardGrid, PageContainer } from "../layout";
import { SPACING } from "../../theme";
import SkeletonBox from "../SkeletonBox";

/**
 * Squelette de la liste des voyages.
 *
 * Il reproduit le gabarit réellement affiché à chaque palier — bannière large
 * plus colonne de chiffres puis grille sur desktop — pour éviter le saut de mise
 * en page au moment où les données arrivent.
 */
const TripsScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView scrollEnabled={false}>
        <PageContainer width="wide" flush={!isTabletUp}>
          <View style={[styles.header, isTabletUp && styles.headerFlush]}>
            <View style={styles.headerLeft}>
              <SkeletonBox width={44} height={44} borderRadius={12} />
              <View style={{ gap: 6 }}>
                <SkeletonBox width={120} height={12} borderRadius={6} />
                <SkeletonBox width={160} height={20} borderRadius={8} />
              </View>
            </View>
            <SkeletonBox width={isTabletUp ? 150 : 44} height={44} borderRadius={isTabletUp ? 14 : 22} />
          </View>

          {isDesktopUp ? (
            <View style={styles.heroRow}>
              <SkeletonBox height={320} borderRadius={18} style={styles.heroMain} />
              <View style={styles.heroAside}>
                {[0, 1, 2].map((i) => (
                  <SkeletonBox key={i} width="100%" height={64} borderRadius={16} />
                ))}
              </View>
            </View>
          ) : (
            <>
              <View style={[styles.heroMobile, isTabletUp && styles.heroTablet]}>
                <SkeletonBox width="100%" height={isTabletUp ? 320 : 180} borderRadius={18} />
              </View>
              <View style={[styles.pillsRow, isTabletUp && styles.pillsRowFlush]}>
                {[0, 1, 2].map((i) => (
                  <SkeletonBox key={i} height={72} borderRadius={12} style={{ flex: 1 }} />
                ))}
              </View>
            </>
          )}

          <View style={[styles.sectionHeader, isTabletUp && styles.sectionHeaderFlush]}>
            <SkeletonBox width={160} height={22} borderRadius={8} />
            {!isTabletUp && <SkeletonBox width={60} height={14} borderRadius={6} />}
          </View>

          {isTabletUp ? (
            <CardGrid minColumnWidth={260} gap={SPACING.md}>
              {[0, 1, 2, 3].map((i) => (
                <SkeletonBox key={i} width="100%" height={240} borderRadius={16} />
              ))}
            </CardGrid>
          ) : (
            <View style={styles.cardsRow}>
              {[0, 1].map((i) => (
                <SkeletonBox key={i} width={190} height={176} borderRadius={16} />
              ))}
            </View>
          )}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerFlush: { paddingHorizontal: 0, paddingTop: 20, paddingBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroMobile: { marginHorizontal: 14, marginBottom: 8 },
  heroTablet: { marginHorizontal: 0 },
  heroRow: { flexDirection: "row", gap: SPACING.lg, alignItems: "flex-start" },
  heroMain: { flex: 1 },
  heroAside: { width: 260, gap: SPACING.xs },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 12,
  },
  pillsRowFlush: { paddingHorizontal: 0 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionHeaderFlush: { paddingHorizontal: 0, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  cardsRow: { flexDirection: "row", paddingHorizontal: 14, gap: 12 },
});

export default TripsScreenSkeleton;
