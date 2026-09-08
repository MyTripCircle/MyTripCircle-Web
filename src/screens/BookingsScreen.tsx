import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert, ScrollView, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Booking, RootStackParamList } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import { parseApiError } from "../utils/i18n";
import BookingForm from "../components/BookingForm";
import AddBookingButton from "../components/bookings/AddBookingButton";
import BookingCard from "../components/bookings/BookingCard";
import BookingsEmptyState from "../components/bookings/BookingsEmptyState";
import BookingsFilterBar from "../components/bookings/BookingsFilterBar";
import BookingsListHeader from "../components/bookings/BookingsListHeader";
import BookingsScreenSkeleton from "../components/bookings/BookingsScreenSkeleton";
import { BookingFilterType } from "../components/bookings/bookingsFilters";
import { CardGrid, PageContainer, PageHeader } from "../components/layout";
import ItemActionSheet from "../components/ItemActionSheet";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

// Largeur en dessous de laquelle une carte de réservation devient illisible.
const CARD_MIN_WIDTH = 380;

const BookingsScreen: React.FC = () => {
  const { bookings, loading, createBooking, updateBooking, deleteBooking, refreshData } = useTrips();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Main">>();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();
  const insets = useSafeAreaInsets();
  // La barre d'onglets flottante disparaît au palier desktop : plus de réserve basse.
  const listPaddingBottom = isDesktopUp ? SPACING.xxl : 100 + Math.max(insets.bottom, 12);
  const [selectedFilter, setSelectedFilter] = useState<BookingFilterType>("all");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  if (loading) return <BookingsScreenSkeleton />;

  const filteredBookings = bookings.filter(
    (booking) => selectedFilter === "all" || booking.type === selectedFilter
  );

  const handleSaveBooking = async (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createBooking({ ...booking, tripId: booking.tripId || "" });
      await refreshData();
      setShowBookingForm(false);
    } catch (error) {
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("bookings.saveError") || t("bookings.createBookingError")
      );
    }
  };

  const handleSaveEdit = async (updates: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
    if (!actionBooking) return;
    try {
      await updateBooking(actionBooking.id, updates);
      await refreshData();
      setShowEditForm(false);
      setActionBooking(null);
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error) || t("bookings.details.errorUpdateBooking"));
    }
  };

  const handleDeletePress = () => {
    if (!actionBooking) return;
    const id = actionBooking.id;
    setActionBooking(null);
    Alert.alert(
      t("common.delete"),
      t("bookings.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBooking(id);
              await refreshData();
            } catch (error) {
              Alert.alert(t("common.error"), parseApiError(error) || t("bookings.details.errorDeleteBooking"));
            }
          },
        },
      ]
    );
  };

  /**
   * Sur desktop une carte se comporte comme un lien vers sa page — la page de
   * détail porte déjà l'édition et la suppression. Sur mobile, la feuille
   * d'actions reste le geste attendu.
   */
  const handleCardPress = (booking: Booking) => {
    if (isDesktopUp) {
      navigation.navigate("BookingDetails", { bookingId: booking.id });
      return;
    }
    setActionBooking(booking);
  };

  const openCreateForm = () => setShowBookingForm(true);

  const emptyState = (
    <BookingsEmptyState
      filter={selectedFilter}
      onAdd={openCreateForm}
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
            title={t("bookings.header")}
            subtitle={t("bookings.count", { count: filteredBookings.length })}
            actions={<AddBookingButton onPress={openCreateForm} disabled={offlineDisabled} style={offlineStyle} />}
          />
        ) : (
          <BookingsListHeader
            count={filteredBookings.length}
            onAdd={openCreateForm}
            addDisabled={offlineDisabled}
            addStyle={offlineStyle}
            flush
          />
        )}
        <BookingsFilterBar selected={selectedFilter} onSelect={setSelectedFilter} />
        {filteredBookings.length === 0 ? emptyState : (
          <CardGrid minColumnWidth={CARD_MIN_WIDTH}>
            {filteredBookings.map((item) => (
              <BookingCard
                key={item.id}
                booking={item}
                inGrid
                onPress={() => handleCardPress(item)}
              />
            ))}
          </CardGrid>
        )}
      </PageContainer>
    </ScrollView>
  );

  const renderListBody = () => (
    <>
      <BookingsListHeader
        count={filteredBookings.length}
        onAdd={openCreateForm}
        addDisabled={offlineDisabled}
        addStyle={offlineStyle}
      />
      <BookingsFilterBar selected={selectedFilter} onSelect={setSelectedFilter} />
      {filteredBookings.length === 0 ? emptyState : (
        <View style={styles.listWrapper}>
          <FlatList
            data={filteredBookings}
            renderItem={({ item }) => (
              <BookingCard booking={item} onPress={() => handleCardPress(item)} />
            )}
            keyExtractor={(item, index) => item.id || `booking-${index}`}
            contentContainerStyle={[styles.bookingsList, { paddingBottom: listPaddingBottom }]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </>
  );

  const screen = (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {isTabletUp ? renderGridBody() : renderListBody()}

        <BookingForm
          visible={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          onSave={handleSaveBooking}
        />

        <BookingForm
          visible={showEditForm}
          onClose={() => { setShowEditForm(false); setActionBooking(null); }}
          onSave={handleSaveEdit}
          initialBooking={actionBooking ?? undefined}
        />

        <ItemActionSheet
          visible={!!actionBooking && !showEditForm}
          title={actionBooking?.title ?? ""}
          onClose={() => setActionBooking(null)}
          onEdit={() => setShowEditForm(true)}
          onDelete={handleDeletePress}
        />
      </View>
    </SafeAreaView>
  );

  // Le glissement latéral entre onglets n'a de sens que là où la barre d'onglets
  // existe : à la souris, il détournerait la sélection de texte.
  if (isDesktopUp) return screen;

  return (
    <SwipeToNavigate currentIndex={1} totalTabs={5}>
      {screen}
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  listWrapper: { flex: 1 },
  bookingsList: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
});

export default BookingsScreen;
