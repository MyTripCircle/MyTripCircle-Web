import { StyleSheet } from "react-native";

import { F, FONT_SIZE, RADIUS, SPACING } from "../../../theme";

/**
 * Styles partagés par les trois étapes de la modale d'itinéraire IA.
 *
 * Les valeurs mobiles sont conservées à l'identique ; les variantes larges
 * (suffixe `Wide`) ne s'appliquent qu'à partir du palier tablette.
 */
export const modalStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.base,
    fontFamily: F.sans400,
    marginBottom: SPACING.sm,
  },
  primaryBtn: {
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xxs,
    marginBottom: SPACING.xs,
    cursor: "pointer",
  },
  primaryBtnText: { fontFamily: F.sans600, fontSize: FONT_SIZE.base, color: "#FFFFFF" },
  secondaryBtn: {
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    cursor: "pointer",
  },

  cityTitle: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h3,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  stepperText: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.base,
    minWidth: 60,
    textAlign: "center",
  },
  regenerateBtn: {
    flex: 1,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  regenerateBtnText: { fontFamily: F.sans600, fontSize: FONT_SIZE.sm, color: "#FFFFFF" },

  dayCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dayTitle: { fontFamily: F.sans700, fontSize: FONT_SIZE.base, marginBottom: SPACING.sm },
  slotsRow: { flexDirection: "row", gap: SPACING.md },
  slotColumn: { flex: 1 },
  slotRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  slotEmoji: { fontSize: FONT_SIZE.xxl, marginTop: 1 },
  slotLabel: {
    fontFamily: F.sans500,
    fontSize: FONT_SIZE.xxs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  slotActivity: { fontFamily: F.sans500, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  slotTip: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
    fontStyle: "italic",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.md,
    alignSelf: "flex-start",
    cursor: "pointer",
  },
  backBtnText: { fontFamily: F.sans500, fontSize: FONT_SIZE.md },
  summaryCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCity: { fontFamily: F.sans700, fontSize: FONT_SIZE.xxl, marginBottom: SPACING.xs },
  summaryPillRow: { flexDirection: "row", marginBottom: 14 },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xxs,
    backgroundColor: "rgba(196, 113, 74, 0.12)",
    borderRadius: RADIUS.xl,
    paddingHorizontal: 10,
    paddingVertical: SPACING.xxs,
  },
  summaryPillText: { fontFamily: F.sans600, fontSize: FONT_SIZE.sm },
  summaryDatesBlock: { borderTopWidth: 1, paddingTop: 14, gap: SPACING.xxs },
  summaryLabelsRow: { flexDirection: "row", alignItems: "center" },
  summaryArrowSpace: { width: SPACING.xl },
  summaryValuesRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  summaryDateLabel: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.xxs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryDateValue: { fontFamily: F.sans600, fontSize: FONT_SIZE.md },
  sectionLabel: { fontFamily: F.sans500, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    marginBottom: SPACING.xxs,
    cursor: "pointer",
  },
  dateFieldText: { flex: 1, fontFamily: F.sans400, fontSize: FONT_SIZE.base },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  datePickerOverlayCentered: { justifyContent: "center", alignItems: "center", padding: SPACING.lg },
  datePickerSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
  },
  datePickerSheetCentered: {
    borderRadius: RADIUS.xl,
    width: "100%",
    maxWidth: 420,
  },
  // Le sélecteur occupe toute la largeur de la feuille : sur web c'est un
  // <input type="date">, qui sinon se dimensionnerait sur son contenu.
  pickerField: {
    width: "100%",
  },
  datePickerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACING.xs,
    width: "100%",
  },
  datePickerCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.input,
    alignItems: "center",
    borderWidth: 1,
    cursor: "pointer",
  },
  datePickerConfirmBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.input,
    alignItems: "center",
    cursor: "pointer",
  },
});
