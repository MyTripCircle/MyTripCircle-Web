import React from "react";
import { StyleSheet, View } from "react-native";

import { SPACING } from "../../theme";
import SkeletonBox from "../SkeletonBox";

/** Nombre de lignes fantômes : de quoi occuper une fenêtre sans en promettre trop. */
const PLACEHOLDER_ROWS = [0, 1, 2, 3, 4];

/** État de chargement de la liste des notifications. */
const NotifSkeleton: React.FC<{ fluid?: boolean }> = ({ fluid }) => (
  <View style={[styles.root, fluid && styles.rootFluid]}>
    {PLACEHOLDER_ROWS.map((row) => (
      <View key={row} style={styles.row}>
        <SkeletonBox width={44} height={44} borderRadius={22} />
        <View style={styles.texts}>
          <SkeletonBox width="75%" height={14} borderRadius={6} />
          <SkeletonBox width="50%" height={12} borderRadius={5} />
          <View style={styles.actions}>
            <SkeletonBox width={90} height={30} borderRadius={8} />
            <SkeletonBox width={90} height={30} borderRadius={8} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { paddingHorizontal: 14, paddingTop: SPACING.sm, gap: 14 },
  rootFluid: { paddingHorizontal: 0 },
  row: { flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start" },
  texts: { flex: 1, gap: SPACING.xs, paddingTop: SPACING.xxs },
  actions: { flexDirection: "row", gap: SPACING.xs, marginTop: SPACING.xxs },
});

export default NotifSkeleton;
