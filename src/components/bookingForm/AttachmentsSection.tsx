import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AttachmentThumb from "./AttachmentThumb";
import { RADIUS } from "../../theme";
import { F } from "../../theme/fonts";
import { useBookingForm } from "../../hooks/useBookingForm";
import { useTheme } from "../../contexts/ThemeContext";

type FormHandle = ReturnType<typeof useBookingForm>;
type ThemeColors = ReturnType<typeof useTheme>["colors"];

interface Props {
  form: FormHandle;
  colors: ThemeColors;
  t: (key: string) => string;
}

/** Pièces jointes déjà ajoutées (renommer/supprimer) et bouton d'ajout. */
const AttachmentsSection: React.FC<Props> = ({ form, colors, t }) => (
  <View style={styles.section}>
    {form.attachments.map((attachment, idx) => (
      <View key={attachment.uri} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AttachmentThumb attachment={attachment} colors={colors} />
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{attachment.name}</Text>
        <TouchableOpacity style={styles.renameButton} onPress={() => form.handleOpenRename(idx)}>
          <Ionicons name="pencil" size={16} color={colors.terra} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => form.handleRemoveAttachment(idx)}>
          <Ionicons name="close-circle" size={22} color="#C04040" />
        </TouchableOpacity>
      </View>
    ))}
    <TouchableOpacity
      style={[styles.dashedBox, { borderColor: colors.border }]}
      onPress={() => Alert.alert(t("bookings.attachmentTitle"), t("bookings.chooseFileType"), [
        { text: t("bookings.imageOption"), onPress: form.handlePickImage },
        { text: t("bookings.pdfOption"),   onPress: form.handlePickDocument },
        { text: t("common.cancel"), style: "cancel" },
      ])}
      activeOpacity={0.7}
    >
      <Text style={[styles.dashedText, { color: colors.textLight }]}>{t("bookings.addAttachment")}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  section: { marginHorizontal: 20, marginBottom: 10 },
  dashedBox: {
    borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed",
    padding: 20, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
  },
  dashedText: { fontSize: 16, fontFamily: F.sans400 },
  item: {
    flexDirection: "row", alignItems: "center", borderRadius: RADIUS.button,
    padding: 12, marginBottom: 10, borderWidth: 1,
  },
  name: { flex: 1, fontSize: 14, fontFamily: F.sans400, marginRight: 8 },
  renameButton: { padding: 4, marginRight: 4 },
  removeButton: { padding: 4 },
});

export default AttachmentsSection;
