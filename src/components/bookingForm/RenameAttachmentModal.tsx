import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { F } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme";
import { useBookingForm } from "../../hooks/useBookingForm";
import { useTheme } from "../../contexts/ThemeContext";

type FormHandle = ReturnType<typeof useBookingForm>;
type ThemeColors = ReturnType<typeof useTheme>["colors"];

interface Props {
  form: FormHandle;
  colors: ThemeColors;
  t: (key: string) => string;
}

/** Modale de renommage d'une pièce jointe déjà ajoutée au formulaire réservation. */
const RenameAttachmentModal: React.FC<Props> = ({ form, colors, t }) => (
  <Modal visible={form.renamingIndex !== null} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("bookings.renameFileTitle")}</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>{t("bookings.renameFileSubtitle")}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={form.renameValue}
          onChangeText={form.setRenameValue}
          placeholder={t("bookings.renamePlaceholder")}
          placeholderTextColor={colors.textLight}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={form.handleConfirmRename}
        />
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => form.setRenamingIndex(null)}>
            <Text style={[styles.cancelText, { color: colors.textMid }]}>{t("common.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.terra }, !form.renameValue.trim() && { opacity: 0.5 }]}
            onPress={form.handleConfirmRename}
            disabled={!form.renameValue.trim()}
          >
            <Text style={styles.confirmText}>{t("common.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(42, 35, 24, 0.5)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  modal: { borderRadius: 20, padding: 24, width: "100%", maxWidth: 420, ...SHADOW.strong },
  title: { fontSize: 18, fontFamily: F.sans700, marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: F.sans400, marginBottom: 16 },
  input: {
    borderRadius: RADIUS.button, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: F.sans400, marginBottom: 16,
  },
  buttons: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.button,
    borderWidth: 1.5, alignItems: "center",
  },
  cancelText: { fontSize: 15, fontFamily: F.sans600 },
  confirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.button,
    alignItems: "center",
  },
  confirmText: { fontSize: 15, fontFamily: F.sans700, color: "white" },
});

export default RenameAttachmentModal;
