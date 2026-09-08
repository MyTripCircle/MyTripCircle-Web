import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { userApi } from "../services/api/userApi";

const PUSH_TOKEN_KEY = "@mytripcircle_push_token_v1";

// expo-notifications 0.32 a scindé `shouldShowAlert` en `shouldShowBanner`
// (bandeau à l'écran) et `shouldShowList` (entrée dans le centre de
// notifications) ; `shouldShowAlert` reste accepté pour la rétrocompatibilité.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissionAndRegisterToken(): Promise<void> {
  if (Platform.OS === "web") return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData.data;

    const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (stored === token) return;

    await userApi.registerPushToken(token);
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  } catch {
    // Silencieux : simulateur ou Expo Go sans entitlement aps-environment
  }
}

export async function clearStoredPushToken(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}
