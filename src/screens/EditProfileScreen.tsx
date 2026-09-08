import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";

import { AvatarPicker } from "../components/editProfile/AvatarPicker";
import { ProfileFields } from "../components/editProfile/ProfileFields";
import { SaveChangesButton } from "../components/editProfile/SaveChangesButton";
import { SecurityCard } from "../components/editProfile/SecurityCard";
import { PageContainer, PageHeader } from "../components/layout";
import BackButton from "../components/ui/BackButton";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { F, FONT_SIZE, SPACING } from "../theme";
import { RootStackParamList } from "../types";

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { user, updateUser, updateAvatar } = useAuth();
  const { colors } = useTheme();
  const { isTabletUp, isDesktopUp } = useBreakpoint();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleSave = async () => {
    try {
      await updateUser({ name, email });
      Alert.alert(t("editProfile.updateSuccessTitle"), t("editProfile.updateSuccessMessage"));
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("common.error"), t("editProfile.updateErrorMessage"));
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("common.error"), t("editProfile.photoPermissionDenied"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    const dataUri = `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;
    try {
      setUploadingAvatar(true);
      await updateAvatar(dataUri);
    } catch (error) {
      console.error("updateAvatar error:", error);
      Alert.alert(t("common.error"), t("editProfile.photoUploadError"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={isDesktopUp ? styles.scrollDesktop : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isDesktopUp && (
          <View style={[styles.headerBar, { backgroundColor: colors.bg }]}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("editProfile.personalInfo")}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        )}

        {/*
         * Colonne de formulaire bornée : au-delà d'une certaine largeur, un
         * champ de saisie devient impossible à parcourir des yeux. Sous le
         * palier tablette, l'écran garde les marges portées par ses cartes.
         */}
        <PageContainer width="narrow" flush={!isTabletUp}>
          {isDesktopUp && (
            <PageHeader
              title={t("editProfile.personalInfo")}
              subtitle={t("editProfile.subtitle")}
              onBack={() => navigation.goBack()}
              alwaysShowBack
              actions={<SaveChangesButton onPress={handleSave} compact />}
            />
          )}

          <AvatarPicker
            name={name || user?.name || ""}
            avatar={user?.avatar}
            uploading={uploadingAvatar}
            onPick={handlePickPhoto}
          />

          <ProfileFields
            name={name}
            email={email}
            onChangeName={setName}
            onChangeEmail={setEmail}
            fluid={isTabletUp}
          />

          <SecurityCard
            onChangePassword={() => navigation.navigate("ChangePassword")}
            fluid={isTabletUp}
          />

          {/* Sur desktop, l'enregistrement vit dans l'en-tête de page. */}
          {!isDesktopUp && <SaveChangesButton onPress={handleSave} />}
        </PageContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  scrollDesktop: { paddingBottom: 64 },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h3,
    fontFamily: F.sans700,
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: { width: 44 },
});

export default EditProfileScreen;
