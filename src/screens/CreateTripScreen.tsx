import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/ui/BackButton";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { PageContainer, PageHeader } from "../components/layout";

import { useCreateTrip } from "../hooks/useCreateTrip";
import {
  TripDatePickerModal,
  AndroidDatePicker,
} from "../components/createTrip/TripDatePicker";
import TripVisibilityPicker from "../components/createTrip/TripVisibilityPicker";
import styles from "../components/createTrip/createTripStyles";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

const CreateTripScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();

  const {
    formData,
    showStartDatePicker,
    showEndDatePicker,
    showVisibilityPicker,
    loading,
    dateError,
    handleInputChange,
    handleDateChange,
    handleVisibilityChange,
    handleCreate,
    handleCancel,
    setShowStartDatePicker,
    setShowEndDatePicker,
    setShowVisibilityPicker,
  } = useCreateTrip();

  const titleInputRef = useRef<TextInput>(null);
  const destinationInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const VISIBILITY_LABELS: Record<string, string> = {
    private: t("createTrip.visibilityPrivate"),
    friends: t("createTrip.visibilityFriends"),
    public: t("createTrip.visibilityPublic"),
  };

  const createLabel = loading ? t("createTrip.creating") : t("createTrip.createButton");

  // Bouton compact relogé dans le `PageHeader` desktop — le grand bouton pleine
  // largeur plus bas n'a de sens que sur la colonne étroite du mobile.
  const headerCreateButton = (
    <TouchableOpacity
      style={[styles.headerCreateBtn, (loading || offlineDisabled) && styles.headerCreateBtnDisabled, offlineStyle]}
      onPress={handleCreate}
      disabled={loading || offlineDisabled}
      activeOpacity={0.85}
    >
      <Text style={styles.headerCreateBtnText}>{createLabel}</Text>
    </TouchableOpacity>
  );

  // Nom du voyage + destination : côte à côte au palier desktop.
  const titleField = (
    <Pressable
      onPress={() => titleInputRef.current?.focus()}
      style={[
        styles.fieldBox,
        isDesktopUp && styles.fieldHalf,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
        {t("createTrip.tripNameLabel")}
      </Text>
      <TextInput
        ref={titleInputRef}
        style={[styles.fieldInput, { color: colors.text }]}
        value={formData.title}
        onChangeText={(v: string) => handleInputChange("title", v)}
        placeholder={t("createTrip.tripNamePlaceholder")}
        placeholderTextColor={colors.textLight}
        maxLength={100}
      />
    </Pressable>
  );

  const destinationField = (
    <Pressable
      onPress={() => destinationInputRef.current?.focus()}
      style={[
        styles.fieldBox,
        isDesktopUp && styles.fieldHalf,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
        {t("createTrip.mainDestination")}
      </Text>
      <View style={styles.destRow}>
        <Text style={styles.destPin}>📍</Text>
        <TextInput
          ref={destinationInputRef}
          style={[styles.destInput, { color: colors.text }]}
          value={formData.destination}
          onChangeText={(v: string) => handleInputChange("destination", v)}
          placeholder={t("createTrip.destinationPlaceholder")}
          placeholderTextColor={colors.textLight}
          maxLength={100}
        />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
       <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
        {/* ── Header (desktop : PageHeader défilant, cf. PageContainer plus bas) ── */}
        {!isDesktopUp && (
          <View style={styles.header}>
            <BackButton onPress={handleCancel} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("createTrip.screenTitle")}
            </Text>
            <View style={{ width: 44 }} />
          </View>
        )}

        {/* ── Formulaire ── */}
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={isDesktopUp}
        >
          {/* `flush` : les marges internes du formulaire ne changent pas, seule la
              largeur maximale est plafonnée au palier desktop (pas de double marge). */}
          <PageContainer width="narrow" flush>
          {isDesktopUp && (
            <PageHeader
              title={t("createTrip.screenTitle")}
              actions={headerCreateButton}
              onBack={handleCancel}
              alwaysShowBack
            />
          )}

          {/* 1 & 2. Nom du voyage + destination principale */}
          {isDesktopUp ? (
            <View style={styles.fieldsRow}>
              {titleField}
              {destinationField}
            </View>
          ) : (
            <>
              {titleField}
              {destinationField}
            </>
          )}

          {/* 3. Dates — côte à côte */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[
                styles.fieldBox,
                styles.dateBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowStartDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
                {t("createTrip.departureDateLabel")}
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(formData.startDate)}
              </Text>
            </TouchableOpacity>

            <View style={styles.dateGap} />

            <TouchableOpacity
              style={[
                styles.fieldBox,
                styles.dateBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowEndDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
                {t("createTrip.returnDateLabel")}
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(formData.endDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message d'erreur de date */}
          {dateError && (
            <Text style={styles.dateErrorText}>{dateError}</Text>
          )}

          {/* iOS et web : le sélecteur vit dans une modale ; Android ouvre son propre dialogue système. */}
          {Platform.OS !== "android" && (
            <>
              <TripDatePickerModal
                type="start"
                value={formData.startDate}
                visible={showStartDatePicker}
                colors={colors}
                onChange={(event, date) => handleDateChange(event, date, "start")}
                onClose={() => setShowStartDatePicker(false)}
                onConfirm={() => setShowStartDatePicker(false)}
              />
              <TripDatePickerModal
                type="end"
                value={formData.endDate}
                visible={showEndDatePicker}
                colors={colors}
                onChange={(event, date) => handleDateChange(event, date, "end")}
                onClose={() => setShowEndDatePicker(false)}
                onConfirm={() => setShowEndDatePicker(false)}
              />
            </>
          )}

          {/* 4. Description (optionnelle) */}
          <Pressable
            onPress={() => descriptionInputRef.current?.focus()}
            style={[
              styles.fieldBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              {t("createTrip.descriptionLabel")}
            </Text>
            <TextInput
              ref={descriptionInputRef}
              style={[styles.fieldInput, styles.descInput, { color: colors.text }]}
              value={formData.description}
              onChangeText={(v: string) => handleInputChange("description", v)}
              placeholder={t("createTrip.descriptionPlaceholder")}
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          </Pressable>

          {/* 5. Visibilité */}
          <View
            style={[
              styles.fieldBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              {t("createTrip.visibilityLabel")}
            </Text>
            <TouchableOpacity
              style={styles.visibilityRow}
              onPress={() => setShowVisibilityPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.visibilityText, { color: colors.text }]}>
                {VISIBILITY_LABELS[formData.visibility]}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Modale de visibilité */}
          <TripVisibilityPicker
            visible={showVisibilityPicker}
            currentVisibility={formData.visibility}
            colors={colors}
            onSelect={handleVisibilityChange}
            onClose={() => setShowVisibilityPicker(false)}
          />

          {/* ── Bouton principal (desktop : relogé dans le PageHeader ci-dessus) ── */}
          {!isDesktopUp && (
            <TouchableOpacity
              style={[styles.primaryButton, (loading || offlineDisabled) && styles.primaryButtonDisabled, offlineStyle]}
              onPress={handleCreate}
              disabled={loading || offlineDisabled}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{createLabel}</Text>
            </TouchableOpacity>
          )}
          </PageContainer>
        </ScrollView>

        {/* Pickers Android inline */}
        {Platform.OS === "android" && showStartDatePicker && (
          <AndroidDatePicker
            value={formData.startDate}
            onChange={(event, date) => handleDateChange(event, date, "start")}
          />
        )}
        {Platform.OS === "android" && showEndDatePicker && (
          <AndroidDatePicker
            value={formData.endDate}
            onChange={(event, date) => handleDateChange(event, date, "end")}
          />
        )}
       </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTripScreen;
