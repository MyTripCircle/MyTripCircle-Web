import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F } from "../../theme/fonts";
import TripCreateButton from "./TripCreateButton";

interface Props {
  firstName: string;
  onCreate: () => void;
  disabled?: boolean;
}

/**
 * Bandeau d'accueil des voyages pour les paliers mobile et tablette.
 *
 * Au palier desktop l'écran passe à `PageHeader` : le logo et la salutation
 * cèdent la place à un titre de page et à ses actions.
 */
const TripsHeader: React.FC<Props> = ({ firstName, onCreate, disabled }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  return (
    <View style={[styles.header, isTabletUp && styles.headerFlush]}>
      <View style={styles.headerLeft}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View>
          <Text style={[styles.headerEyebrow, { color: colors.textLight }]}>
            {t("trips.greeting", { name: firstName })}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("trips.header")}</Text>
        </View>
      </View>
      <TripCreateButton onPress={onCreate} disabled={disabled} compact={!isTabletUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  // La marge horizontale vient de `PageContainer` dès la tablette.
  headerFlush: { paddingHorizontal: 0, paddingTop: 20, paddingBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLogo: { width: 44, height: 44, borderRadius: 12 },
  headerEyebrow: { fontSize: 14, fontFamily: F.sans400, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontFamily: F.sans700 },
});

export default TripsHeader;
