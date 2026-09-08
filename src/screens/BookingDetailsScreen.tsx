import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Booking } from "../types";
import { useTranslation } from "react-i18next";
import { parseApiError } from "../utils/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTrips } from "../contexts/TripsContext";
import { ApiService } from "../services/ApiService";
import BookingForm from "../components/BookingForm";
import BookingActionButtons from "../components/bookingDetails/BookingActionButtons";
import BookingAttachments from "../components/bookingDetails/BookingAttachments";
import BookingDetailsSkeleton from "../components/bookingDetails/BookingDetailsSkeleton";
import BookingHeroCover from "../components/bookingDetails/BookingHeroCover";
import BookingInfoPills from "../components/bookingDetails/BookingInfoPills";
import BookingSummaryCard from "../components/bookingDetails/BookingSummaryCard";
import { PageContainer, TwoColumn } from "../components/layout";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { F } from "../theme/fonts";
import { RADIUS, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { getBookingHeroGradient } from "../utils/bookingHelpers";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

type BookingDetailsScreenRouteProp = RouteProp<RootStackParamList, "BookingDetails">;
type BookingDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, "BookingDetails">;

const BookingDetailsScreen: React.FC = () => {
  const route      = useRoute<BookingDetailsScreenRouteProp>();
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const { bookingId, readOnly = false } = route.params;
  const { t }      = useTranslation();
  const insets     = useSafeAreaInsets();
  const { bookings, updateBooking, deleteBooking } = useTrips();
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();

  const [booking, setBooking]     = useState<Booking | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => { loadBooking(); }, [bookingId, bookings]);

  const loadBooking = async () => {
    setLoading(true);
    const found = bookings.find((b) => b.id === bookingId || b._id === bookingId);
    if (found) { setBooking(found); setLoading(false); return; }
    try {
      const data = await ApiService.getBookingById(bookingId);
      setBooking({
        id: data._id ?? data.id, _id: data._id, tripId: data.tripId,
        type: data.type, title: data.title, description: data.description,
        date: data.date, endDate: data.endDate, time: data.time,
        address: data.address, confirmationNumber: data.confirmationNumber,
        status: data.status, attachments: data.attachments,
      } as any);
    } catch (error) {
      console.error("[BookingDetailsScreen] Erreur lors du chargement de la réservation:", error);
      setBooking(null);
    }
    setLoading(false);
  };

  const handleSaveBooking = async (updates: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
    if (!booking) return;
    const id = (booking as any)._id ?? booking.id;
    try {
      await updateBooking(id, updates);
      await loadBooking();
      setShowEditForm(false);
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error) || t("bookings.details.errorUpdateBooking"));
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      t("bookings.details.cancelBooking"),
      t("bookings.details.cancelConfirm"),
      [
        { text: t("bookings.details.no"), style: "cancel" },
        {
          text: t("bookings.details.yes"),
          style: "destructive",
          onPress: async () => {
            try {
              const id = (booking as any)?._id ?? booking?.id;
              if (id) await deleteBooking(id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(t("common.error"), parseApiError(error) || t("bookings.details.errorDeleteBooking"));
            }
          },
        },
      ]
    );
  };

  const handleViewAttachment = async (attachment: string) => {
    const isUri = attachment.startsWith("file://") || attachment.startsWith("content://")
      || attachment.startsWith("https://") || attachment.startsWith("ph://");
    if (!isUri) { Alert.alert(t("common.error"), t("bookings.details.fileNotAccessible")); return; }
    try {
      await Linking.openURL(attachment);
    } catch (e) {
      if (__DEV__) console.warn("[BookingDetailsScreen] Erreur ouverture fichier:", e);
      Alert.alert(t("common.error"), t("bookings.details.fileOpenError"));
    }
  };

  if (loading) return <BookingDetailsSkeleton />;

  if (!booking) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.bg }]}>
        <Text style={[styles.centeredStateText, { color: colors.danger }]}>
          {t("bookings.details.notFound")}
        </Text>
      </View>
    );
  }

  const gradient = getBookingHeroGradient(booking.type);
  const attachments = booking.attachments ?? [];

  // `flush` : sur desktop, `PageContainer` porte déjà la marge horizontale — la
  // carte ne doit pas en ajouter une seconde.
  const renderDescriptionCard = (flush: boolean) => (booking.description ? (
    <View
      style={[
        styles.descriptionCard,
        !flush && styles.descriptionCardMargin,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.descriptionCardTitle, { color: colors.textLight }]}>{t("bookings.details.description")}</Text>
      <Text style={[styles.descriptionCardBody, { color: colors.text }]}>{booking.description}</Text>
    </View>
  ) : null);

  const actionButtons = readOnly ? null : (
    <BookingActionButtons
      onEdit={() => setShowEditForm(true)}
      onDelete={handleCancelBooking}
      disabled={offlineDisabled}
      disabledStyle={offlineStyle}
      vertical={isDesktopUp}
    />
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <BookingHeroCover
          booking={booking}
          gradient={gradient}
          insetTop={insets.top}
          onBack={() => navigation.goBack()}
        />

        {isDesktopUp ? (
          <PageContainer width="default">
            <TwoColumn
              main={(
                <View style={styles.desktopMain}>
                  {renderDescriptionCard(true)}
                  <BookingAttachments attachments={attachments} onOpen={handleViewAttachment} layout="grid" />
                </View>
              )}
              aside={(
                <View style={styles.desktopAside}>
                  <BookingSummaryCard booking={booking} />
                  {actionButtons}
                </View>
              )}
            />
          </PageContainer>
        ) : (
          <>
            <BookingInfoPills booking={booking} />

            {booking.confirmationNumber ? (
              <View style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.confirmLabel, { color: colors.textLight }]}>{t("bookings.details.confirmationNumberShort")}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>{booking.confirmationNumber}</Text>
              </View>
            ) : null}

            <BookingAttachments attachments={attachments} onOpen={handleViewAttachment} layout="row" />

            {renderDescriptionCard(false)}

            {actionButtons}
          </>
        )}
      </ScrollView>

      {booking && (
        <BookingForm
          visible={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveBooking}
          initialBooking={booking}
          preselectedTripId={booking.tripId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  centeredState: { flex: 1, justifyContent: "center", alignItems: "center" },
  centeredStateText: { fontSize: 16, fontFamily: F.sans400 },
  confirmCard: { marginHorizontal: 18, marginBottom: 10, borderWidth: 1, borderRadius: RADIUS.card, paddingHorizontal: 16, paddingVertical: 12 },
  confirmLabel: { fontSize: 11, fontFamily: F.sans400, marginBottom: 4 },
  confirmValue: { fontSize: 17, fontFamily: F.sans600, letterSpacing: 0.5 },
  descriptionCard: { marginBottom: 12, borderWidth: 1, borderRadius: RADIUS.card, paddingHorizontal: 16, paddingVertical: 12 },
  descriptionCardMargin: { marginHorizontal: 18 },
  descriptionCardTitle: { fontSize: 11, fontFamily: F.sans400, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  descriptionCardBody: { fontSize: 14, fontFamily: F.sans400, lineHeight: 22 },
  // Desktop : les cartes n'ont plus de marge horizontale propre, `PageContainer` la porte déjà.
  desktopMain: { gap: SPACING.lg },
  desktopAside: { gap: SPACING.md },
});

export default BookingDetailsScreen;
