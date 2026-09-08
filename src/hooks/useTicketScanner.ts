import { useState, useRef } from "react";
import { Animated } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import BarcodeScanner from "@react-native-ml-kit/barcode-scanning";
import { useTranslation } from "react-i18next";
import { parseBarcode, type ScannedBookingData } from "./ticketBarcodeParser";

export type { ScannedBookingData };

export type ScanMode = "choose" | "camera" | "gallery";

export function useTicketScanner(
  visible: boolean,
  onFill: (data: ScannedBookingData) => void,
  onClose: () => void
) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  const [mode, setMode]             = useState<ScanMode>("choose");
  const [scanned, setScanned]       = useState(false);
  const [parsedData, setParsedData] = useState<ScannedBookingData | null>(null);
  const [rawData, setRawData]       = useState<string>("");
  const [scanning, setScanning]     = useState(false);
  const [scanError, setScanError]   = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const panelAnim = useRef(new Animated.Value(300)).current;

  const showPanel = () => {
    Animated.spring(panelAnim, {
      toValue: 0, useNativeDriver: true, tension: 70, friction: 12,
    }).start();
  };

  const hidePanel = (cb?: () => void) => {
    Animated.timing(panelAnim, {
      toValue: 300, duration: 200, useNativeDriver: true,
    }).start(cb);
  };

  const reset = () => {
    setScanned(false);
    setParsedData(null);
    setRawData("");
    setScanError(null);
    setPreviewUri(null);
    panelAnim.setValue(300);
  };

  const handleResult = (raw: string) => {
    setRawData(raw);
    setParsedData(parseBarcode(raw));
    setScanned(true);
    showPanel();
  };

  const handleFill = () => {
    if (parsedData) {
      onFill(parsedData);
      onClose();
    }
  };

  const handleRescan = () => {
    hidePanel(() => {
      reset();
      if (mode === "gallery") setMode("choose");
    });
  };

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    handleResult(data);
  };

  const scanFromImage = async (uri: string) => {
    setPreviewUri(uri);
    setMode("gallery");
    setScanning(true);
    setScanError(null);
    try {
      const results = await BarcodeScanner.scan(uri);
      if (results.length > 0) {
        handleResult(results[0].value);
      } else {
        setScanError(t("bookings.scanNoCodeFound"));
      }
    } catch (e) {
      if (__DEV__) console.warn("[useTicketScanner] Erreur scan:", e);
      setScanError(t("bookings.scanNoCodeFound"));
    } finally {
      setScanning(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setScanError(t("bookings.permissionDenied"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      await scanFromImage(result.assets[0].uri);
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      await scanFromImage(result.assets[0].uri);
    }
  };

  return {
    t,
    permission,
    requestPermission,
    mode,
    setMode,
    scanned,
    parsedData,
    rawData,
    scanning,
    scanError,
    previewUri,
    panelAnim,
    reset,
    handleFill,
    handleRescan,
    handleBarcodeScanned,
    handlePickImage,
    handlePickDocument,
  };
}
