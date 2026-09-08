import React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { SPACING } from "../../theme";
import SkeletonBox from "../SkeletonBox";
import { PageContainer, TwoColumn } from "../layout";
import { COVER_HEIGHT } from "./ProfileCover";

/** Colonne latérale du gabarit desktop, alignée sur la carte d'identité. */
const ASIDE_WIDTH = 320;

const MobileSkeleton: React.FC = () => (
  <>
    <SkeletonBox width="100%" height={COVER_HEIGHT} borderRadius={0} />
    <View style={styles.mobileBody}>
      <View style={styles.identityRow}>
        <SkeletonBox width={72} height={72} borderRadius={36} />
        <View style={styles.identityTexts}>
          <SkeletonBox width="55%" height={18} borderRadius={7} />
          <SkeletonBox width="70%" height={13} borderRadius={5} />
        </View>
      </View>

      <View style={styles.statsRow}>
        {[0, 1, 2, 3].map((index) => (
          <SkeletonBox key={index} height={64} borderRadius={12} style={styles.statItem} />
        ))}
      </View>

      <SkeletonBox width={120} height={12} borderRadius={5} />
      <SkeletonBox width="100%" height={180} borderRadius={14} />
      <SkeletonBox width={110} height={12} borderRadius={5} />
      <SkeletonBox width="100%" height={120} borderRadius={14} />
    </View>
  </>
);

const DesktopSkeleton: React.FC = () => (
  <PageContainer width="default">
    <View style={styles.desktopHeader}>
      <SkeletonBox width={220} height={34} borderRadius={10} />
    </View>
    <TwoColumn
      asideFirst
      asideWidth={ASIDE_WIDTH}
      aside={<SkeletonBox width="100%" height={420} borderRadius={16} />}
      main={
        <View style={styles.desktopMain}>
          <SkeletonBox width="100%" height={260} borderRadius={16} />
          <SkeletonBox width="100%" height={200} borderRadius={16} />
        </View>
      }
    />
  </PageContainer>
);

/** État de chargement du profil, calqué sur la mise en page de chaque palier. */
const ProfileScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView scrollEnabled={false} contentContainerStyle={styles.content}>
        {isDesktopUp ? <DesktopSkeleton /> : <MobileSkeleton />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 100 },
  mobileBody: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.md },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  identityTexts: { flex: 1, gap: 10 },
  statsRow: { flexDirection: "row", gap: 10 },
  statItem: { flex: 1 },
  desktopHeader: { paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  desktopMain: { gap: SPACING.lg },
});

export default ProfileScreenSkeleton;
