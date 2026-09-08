import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../../theme";
import { groupInvitationsByDate } from "./groupInvitationsByDate";
import NotifItem from "./NotifItem";
import { invitationId, NotifInvitation } from "./types";

interface NotifListProps {
  invitations: NotifInvitation[];
  readIds: Set<string>;
  respondingToken: string | null;
  onRead: (id: string) => void;
  onAccept: (token: string) => void;
  onDecline: (token: string) => void;
}

/**
 * Liste des invitations reçues.
 *
 * À partir du palier tablette, elle se regroupe par période — aujourd'hui,
 * hier, cette semaine, avant — comme n'importe quel centre de notifications
 * web : sur une page haute, un titre de période sert de repère de défilement.
 * Sous ce palier, la liste reste plate.
 */
const NotifList: React.FC<NotifListProps> = ({
  invitations,
  readIds,
  respondingToken,
  onRead,
  onAccept,
  onDecline,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  const renderItem = (invitation: NotifInvitation) => {
    const id = invitationId(invitation);
    return (
      <NotifItem
        key={id}
        invitation={invitation}
        unread={invitation.status === "pending" && !readIds.has(id)}
        responding={respondingToken === invitation.token}
        fluid={isTabletUp}
        onPress={() => onRead(id)}
        onAccept={() => onAccept(invitation.token)}
        onDecline={() => onDecline(invitation.token)}
      />
    );
  };

  if (!isTabletUp) return <>{invitations.map(renderItem)}</>;

  return (
    <>
      {groupInvitationsByDate(invitations).map((group) => (
        <View key={group.key} style={styles.group}>
          <Text
            accessibilityRole="header"
            style={[styles.groupTitle, { color: colors.textLight }]}
          >
            {t(`notifications.groups.${group.key}`)}
          </Text>
          {group.items.map(renderItem)}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: SPACING.lg },
  groupTitle: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
  },
});

export default NotifList;
