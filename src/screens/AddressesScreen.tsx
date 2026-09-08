import React from "react";
import { FlatList, ScrollView, StatusBar, View, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Address, RootStackParamList } from "../types";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useAddresses } from "../hooks/useAddresses";
import AddAddressButton from "../components/addresses/AddAddressButton";
import AddressCard from "../components/addresses/AddressCard";
import AddressesEmptyState from "../components/addresses/AddressesEmptyState";
import AddressesListHeader from "../components/addresses/AddressesListHeader";
import AddressesScreenSkeleton from "../components/addresses/AddressesScreenSkeleton";
import AddressFilterBar from "../components/addresses/AddressFilterBar";
import AddressMapWidget from "../components/addresses/AddressMapWidget";
import ItemActionSheet from "../components/ItemActionSheet";
import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import { styles } from "../components/addresses/addressStyles";
import { SPACING } from "../theme";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

// Largeur en dessous de laquelle une carte d'adresse devient illisible.
const CARD_MIN_WIDTH = 320;

const AddressesScreen: React.FC = () => {
  const {
    t,
    colors,
    isDark,
    addresses,
    loading,
    selectedFilter,
    setSelectedFilter,
    mapCoords,
    isGeocoding,
    widgetRegion,
    filteredAddresses,
    eyebrow,
    actionAddress,
    setActionAddress,
    handleAddressPress,
    handleEditAddress,
    handleDeleteAddress,
    handleAddAddress,
    handleOpenFullMap,
  } = useAddresses();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Main">>();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();
  const insets = useSafeAreaInsets();
  const tabBarClearance = 78 + Math.max(insets.bottom, 12);
  // La barre d'onglets flottante disparaît au palier desktop : plus de réserve basse.
  const listPaddingBottom = isDesktopUp ? SPACING.xxl : tabBarClearance + 24;

  const handleDeletePress = () => {
    if (!actionAddress) return;
    const id = actionAddress.id;
    setActionAddress(null);
    Alert.alert(
      t("addresses.details.deleteTitle"),
      t("addresses.details.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => handleDeleteAddress(id),
        },
      ]
    );
  };

  /**
   * Sur desktop une carte se comporte comme un lien vers sa page — la page de
   * détail porte déjà l'édition et la suppression. Sur mobile, la feuille
   * d'actions reste le geste attendu. Même logique que `BookingsScreen`.
   */
  const handleCardPress = (address: Address) => {
    if (isDesktopUp) {
      navigation.navigate("AddressDetails", { addressId: address.id });
      return;
    }
    handleAddressPress(address);
  };

  if (loading) return <AddressesScreenSkeleton />;

  const emptyState = (
    <AddressesEmptyState
      filter={selectedFilter}
      onAdd={handleAddAddress}
      addDisabled={offlineDisabled}
      addStyle={offlineStyle}
      inFlow={isTabletUp}
    />
  );

  const renderGridBody = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: listPaddingBottom }}
      showsVerticalScrollIndicator={false}
    >
      <PageContainer width="wide">
        {isDesktopUp ? (
          <PageHeader
            title={t("addresses.header")}
            subtitle={eyebrow}
            actions={<AddAddressButton onPress={handleAddAddress} disabled={offlineDisabled} style={offlineStyle} />}
          />
        ) : (
          <AddressesListHeader
            eyebrow={eyebrow}
            onAdd={handleAddAddress}
            addDisabled={offlineDisabled}
            addStyle={offlineStyle}
            flush
          />
        )}
        <AddressFilterBar
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          colors={colors}
          t={t}
        />
        <AddressMapWidget
          addresses={addresses}
          mapCoords={mapCoords}
          isGeocoding={isGeocoding}
          widgetRegion={widgetRegion}
          onOpenFullMap={handleOpenFullMap}
          flush
        />
        {filteredAddresses.length === 0 ? emptyState : (
          <CardGrid minColumnWidth={CARD_MIN_WIDTH}>
            {filteredAddresses.map((item) => (
              <AddressCard
                key={item.id}
                item={item}
                colors={colors}
                isDark={isDark}
                t={t}
                onPress={handleCardPress}
              />
            ))}
          </CardGrid>
        )}
      </PageContainer>
    </ScrollView>
  );

  const renderListBody = () => (
    <>
      <AddressesListHeader
        eyebrow={eyebrow}
        onAdd={handleAddAddress}
        addDisabled={offlineDisabled}
        addStyle={offlineStyle}
      />
      <AddressFilterBar
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        colors={colors}
        t={t}
      />
      <AddressMapWidget
        addresses={addresses}
        mapCoords={mapCoords}
        isGeocoding={isGeocoding}
        widgetRegion={widgetRegion}
        onOpenFullMap={handleOpenFullMap}
      />
      {filteredAddresses.length === 0 ? emptyState : (
        <FlatList
          data={filteredAddresses}
          renderItem={({ item }) => (
            <AddressCard
              item={item}
              colors={colors}
              isDark={isDark}
              t={t}
              onPress={handleCardPress}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: listPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  );

  const screen = (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {isTabletUp ? renderGridBody() : renderListBody()}
      </View>

      <ItemActionSheet
        visible={!!actionAddress}
        title={actionAddress?.name ?? ""}
        subtitle={actionAddress ? `${actionAddress.city}, ${actionAddress.country}` : undefined}
        onClose={() => setActionAddress(null)}
        onEdit={handleEditAddress}
        onDelete={handleDeletePress}
      />
    </SafeAreaView>
  );

  // Le glissement latéral entre onglets n'a de sens que là où la barre d'onglets
  // existe : à la souris, il détournerait la sélection de texte.
  if (isDesktopUp) return screen;

  return (
    <SwipeToNavigate currentIndex={3} totalTabs={5}>
      {screen}
    </SwipeToNavigate>
  );
};

export default AddressesScreen;
