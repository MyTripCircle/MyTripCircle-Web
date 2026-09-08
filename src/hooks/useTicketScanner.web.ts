import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import logger from "../utils/logger";
import { parseBarcode, type ScannedBookingData } from "./ticketBarcodeParser";

export type { ScannedBookingData };

/** "manual" n'existe que sur web : repli quand le navigateur n'a pas BarcodeDetector. */
export type ScanMode = "choose" | "camera" | "gallery" | "manual";

const WANTED_FORMATS: BarcodeFormat[] = [
  "aztec",
  "code_128",
  "code_39",
  "data_matrix",
  "ean_13",
  "ean_8",
  "pdf417",
  "qr_code",
];

// Une détection toutes les 400 ms suffit à un scan confortable sans saturer le CPU.
const DETECTION_INTERVAL_MS = 400;

export const isBarcodeDetectorSupported =
  typeof window !== "undefined" && typeof window.BarcodeDetector !== "undefined";

async function createDetector(): Promise<BarcodeDetector | null> {
  if (!window.BarcodeDetector) return null;
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    const formats = WANTED_FORMATS.filter((format) => supported.includes(format));
    return new window.BarcodeDetector(formats.length > 0 ? { formats } : undefined);
  } catch (error) {
    logger.warn("[useTicketScanner.web] BarcodeDetector inutilisable", error);
    return null;
  }
}

export function useTicketScanner(
  visible: boolean,
  onFill: (data: ScannedBookingData) => void,
  onClose: () => void
) {
  const { t } = useTranslation();

  const [mode, setMode]                 = useState<ScanMode>("choose");
  const [scanned, setScanned]           = useState(false);
  const [parsedData, setParsedData]     = useState<ScannedBookingData | null>(null);
  const [rawData, setRawData]           = useState<string>("");
  const [scanning, setScanning]         = useState(false);
  const [scanError, setScanError]       = useState<string | null>(null);
  const [previewUri, setPreviewUri]     = useState<string | null>(null);
  const [cameraError, setCameraError]   = useState<string | null>(null);
  const [cameraReady, setCameraReady]   = useState(false);
  const [manualCode, setManualCode]     = useState("");

  const panelAnim  = useRef(new Animated.Value(300)).current;
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const scannedRef = useRef(false);
  // Incrémenté à chaque démarrage : permet d'abandonner un getUserMedia obsolète.
  const sessionRef = useRef(0);

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

  /** Coupe le flux : sans `track.stop()`, le voyant de la webcam reste allumé. */
  const stopCamera = useCallback(() => {
    sessionRef.current += 1;
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  }, []);

  const handleResult = useCallback((raw: string) => {
    scannedRef.current = true;
    setRawData(raw);
    setParsedData(parseBarcode(raw));
    setScanned(true);
    showPanel();
  }, []);

  const startDetectionLoop = useCallback((detector: BarcodeDetector) => {
    let busy = false;
    intervalRef.current = window.setInterval(async () => {
      const video = videoRef.current;
      if (busy || !video || scannedRef.current) return;
      busy = true;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) handleResult(codes[0].rawValue);
      } catch (error) {
        logger.warn("[useTicketScanner.web] échec de détection vidéo", error);
      } finally {
        busy = false;
      }
    }, DETECTION_INTERVAL_MS);
  }, [handleResult]);

  const describeCameraError = useCallback((error: unknown): string => {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") return t("bookings.scanCameraDenied");
    if (name === "NotFoundError" || name === "OverconstrainedError") return t("bookings.scanCameraNotFound");
    return t("bookings.scanCameraError");
  }, [t]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    const detector = await createDetector();
    if (!detector) {
      setMode("manual");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t("bookings.scanCameraError"));
      return;
    }

    const session = ++sessionRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // La modale a pu se fermer pendant la demande de permission.
      if (session !== sessionRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
      startDetectionLoop(detector);
    } catch (error) {
      logger.warn("[useTicketScanner.web] accès caméra refusé ou impossible", error);
      setCameraError(describeCameraError(error));
    }
  }, [describeCameraError, startDetectionLoop, t]);

  // Le flux ne vit que pendant l'affichage du mode caméra : il est coupé à la
  // fermeture de la modale comme au démontage du composant.
  useEffect(() => {
    if (!visible || mode !== "camera" || scanned) {
      stopCamera();
      return;
    }
    startCamera();
    return stopCamera;
  }, [visible, mode, scanned, startCamera, stopCamera]);

  const reset = () => {
    scannedRef.current = false;
    setScanned(false);
    setParsedData(null);
    setRawData("");
    setScanError(null);
    setPreviewUri(null);
    setCameraError(null);
    setManualCode("");
    panelAnim.setValue(300);
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

  const submitManualCode = () => {
    const trimmed = manualCode.trim();
    if (trimmed.length === 0) return;
    handleResult(trimmed);
  };

  const detectFromImage = async (uri: string): Promise<void> => {
    const detector = await createDetector();
    if (!detector) {
      setScanError(t("bookings.scanUnsupportedBody"));
      return;
    }
    const blob = await (await fetch(uri)).blob();
    const bitmap = await createImageBitmap(blob);
    try {
      const codes = await detector.detect(bitmap);
      if (codes.length > 0) handleResult(codes[0].rawValue);
      else setScanError(t("bookings.scanNoCodeFound"));
    } finally {
      bitmap.close();
    }
  };

  const scanFromImage = async (uri: string) => {
    setPreviewUri(uri);
    setMode("gallery");
    setScanning(true);
    setScanError(null);
    try {
      await detectFromImage(uri);
    } catch (error) {
      logger.warn("[useTicketScanner.web] échec d'analyse de l'image", error);
      setScanError(t("bookings.scanNoCodeFound"));
    } finally {
      setScanning(false);
    }
  };

  const handlePickImage = async () => {
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
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*"] });
    if (!result.canceled && result.assets?.[0]) {
      await scanFromImage(result.assets[0].uri);
    }
  };

  return {
    t,
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
    handlePickImage,
    handlePickDocument,
    // Spécifique web : flux vidéo, repli manuel et diagnostic caméra
    videoRef,
    cameraError,
    cameraReady,
    detectorSupported: isBarcodeDetectorSupported,
    manualCode,
    setManualCode,
    submitManualCode,
  };
}
