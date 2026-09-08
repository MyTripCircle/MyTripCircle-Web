import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Address } from "../../types";
import { GeoCoords } from "../../utils/geocoding";
import { F, FONT_SIZE, SPACING } from "../../theme";
import AddressCard from "../addresses/AddressCard";

interface Props {
  addresses: Address[];
  mapCoords: Record<string, GeoCoords>;
  selectedAddressId: string | null;
  colors: any;
  isDark: boolean;
  t: (key: string) => string;
  onSelect: (address: Address) => void;
}

/**
 * Panneau latéral de la carte plein écran (palier desktop) : liste des
 * adresses synchronisée avec les marqueurs — sélectionner une ligne recentre
 * la carte, cliquer un marqueur met la ligne correspondante en surbrillance.
 *
 * Réutilise `AddressCard` (même carte que la liste `AddressesScreen`) plutôt
 * que d'inventer une variante : seules deux props additives (`selected`,
 * `unlocated`) changent son état.
 */
const AddressListPanel: React.FC<Props> = ({
  addresses,
  mapCoords,
  selectedAddressId,
  colors,
  isDark,
  t,
  onSelect,
}) => {
  return (
    <View
      style={[styles.panel, { backgroundColor: colors.bg, borderColor: colors.borderLight }]}
      accessibilityRole="list"
      accessibilityLabel={t("addresses.map.panelLabel")}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("addresses.emptyTitle")}</Text>
        ) : (
          addresses.map((item) => (
            <AddressCard
              key={item.id}
              item={item}
              colors={colors}
              isDark={isDark}
              t={t}
              onPress={onSelect}
              selected={item.id === selectedAddressId}
              unlocated={mapCoords[item.id] == null}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: 360,
    flexShrink: 0,
    borderRightWidth: 1,
  },
  content: { padding: SPACING.md, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.base, fontFamily: F.sans400, padding: SPACING.md, textAlign: "center" },
});

export default AddressListPanel;
