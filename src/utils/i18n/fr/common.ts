const common = {
  appName: "MyTripCircle",
  slogan: "Planifie le voyage parfait avec tes amis",
  common: {
    back: "Retour",
    email: "E-mail",
    password: "Mot de passe",
    fullName: "Nom complet",
    phone: "Numéro de téléphone",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    pleaseWait: "Veuillez patienter...",
    error: "Erreur",
    info: "Information",
    fillAllFields: "Veuillez renseigner tous les champs",
    cancel: "Annuler",
    delete: "Supprimer",
    unexpectedError: "Une erreur inattendue est survenue",
    loginFailed: "Échec de la connexion",
    registerFailed: "Échec de l'inscription",
    noAccount: "Pas de compte ?",
    haveAccount: "Déjà un compte ?",
    ok: "OK",
    validate: "Valider",
    confirm: "Confirmer",
    loading: "Chargement...",
    add: "Ajouter",
    create: "Créer",
    edit: "Modifier",
    save: "Enregistrer",
    discard: "Confirmer",
    logout: "Se déconnecter",
    settings: "Paramètres",
    helpSupport: "Aide & support",
    about: "À propos",
    user: "Utilisateur",
    unknown: "Inconnu",
    welcomeBack: "Bon retour",
    createAccount: "Créer un compte",
    loginToContinue: "Connectez-vous pour continuer",
    signUpToStart: "Inscrivez-vous pour commencer",
    forgotPassword: "Mot de passe oublié ?",
    termsAgree: "En continuant, vous acceptez nos",
    termsAndConditions: "Conditions d'utilisation",
    invalidEmail: "Veuillez entrer une adresse e-mail valide",
    invalidPassword:
      "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.",
    passwordTooShort:
      "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.",
    invalidPhone: "Veuillez entrer un numéro de téléphone valide",
    invalidCredentials: "E-mail ou mot de passe incorrect",
    emailAlreadyInUse: "Cet e-mail est déjà utilisé",
    phoneAlreadyInUse:
      "Ce numéro de téléphone est déjà utilisé par un autre compte.",
    requiresOtp: "Veuillez vérifier votre compte avec le code envoyé par e-mail",
    requiresOtpExpired: "Votre code de vérification a expiré. Un nouveau code a été envoyé à votre e-mail",
    confirmPassword: "Confirmer le mot de passe",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    dateNotAvailable: "N/A",
    invalidDate: "Date invalide",
    emailPlaceholder: "vous@exemple.com",
    namePlaceholderExample: "Jean Dupont",
    phoneOptional: "Téléphone (optionnel)",
    phonePlaceholderExample: "06 00 00 00 00",
    passwordMaskedPlaceholder: "••••••••",
    a11y: {
      back: "Retour",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      alertDialog: "Boîte de dialogue",
    },
  },
  welcome: {
    subtitle: "Centralisez tous vos voyages",
    ctaStart: "Commencer",
    ctaHaveAccount: "J'ai déjà un compte",
    nav: {
      signIn: "Se connecter",
      start: "Créer un compte",
    },
    hero: {
      eyebrow: "Voyages à plusieurs",
      title: "Vos voyages entre amis, enfin organisés",
      subtitle:
        "Réservations, adresses, itinéraires et invitations d'un même voyage réunis dans un espace partagé avec les personnes qui partent avec vous.",
      freeHint: "Le plan gratuit inclut 3 voyages et 2 collaborateurs par voyage.",
    },
    features: {
      title: "Tout ce qu'un voyage de groupe demande",
      subtitle:
        "Un espace par voyage, où chaque information utile est à sa place et visible par tout le monde.",
      collaborative: {
        title: "Voyages collaboratifs",
        body:
          "Invitez votre cercle et donnez à chacun son rôle : organisateur, éditeur ou lecteur. La visibilité du voyage reste la vôtre : privé, entre amis ou public.",
      },
      bookings: {
        title: "Réservations centralisées",
        body:
          "Vols, trains, hôtels, restaurants et activités, avec leurs dates, leurs références et leurs pièces jointes au même endroit.",
      },
      scan: {
        title: "Scan de billets",
        body:
          "Scannez le QR code ou le code-barres d'un billet pour préremplir la réservation. La saisie manuelle reste disponible.",
      },
      itinerary: {
        title: "Itinéraires générés par IA",
        body:
          "Indiquez une ville et un nombre de jours pour obtenir une proposition de programme, jour par jour, à ajuster ensuite.",
      },
      addresses: {
        title: "Adresses et carte",
        body:
          "Enregistrez les lieux utiles avec l'autocomplétion d'adresses, puis retrouvez-les sur la carte du voyage.",
      },
      friends: {
        title: "Amis et invitations",
        body:
          "Ajoutez vos amis dans l'application et invitez-les à rejoindre un voyage par lien ou par e-mail.",
      },
    },
    steps: {
      title: "Comment ça marche",
      stepLabel: "Étape {{number}}",
      create: {
        title: "Créez le voyage",
        body: "Un nom, des dates, une visibilité : le voyage est prêt à être rempli.",
      },
      invite: {
        title: "Invitez votre cercle",
        body:
          "Chaque personne invitée retrouve le programme et contribue selon le rôle qui lui est donné.",
      },
      travel: {
        title: "Partez sereinement",
        body:
          "Exportez l'itinéraire vers votre agenda grâce à un lien iCal et gardez vos billets à portée de main.",
      },
    },
    finalCta: {
      title: "Prêt à préparer le prochain départ ?",
      body: "Créez votre compte, puis invitez les personnes qui voyagent avec vous.",
    },
    footer: {
      tagline: "Planification de voyages collaborative.",
      legalHeading: "Informations légales",
      terms: "Conditions d'utilisation",
      privacy: "Politique de confidentialité",
      legal: "Mentions légales",
      rights: "© {{year}} MyTripCircle. Tous droits réservés.",
    },
  },
  auth: {
    welcomeBackTitle: "Te revoilà 👋",
    loginSubtitle: "Connecte-toi à ton compte",
    registerTitle: "Créer ton compte ✨",
    registerSubtitle: "Rejoins MyTripCircle gratuitement",
    googleButton: "Continuer avec Google",
    appleButton: "Continuer avec Apple",
    appleUnavailableWeb:
      "La connexion avec Apple n'est pas disponible dans le navigateur. Utilise l'application mobile ou continue avec Google.",
    orDivider: "ou",
    createMyAccount: "Créer mon compte",
    termsPrefix: "J'accepte les ",
    termsLink: "conditions d'utilisation",
    termsMiddle: " et la ",
    privacyLink: "politique de confidentialité",
    loginFooterPrompt: "Pas encore de compte ? ",
    registerFooterPrompt: "Déjà un compte ? ",
    termsRequired: "Vous devez accepter les conditions d'utilisation et la politique de confidentialité pour créer un compte.",
    aside: {
      title: "Un seul espace pour tout le voyage",
      subtitle: "Ce que votre compte MyTripCircle vous donne, dès la première connexion.",
      bullet1: "Réservations, adresses et itinéraires partagés",
      bullet2: "Des rôles clairs : organisateur, éditeur, lecteur",
      bullet3: "L'itinéraire exportable vers votre agenda",
    },
  },
  tabs: {
    myTrips: "Mes voyages",
    trips: "Voyages",
    bookings: "Réservations",
    addresses: "Adresses",
    ideas: "Idées",
    profile: "Profil",
  },
  stack: {
    tripDetails: "Détails du voyage",
    bookingDetails: "Détails de la réservation",
    addressDetails: "Détails de l'adresse",
    inviteFriends: "Inviter des amis",
  },
};

export default common;
