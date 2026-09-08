import React, { useState } from "react";
import { TouchableOpacity, Pressable, Image, Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { F } from "../../theme/fonts";
import { SPACING } from "../../theme";

/** Gouttière et interstice de la grille mobile à deux colonnes. */
const MOBILE_GUTTER = 24;
const MOBILE_GAP = 12;

export const CARD_H = 175;
/** Une carte plus haute sur grand écran : l'image porte l'inspiration. */
const CARD_H_WIDE = 220;

type Destination = {
  id: string;
  category: string;
  image: string;
  name: string;
  country: string;
};

type Props = {
  item: Destination;
  index: number;
};

const IdeaCard: React.FC<Props> = ({ item, index }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isTabletUp, width } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const goToDetail = () => navigation.navigate("IdeaDetail", { ideaId: item.id });

  const body = (
    <>
      <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
      <LinearGradient
        colors={["transparent", "rgba(15,8,2,0.75)"]}
        style={[styles.cardGradient, { height: isTabletUp ? CARD_H_WIDE : CARD_H }]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardCountry}>{item.country}</Text>
      </View>
    </>
  );

  // Au-delà du mobile la carte remplit la colonne que lui donne `CardGrid` et
  // reçoit les affordances attendues sur le web (survol, focus clavier).
  if (isTabletUp) {
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${item.name}, ${item.country}`}
        onPress={goToDetail}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.card,
          styles.cardWide,
          (hovered || focused) && styles.cardRaised,
          focused && styles.cardFocused,
          pressed && styles.cardPressed,
        ]}
      >
        {body}
      </Pressable>
    );
  }

  // Grille mobile à deux colonnes : la largeur se déduit de la fenêtre pour
  // rester juste au redimensionnement du navigateur.
  const mobileWidth = (width - MOBILE_GUTTER * 2 - MOBILE_GAP) / 2;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: mobileWidth, height: CARD_H, marginBottom: MOBILE_GAP },
        index % 2 === 0 ? { marginRight: MOBILE_GAP / 2 } : { marginLeft: MOBILE_GAP / 2 },
      ]}
      onPress={goToDetail}
      activeOpacity={0.88}
    >
      {body}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  cardWide: {
    width: "100%",
    height: CARD_H_WIDE,
    cursor: "pointer",
  },
  cardRaised: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  // Le contour de focus est dessiné à l'intérieur pour ne pas décaler la grille.
  cardFocused: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cardPressed: { opacity: 0.88 },
  cardImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  cardName: {
    fontSize: 16,
    fontFamily: F.sans700,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardCountry: {
    fontSize: 12,
    fontFamily: F.sans400,
    color: "rgba(255,255,255,0.72)",
    marginTop: 1,
  },
});

export default IdeaCard;
