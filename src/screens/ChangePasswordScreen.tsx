import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { PasswordField } from "../components/changePassword/PasswordField";
import { PageContainer, PageHeader } from "../components/layout";
import BackButton from "../components/ui/BackButton";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";
import { F, FONT_SIZE, RADIUS, SPACING } from "../theme";

// Au moins 8 caractères, une minuscule, une majuscule, un chiffre et un symbole.
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { changePassword } = useAuth();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /** Message d'erreur de saisie, `null` quand le formulaire est valide. */
  const validate = (): string | null => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return t("changePassword.fillAllFields");
    }
    if (!STRONG_PASSWORD.test(newPassword)) return t("common.invalidPassword");
    if (newPassword !== confirmPassword) return t("changePassword.passwordsDontMatch");
    if (currentPassword === newPassword) return t("changePassword.passwordMustBeDifferent");
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert(t("common.error"), error);
      return;
    }

    setLoading(true);
    const success = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (!success) {
      Alert.alert(t("common.error"), t("changePassword.errorMessage"));
      return;
    }

    Alert.alert(t("changePassword.successTitle"), t("changePassword.successMessage"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={isTabletUp ? styles.scrollWide : styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Formulaire court : colonne bornée et centrée sur grand écran. */}
        <PageContainer width="narrow" flush={!isTabletUp}>
          {isDesktopUp ? (
            <PageHeader
              title={t("changePassword.title")}
              subtitle={t("changePassword.subtitle")}
              onBack={() => navigation.goBack()}
              alwaysShowBack
            />
          ) : (
            <>
              <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
              <View style={styles.headerBlock}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {t("changePassword.title")}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMid }]}>
                  {t("changePassword.subtitle")}
                </Text>
              </View>
            </>
          )}

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <PasswordField
              label={t("changePassword.currentPasswordLabel")}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t("changePassword.currentPasswordPlaceholder")}
            />
            <PasswordField
              label={t("changePassword.newPasswordLabel")}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("changePassword.newPasswordPlaceholder")}
            />
            <PasswordField
              label={t("changePassword.confirmPasswordLabel")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("changePassword.confirmPasswordPlaceholder")}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.terra, shadowColor: colors.terra },
                (loading || offlineDisabled) && styles.primaryButtonDisabled,
                offlineStyle,
              ]}
              onPress={handleSubmit}
              disabled={loading || offlineDisabled}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t("changePassword.saveButton")}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.primaryButtonText}>
                {loading ? t("changePassword.saving") : t("changePassword.saveButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </PageContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 48,
    paddingTop: Platform.OS === "ios" ? 56 : SPACING.xl,
  },
  /** À partir du palier tablette, la marge horizontale vient du conteneur. */
  scrollWide: { flexGrow: 1, paddingBottom: 64, paddingTop: SPACING.xl },

  backButton: { marginBottom: SPACING.xxl },
  headerBlock: { marginBottom: SPACING.xl },
  title: { fontSize: 26, fontFamily: F.sans700, marginBottom: 6 },
  subtitle: { fontSize: FONT_SIZE.lg, lineHeight: 24, fontFamily: F.sans400 },

  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButton: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg - 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: SPACING.xxs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    cursor: "pointer",
  },
  primaryButtonDisabled: { opacity: 0.6 },
  buttonIcon: { marginRight: SPACING.xs },
  primaryButtonText: { color: "#FFFFFF", fontSize: FONT_SIZE.xxl, fontFamily: F.sans700 },
});

export default ChangePasswordScreen;
