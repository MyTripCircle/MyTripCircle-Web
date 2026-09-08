import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Booking } from "../types";
import TicketScannerModal from "./TicketScannerModal";
import i18n from "i18next";
import { F } from "../theme/fonts";
import { LAYOUT, RADIUS, SHADOW, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useBookingForm, needsEndDate, isTransport } from "../hooks/useBookingForm";
import type { AddressSuggestion } from "../services/PlacesService";
import AttachmentsSection from "./bookingForm/AttachmentsSection";
import DateTimeSection from "./bookingForm/DateTimeSection";
import DirectionSelector from "./bookingForm/DirectionSelector";
import PickerModal from "./bookingForm/PickerModal";
import RenameAttachmentModal from "./bookingForm/RenameAttachmentModal";
import BackButton from "./ui/BackButton";
import { TypePill, StatusPillItem } from "./bookingForm/BookingFormPills";
import { getTypeLabels, STATUSES, statusLabel, getSafeDate } from "./bookingForm/bookingFormConstants";
import DateTimeField from "./ui/DateTimeField";

const SCREEN_WIDTH = Dimensions.get("window").width;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDatePickerTitle(t: (k: string) => string, type: Booking["type"], direction: string | undefined): string {
  if (isTransport(type)) return t("bookings.departureDate");
  return needsEndDate(type, direction) ? t("bookings.startDate") : t("bookings.date");
}

function getLocale(language: string): string {
  return language === "fr" ? "fr_FR" : "en_US";
}

type FormHandle = ReturnType<typeof useBookingForm>;
type ThemeColors = ReturnType<typeof useTheme>["colors"];

function AndroidDatePickers({ form, safeDate, safeEndDate }: Readonly<{ form: FormHandle; safeDate: Date; safeEndDate: Date }>) {
  if (Platform.OS !== "android") return null;
  return (
    <>
      {form.showDatePicker && <DateTimeField value={safeDate} mode="date" display="default" onChange={(e, d) => form.handleDateChange(e, d, "start")} />}
      {form.showEndDatePicker && <DateTimeField value={safeEndDate} mode="date" display="default" onChange={(e, d) => form.handleDateChange(e, d, "end")} />}
      {form.showTimePicker && <DateTimeField value={form.getTimePickerValue()} mode="time" display="default" onChange={form.handleTimeChange} />}
      {form.showReturnTimePicker && <DateTimeField value={form.getReturnTimePickerValue()} mode="time" display="default" onChange={form.handleReturnTimeChange} />}
    </>
  );
}

/** iOS et web : le sélecteur vit dans une modale ; Android ouvre son propre dialogue système. */
function ModalPickersBlock({ form, safeDate, safeEndDate, colors, t, locale }: Readonly<{
  form: FormHandle; safeDate: Date; safeEndDate: Date; colors: ThemeColors; t: (k: string) => string; locale: string;
}>) {
  if (Platform.OS === "android") return null;
  const startTitle = getDatePickerTitle(t, form.formData.type, form.formData.tripDirection);
  const timeTitle  = isTransport(form.formData.type) ? t("bookings.departureTime") : t("bookings.time");
  const endTitle   = form.formData.type === "hotel" ? t("bookings.endDate") : t("bookings.directionLabels.return");
  return (
    <>
      <PickerModal visible={form.showDatePicker} title={startTitle} onClose={() => form.setShowDatePicker(false)} colors={colors} t={t}>
        <DateTimeField value={safeDate} mode="date" display="spinner" onChange={(e, d) => form.handleDateChange(e, d, "start")} textColor={colors.text} locale={locale} accessibilityLabel={startTitle} />
      </PickerModal>
      <PickerModal visible={form.showTimePicker} title={timeTitle} onClose={() => form.setShowTimePicker(false)} colors={colors} t={t}>
        <DateTimeField value={form.getTimePickerValue()} mode="time" display="spinner" onChange={form.handleTimeChange} textColor={colors.text} accessibilityLabel={timeTitle} />
      </PickerModal>
      <PickerModal visible={form.showEndDatePicker} title={endTitle} onClose={() => form.setShowEndDatePicker(false)} colors={colors} t={t}>
        <DateTimeField value={safeEndDate} mode="date" display="spinner" onChange={(e, d) => form.handleDateChange(e, d, "end")} textColor={colors.text} locale={locale} accessibilityLabel={endTitle} />
      </PickerModal>
      <PickerModal visible={form.showReturnTimePicker} title={t("bookings.returnTime")} onClose={() => form.setShowReturnTimePicker(false)} colors={colors} t={t}>
        <DateTimeField value={form.getReturnTimePickerValue()} mode="time" display="spinner" onChange={form.handleReturnTimeChange} textColor={colors.text} accessibilityLabel={t("bookings.returnTime")} />
      </PickerModal>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SuggestionsList({ colors, data, icon, onSelect }: Readonly<{
  colors: ThemeColors; data: AddressSuggestion[]; icon: keyof typeof Ionicons.glyphMap; onSelect: (item: AddressSuggestion) => void;
}>) {
  return (
    <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.placeId}
        scrollEnabled={false}
        style={styles.suggestionsList}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.suggestionItem, { borderBottomColor: colors.bgMid }]} onPress={() => onSelect(item)}>
            <Ionicons name={icon} size={16} color={colors.textMid} style={styles.suggestionIcon} />
            <Text style={[styles.suggestionText, { color: colors.text }]}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function OriginDestinationSection({ form, colors, t }: Readonly<{ form: FormHandle; colors: ThemeColors; t: (k: string) => string }>) {
  const icon = form.formData.type === "flight" ? "airplane-outline" : "train-outline";
  return (
    <>
      <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.origin ? styles.fieldBoxError : null]}>
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.origin")} *</Text>
        <TextInput
          style={[styles.fieldInput, { color: colors.text }, form.fieldErrors.origin ? styles.fieldInputError : null]}
          value={form.formData.origin}
          onChangeText={(v) => { form.handleOriginChange(v); if (form.fieldErrors.origin) form.setFieldErrors((e) => ({ ...e, origin: undefined })); }}
          placeholder={t("bookings.originPlaceholder")}
          placeholderTextColor={colors.textLight}
        />
        {form.fieldErrors.origin ? <Text style={styles.inlineError}>{form.fieldErrors.origin}</Text> : null}
        {form.showOriginSuggestions && form.originSuggestions.length > 0 && (
          <SuggestionsList colors={colors} data={form.originSuggestions} icon={icon} onSelect={form.handleSelectOrigin} />
        )}
      </View>

      <View style={styles.transportArrowRow}>
        <Ionicons name="arrow-down" size={18} color={colors.textLight} />
      </View>

      <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.destination ? styles.fieldBoxError : null]}>
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.destination")} *</Text>
        <TextInput
          style={[styles.fieldInput, { color: colors.text }, form.fieldErrors.destination ? styles.fieldInputError : null]}
          value={form.formData.destination}
          onChangeText={(v) => { form.handleDestinationChange(v); if (form.fieldErrors.destination) form.setFieldErrors((e) => ({ ...e, destination: undefined })); }}
          placeholder={t("bookings.destinationPlaceholder")}
          placeholderTextColor={colors.textLight}
        />
        {form.fieldErrors.destination ? <Text style={styles.inlineError}>{form.fieldErrors.destination}</Text> : null}
        {form.showDestinationSuggestions && form.destinationSuggestions.length > 0 && (
          <SuggestionsList colors={colors} data={form.destinationSuggestions} icon={icon} onSelect={form.handleSelectDestination} />
        )}
      </View>
    </>
  );
}

function TitleField({ form, colors, t }: Readonly<{ form: FormHandle; colors: ThemeColors; t: (k: string) => string }>) {
  return (
    <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.title ? styles.fieldBoxError : null]}>
      <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.title")} *</Text>
      {form.formData.type === "flight" ? (
        <Text style={[styles.fieldValue, { color: form.formData.title ? colors.text : colors.textLight }]}>
          {form.formData.title || t("bookings.flightTitlePlaceholder")}
        </Text>
      ) : (
        <TextInput
          style={[styles.fieldInput, { color: colors.text }, form.fieldErrors.title ? styles.fieldInputError : null]}
          value={form.formData.title}
          onChangeText={(v) => { form.handleInputChange("title", v); if (form.fieldErrors.title) form.setFieldErrors((e) => ({ ...e, title: undefined })); }}
          placeholder={t("bookings.titlePlaceholder")}
          placeholderTextColor={colors.textLight}
        />
      )}
      {form.fieldErrors.title ? <Text style={styles.inlineError}>{form.fieldErrors.title}</Text> : null}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookingFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => void;
  initialBooking?: Partial<Booking>;
  tripStartDate?: Date;
  tripEndDate?: Date;
  preselectedTripId?: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────

const BookingForm: React.FC<BookingFormProps> = (props) => {
  const { visible, onClose, initialBooking } = props;
  const { t }      = useTranslation();
  const { colors, isDark } = useTheme();
  const insets     = useSafeAreaInsets();
  const { isDesktopUp } = useBreakpoint();
  const TYPE_LABELS = getTypeLabels(t);

  const form = useBookingForm(props);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [internalVisible, setInternalVisible] = useState(false);

  const springConfig = {
    damping: 1000,
    stiffness: 1000,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    useNativeDriver: true,
  };

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      slideAnim.setValue(SCREEN_WIDTH);
      Animated.spring(slideAnim, { toValue: 0, ...springConfig }).start();
    } else if (internalVisible) {
      Animated.spring(slideAnim, { toValue: SCREEN_WIDTH, ...springConfig }).start(() => setInternalVisible(false));
    }
  }, [visible]);

  const safeDate    = getSafeDate(form.formData.date);
  const safeEndDate = getSafeDate(form.formData.endDate);
  const locale      = getLocale(i18n.language);

  // Corps du formulaire : identique sur mobile (plein écran glissant) et sur
  // desktop (boîte centrée) — seule l'enveloppe change.
  const formBody = (
    <>
      {/* ── Scan ── */}
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: colors.bgMid, borderColor: colors.border }]}
        onPress={() => form.setShowScanner(true)}
        activeOpacity={0.75}
      >
        <Ionicons name="scan-outline" size={20} color="#5A8FAA" style={{ marginRight: 8 }} />
        <Text style={[styles.scanButtonText, { color: "#5A8FAA" }]}>{t("bookings.scanTicketButton")}</Text>
      </TouchableOpacity>

      {/* ── Type ── */}
      <View style={styles.typePillsContainer}>
        <View style={styles.typePillsRow}>
          {(["flight", "train", "hotel"] as Booking["type"][]).map((type) => (
            <TypePill key={type} type={type} isSelected={form.formData.type === type} label={TYPE_LABELS[type]} colors={colors} isDark={isDark} onPress={() => form.handleInputChange("type", type)} />
          ))}
        </View>
        <View style={styles.typePillsRow}>
          {(["restaurant", "activity"] as Booking["type"][]).map((type) => (
            <TypePill key={type} type={type} isSelected={form.formData.type === type} label={TYPE_LABELS[type]} colors={colors} isDark={isDark} onPress={() => form.handleInputChange("type", type)} />
          ))}
        </View>
      </View>

      {/* ── Direction (vol / train) ── */}
      {isTransport(form.formData.type) && (
        <DirectionSelector
          value={form.formData.tripDirection}
          onChange={(dir) => form.handleInputChange("tripDirection", dir)}
          colors={colors}
          t={t}
        />
      )}

      {/* ── Origine / Destination (vol / train) ── */}
      {isTransport(form.formData.type) && (
        <OriginDestinationSection form={form} colors={colors} t={t} />
      )}

      {/* ── Titre ── */}
      <TitleField form={form} colors={colors} t={t} />

      {/* ── Date + Heure ── */}
      <DateTimeSection form={form} colors={colors} t={t} />

      {/* Pickers en modale (iOS + web) */}
      <ModalPickersBlock form={form} safeDate={safeDate} safeEndDate={safeEndDate} colors={colors} t={t} locale={locale} />

      {/* ── Adresse ── */}
      <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.address")}</Text>
        <TextInput style={[styles.fieldInput, { color: colors.text }]} value={form.formData.address} onChangeText={form.handleAddressChange} placeholder={t("bookings.addressPlaceholder")} placeholderTextColor={colors.textLight} />
        {form.showAddressSuggestions && form.addressSuggestions.length > 0 && (
          <SuggestionsList colors={colors} data={form.addressSuggestions} icon="location" onSelect={form.handleSelectAddress} />
        )}
      </View>

      {/* ── Statut ── */}
      <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.statusLabel")}</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((status) => (
            <StatusPillItem
              key={status}
              status={status}
              label={statusLabel(t, status)}
              isSelected={form.formData.status === status}
              colors={colors}
              onPress={() => form.handleInputChange("status", status)}
            />
          ))}
        </View>
      </View>

      {/* ── Pièces jointes ── */}
      <AttachmentsSection form={form} colors={colors} t={t} />

      {/* ── Bouton principal ── */}
      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.terra }]} onPress={form.handleSave} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>
          {initialBooking ? t("common.save") : t("bookings.newBooking")}
        </Text>
      </TouchableOpacity>
    </>
  );

  // ── Desktop : boîte centrée plutôt que le panneau plein écran mobile ──
  if (isDesktopUp) {
    return (
      <Modal visible={internalVisible} animationType="fade" transparent>
        <View style={styles.desktopOverlay}>
          <View style={[styles.desktopBox, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, styles.desktopHeader, { backgroundColor: colors.bg, borderBottomColor: colors.bgMid }]}>
              <Text style={[styles.headerTitle, styles.desktopHeaderTitle, { color: colors.text }]} numberOfLines={1}>
                {initialBooking ? t("bookings.editBooking") : t("bookings.newBooking")}
              </Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.bgMid }]}
                onPress={onClose}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t("bookings.closeForm")}
              >
                <Ionicons name="close" size={22} color={colors.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {formBody}
            </ScrollView>

            <TicketScannerModal visible={form.showScanner} onClose={() => form.setShowScanner(false)} onFill={form.handleScanFill} />
            <RenameAttachmentModal form={form} colors={colors} t={t} />
          </View>
        </View>
      </Modal>
    );
  }

  // ── Mobile/tablette : panneau plein écran glissant depuis la droite ──
  return (
    <Modal visible={internalVisible} animationType="none" transparent={true}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <Animated.View style={{ flex: 1, backgroundColor: colors.bg, transform: [{ translateX: slideAnim }] }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom", "left", "right"]}>

        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 6, backgroundColor: colors.bg, borderBottomColor: colors.bgMid }]}>
          <BackButton onPress={onClose} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {initialBooking ? t("bookings.editBooking") : t("bookings.newBooking")}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {formBody}
        </ScrollView>

        {/* Platform pickers */}
        <AndroidDatePickers form={form} safeDate={safeDate} safeEndDate={safeEndDate} />

        {/* Scanner */}
        <TicketScannerModal visible={form.showScanner} onClose={() => form.setShowScanner(false)} onFill={form.handleScanFill} />

        {/* Modal renommage pièce jointe */}
        <RenameAttachmentModal form={form} colors={colors} t={t} />

      </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20, fontFamily: F.sans700,
    flex: 1, textAlign: "center", marginHorizontal: 8,
  },
  // Desktop : boîte centrée plafonnée à `LAYOUT.maxWidth.narrow`, au lieu du
  // panneau plein écran mobile — cf. `AddressForm` pour le même principe de
  // fermeture par croix plutôt que par flèche retour.
  desktopOverlay: {
    flex: 1,
    backgroundColor: "rgba(42, 35, 24, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  desktopBox: {
    width: "100%",
    maxWidth: LAYOUT.maxWidth.narrow,
    maxHeight: "88%",
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    ...SHADOW.strong,
  },
  desktopHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  desktopHeaderTitle: {
    textAlign: "left",
    marginHorizontal: 0,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingBottom: 40 },
  scanButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 20, marginBottom: 4, marginHorizontal: 20,
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed",
  },
  scanButtonText: { fontSize: 15, fontFamily: F.sans600 },
  typePillsContainer: { marginTop: 20, marginBottom: 8, gap: 12 },
  typePillsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  fieldBox: {
    backgroundColor: "#FFFFFF", borderRadius: RADIUS.card, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 16, marginHorizontal: 20, marginBottom: 12,
  },
  fieldLabel: { fontSize: 13, fontFamily: F.sans400, marginBottom: 6 },
  fieldValue: { fontSize: 18, fontFamily: F.sans400 },
  fieldInput: { fontSize: 18, fontFamily: F.sans400, padding: 0, margin: 0 },
  fieldBoxError: { borderColor: "#C04040", borderWidth: 1.5 },
  fieldInputError: { color: "#C04040" },
  inlineError: { fontSize: 12, color: "#C04040", marginTop: 4, fontFamily: F.sans400 },
  statusRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  transportArrowRow: {
    alignItems: "center", marginTop: -4, marginBottom: 8,
  },
  primaryButton: {
    borderRadius: RADIUS.card,
    paddingVertical: 19, marginHorizontal: 20, marginTop: 14,
    alignItems: "center", ...SHADOW.medium,
  },
  primaryButtonText: { fontSize: 19, fontFamily: F.sans700, color: "#FFFFFF" },
  suggestionsContainer: {
    marginTop: 8, borderRadius: RADIUS.button, borderWidth: 1,
    shadowColor: "#2A2318", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10,
  },
  suggestionsList: { maxHeight: 150 },
  suggestionItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  suggestionIcon: { marginRight: 12 },
  suggestionText: { flex: 1, fontSize: 14, fontFamily: F.sans400 },
});

export default BookingForm;
