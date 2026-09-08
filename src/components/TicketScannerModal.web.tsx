import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTicketScanner } from "../hooks/useTicketScanner.web";
import ResultPanel from "./ticketScanner/ResultPanel";
import { styles } from "./ticketScanner/ticketScannerStyles";
import BackButton from "./ui/BackButton";
import { useTheme } from "../contexts/ThemeContext";

export type { ScannedBookingData } from "../hooks/useTicketScanner.web";

const { width: SCREEN_W } = Dimensions.get("window");

interface TicketScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onFill: (data: import("../hooks/useTicketScanner.web").ScannedBookingData) => void;
}

const videoStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  backgroundColor: "black",
};

const TicketScannerModal: React.FC<TicketScannerModalProps> = ({ visible, onClose, onFill }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    t, mode, setMode, scanned, parsedData, rawData, scanning, scanError, previewUri,
    panelAnim, reset, handleFill, handleRescan, handlePickImage, handlePickDocument,
    videoRef, cameraError, cameraReady, detectorSupported, manualCode, setManualCode, submitManualCode,
  } = useTicketScanner(visible, onFill, onClose);

  React.useEffect(() => {
    if (visible) {
      setMode("choose");
      reset();
    }
  }, [visible]);

  if (!visible) return null;

  const renderResultPanel = () => (
    <Animated.View
      style={[styles.resultPanel, { backgroundColor: colors.surface, transform: [{ translateY: panelAnim }] }]}
    >
      <ResultPanel
        parsedData={parsedData!}
        rawData={rawData}
        colors={colors}
        t={t}
        onFill={handleFill}
        onRescan={handleRescan}
      />
    </Animated.View>
  );

  const renderOption = (
    icon: keyof typeof Ionicons.glyphMap,
    tint: { bg: string; fg: string },
    title: string,
    description: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.chooseOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.chooseOptionIcon, { backgroundColor: tint.bg }]}>
        <Ionicons name={icon} size={28} color={tint.fg} />
      </View>
      <View style={styles.chooseOptionText}>
        <Text style={[styles.chooseOptionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.chooseOptionDesc, { color: colors.textMid }]}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  const renderHeader = (title: string, onBack: () => void) => (
    <View style={[styles.chooseHeader, { paddingTop: insets.top + 6, backgroundColor: colors.bg, borderBottomColor: colors.bgMid }]}>
      <TouchableOpacity onPress={onBack} style={[styles.closeBtn, { backgroundColor: colors.bgMid }]}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.chooseTitle, { color: colors.text }]}>{title}</Text>
      <View style={{ width: 44 }} />
    </View>
  );

  if (mode === "choose") {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={[styles.chooseContainer, { backgroundColor: colors.bg }]} edges={["bottom", "left", "right"]}>
          {renderHeader(t("bookings.scanTitle"), onClose)}
          <View style={styles.chooseBody}>
            <Text style={[styles.chooseSubtitle, { color: colors.textMid }]}>
              {detectorSupported ? t("bookings.scanChooseSubtitle") : t("bookings.scanUnsupportedBody")}
            </Text>

            {detectorSupported && renderOption(
              "camera", { bg: "#DCF0F5", fg: "#5A8FAA" },
              t("bookings.scanCameraOption"), t("bookings.scanCameraOptionDesc"),
              () => setMode("camera"),
            )}
            {detectorSupported && renderOption(
              "images", { bg: "#E2EDD9", fg: "#6B8C5A" },
              t("bookings.scanGalleryOption"), t("bookings.scanGalleryOptionDesc"),
              handlePickImage,
            )}
            {detectorSupported && renderOption(
              "document", { bg: "#EDE8F5", fg: "#8B70C0" },
              t("bookings.scanFileOption"), t("bookings.scanFileOptionDesc"),
              handlePickDocument,
            )}
            {renderOption(
              "create", { bg: "#F5E5DC", fg: "#C4714A" },
              t("bookings.scanManualOption"), t("bookings.scanManualOptionDesc"),
              () => setMode("manual"),
            )}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  if (mode === "manual") {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={[styles.chooseContainer, { backgroundColor: colors.bg }]} edges={["bottom", "left", "right"]}>
          {renderHeader(t("bookings.scanManualOption"), () => { reset(); setMode("choose"); })}
          <View style={styles.chooseBody}>
            <Text style={[styles.chooseSubtitle, { color: colors.textMid }]}>
              {t("bookings.scanManualHint")}
            </Text>
            <TextInput
              value={manualCode}
              onChangeText={setManualCode}
              placeholder={t("bookings.scanManualPlaceholder")}
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={submitManualCode}
              accessibilityLabel={t("bookings.scanManualPlaceholder")}
              style={[localStyles.manualInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            />
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.terra, opacity: manualCode.trim() ? 1 : 0.5 }]}
              disabled={!manualCode.trim()}
              onPress={submitManualCode}
            >
              <Text style={styles.primaryButtonText}>{t("bookings.scanManualSubmit")}</Text>
            </TouchableOpacity>
          </View>
          {scanned && parsedData && renderResultPanel()}
        </SafeAreaView>
      </Modal>
    );
  }

  if (mode === "gallery") {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.galleryContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.galleryHeader, { paddingTop: insets.top + 10, borderBottomColor: colors.bgMid }]}>
            <BackButton onPress={() => { reset(); setMode("choose"); }} />
            <Text style={[styles.chooseTitle, { color: colors.text }]}>{t("bookings.scanGalleryOption")}</Text>
            <View style={{ width: 44 }} />
          </View>

          {previewUri && <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />}

          {scanning && (
            <View style={[styles.galleryStatus, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="small" color="#5A8FAA" />
              <Text style={[styles.galleryStatusText, { color: colors.textMid }]}>{t("bookings.scanAnalysing")}</Text>
            </View>
          )}

          {!scanning && scanError && (
            <View style={[styles.galleryStatus, { backgroundColor: "#FDEAEA" }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#C04040" />
              <Text style={[styles.galleryStatusText, { color: "#C04040" }]}>{scanError}</Text>
            </View>
          )}

          {!scanning && scanned && parsedData && renderResultPanel()}

          {!scanning && scanError && (
            <SafeAreaView edges={["bottom"]}>
              <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
                <TouchableOpacity style={[styles.rescanButton, { borderColor: colors.border }]} onPress={() => { reset(); setMode("choose"); }}>
                  <Text style={[styles.rescanButtonText, { color: colors.textMid }]}>{t("bookings.scanTryOther")}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          )}
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        <video ref={videoRef} muted playsInline autoPlay style={videoStyle} />

        <View style={styles.overlay}>
          <View style={[styles.cameraHeader, { paddingTop: insets.top + 4 }]}>
            <BackButton variant="overlay" onPress={() => { reset(); setMode("choose"); }} />
            <Text style={styles.cameraHeaderTitle}>{t("bookings.scanTitle")}</Text>
            <View style={{ width: 44 }} />
          </View>

          {!scanned && (
            <View style={styles.viewfinderWrapper}>
              <View style={[styles.viewfinder, { width: SCREEN_W * 0.7, height: SCREEN_W * 0.7 }]}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.scanHint}>
                {cameraError ?? (cameraReady ? t("bookings.scanHint") : t("bookings.scanCameraStarting"))}
              </Text>
              {cameraError && (
                <TouchableOpacity style={localStyles.fallbackLink} onPress={() => setMode("manual")}>
                  <Text style={[styles.linkButtonText, { color: "white" }]}>{t("bookings.scanManualOption")}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {scanned && parsedData && renderResultPanel()}
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  manualInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  fallbackLink: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default TicketScannerModal;
