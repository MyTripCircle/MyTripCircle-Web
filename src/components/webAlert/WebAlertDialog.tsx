import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../theme";
import type { WebAlertButton, WebAlertRequest } from "./alertQueue";
import { useDialogFocus } from "./useDialogFocus";
import { useEscapeDismiss } from "./useEscapeDismiss";
import { WebAlertActions } from "./WebAlertActions";

interface WebAlertDialogProps {
  request: WebAlertRequest;
  /** Ferme la boîte ; `button` est celui qui a déclenché la fermeture. */
  onClose: (button?: WebAlertButton) => void;
}

/**
 * Boîte de dialogue de l'application, rendue à la place du dialogue système
 * dont le navigateur ne dispose pas.
 *
 * Elle n'est fermable au clavier (Échap) ou par clic sur l'arrière-plan que si
 * l'appelant a prévu un bouton `cancel` : sinon elle reste bloquante, comme sur
 * mobile. Échap et l'arrière-plan équivalent alors à un appui sur ce bouton,
 * ce qui correspond à l'attente sur le web.
 */
export const WebAlertDialog: React.FC<WebAlertDialogProps> = ({ request, onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const cancelButton = request.buttons.find((button) => button.style === "cancel");
  const dialogId = `mtc-alert-${request.id}`;
  const titleId = `${dialogId}-title`;
  const messageId = `${dialogId}-message`;
  const hasTitle = request.title.trim().length > 0;

  const dismiss = useCallback(
    () => onClose(cancelButton),
    [cancelButton, onClose],
  );

  useDialogFocus(dialogId);
  useEscapeDismiss(cancelButton ? dismiss : undefined);

  return (
    <View style={styles.overlay}>
      <Pressable
        style={StyleSheet.absoluteFill}
        // L'arrière-plan reste hors du parcours de tabulation : Échap tient le
        // même rôle pour les utilisateurs au clavier.
        focusable={false}
        onPress={cancelButton ? dismiss : undefined}
      />
      <View
        id={dialogId}
        role="dialog"
        aria-modal
        aria-label={hasTitle ? undefined : t("common.a11y.alertDialog")}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={request.message ? messageId : undefined}
        tabIndex={-1}
        style={[styles.dialog, { backgroundColor: colors.bgLight }]}
      >
        {hasTitle ? (
          <Text id={titleId} style={[styles.title, { color: colors.text }]}>
            {request.title}
          </Text>
        ) : null}
        {request.message ? (
          <Text id={messageId} style={[styles.message, { color: colors.textMid }]}>
            {request.message}
          </Text>
        ) : null}
        <WebAlertActions buttons={request.buttons} onPress={onClose} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Voile encre du design system : il assombrit aussi bien un fond sable
    // clair qu'un fond sombre.
    backgroundColor: "rgba(42,35,24,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    // Au-dessus du navigateur et du shell web, dont les vues valent zIndex 0.
    zIndex: 1000,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOW.strong,
  },
  title: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h3,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  message: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: SPACING.xxs,
  },
});
