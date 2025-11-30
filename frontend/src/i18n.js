import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      // Navigation
      "home": "Accueil",
      "services": "Services",
      "cart": "Panier",
      "login": "Connexion",
      "logout": "Déconnexion",
      "dashboard": "Tableau de bord",
      
      // Home page
      "appTitle": "ShoeRepair",
      "appSubtitle": "Réparation à domicile",
      "heroTitle": "Réparation professionnelle de chaussures",
      "heroSubtitle": "À domicile, par des artisans qualifiés",
      "viewServices": "Voir nos services",
      "becomePartner": "Devenir partenaire",
      
      // Services
      "availableServices": "disponibles",
      "addToCart": "Ajouter au panier",
      "days": "jours",
      "woman": "Femme",
      "man": "Homme",
      "mixed": "Mixte",
      
      // Cart
      "myCart": "Mon Panier",
      "article": "article",
      "articles": "articles",
      "emptyCart": "Votre panier est vide",
      "discoverServices": "Découvrez nos services de réparation",
      "continueShopping": "Continuer mes achats",
      "removeFromCart": "Retirer du panier",
      "subtotal": "Sous-total",
      "delivery": "Livraison",
      "toCalculate": "À calculer",
      "estimatedTotal": "Total estimé",
      "checkout": "Passer la commande",
      
      // Checkout
      "finalizeOrder": "Finaliser ma commande",
      "howToContinue": "Comment souhaitez-vous continuer ?",
      "guest": "Invité",
      "fullName": "Nom complet",
      "email": "Email",
      "phone": "Téléphone",
      "createAccount": "Créer un compte pour suivre mes commandes",
      "password": "Mot de passe",
      "connectToAccount": "Connectez-vous pour accéder à votre historique",
      "signIn": "Se connecter",
      
      // Photos
      "shoePhotos": "Photos de vos chaussures",
      "photosOptional": "(optionnel)",
      "photosHelper": "Ajoutez jusqu'à 5 photos pour aider le cordonnier",
      "clickToAddPhotos": "Cliquez pour ajouter des photos",
      
      // Delivery
      "deliveryAddress": "Adresse de livraison",
      "deliveryAddressHelper": "Le cordonnier le plus proche sera assigné automatiquement",
      "deliveryOptions": "Options de livraison",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "jours maximum",
      "hours": "heures",
      
      // Order
      "notes": "Notes",
      "notesOptional": "(optionnel)",
      "specialInstructions": "Instructions spéciales...",
      "orderSummary": "Récapitulatif de la commande",
      "total": "Total",
      "confirmAndPay": "Confirmer et payer",
      "processing": "Traitement...",
      
      // Messages
      "orderCreated": "Commande créée avec succès !",
      "errorCreatingOrder": "Erreur lors de la commande",
      "addedToCart": "Service ajouté au panier",
      "removedFromCart": "Service retiré du panier",
      "quantityUpdated": "Quantité mise à jour dans le panier",
      "fillAllFields": "Veuillez remplir toutes les informations",
      "providePassword": "Veuillez fournir un mot de passe pour créer le compte",
      "cartIsEmpty": "Votre panier est vide",
      "provideDeliveryAddress": "Veuillez fournir une adresse de livraison",
    }
  },
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "services": "Services",
      "cart": "Cart",
      "login": "Login",
      "logout": "Logout",
      "dashboard": "Dashboard",
      
      // Home page
      "appTitle": "ShoeRepair",
      "appSubtitle": "Home repair",
      "heroTitle": "Professional shoe repair",
      "heroSubtitle": "At home, by qualified craftsmen",
      "viewServices": "View our services",
      "becomePartner": "Become a partner",
      
      // Services
      "availableServices": "available",
      "addToCart": "Add to cart",
      "days": "days",
      "woman": "Women",
      "man": "Men",
      "mixed": "Unisex",
      
      // Cart
      "myCart": "My Cart",
      "article": "item",
      "articles": "items",
      "emptyCart": "Your cart is empty",
      "discoverServices": "Discover our repair services",
      "continueShopping": "Continue shopping",
      "removeFromCart": "Remove from cart",
      "subtotal": "Subtotal",
      "delivery": "Delivery",
      "toCalculate": "To calculate",
      "estimatedTotal": "Estimated total",
      "checkout": "Checkout",
      
      // Checkout
      "finalizeOrder": "Finalize my order",
      "howToContinue": "How would you like to continue?",
      "guest": "Guest",
      "fullName": "Full name",
      "email": "Email",
      "phone": "Phone",
      "createAccount": "Create an account to track my orders",
      "password": "Password",
      "connectToAccount": "Sign in to access your history",
      "signIn": "Sign in",
      
      // Photos
      "shoePhotos": "Shoe photos",
      "photosOptional": "(optional)",
      "photosHelper": "Add up to 5 photos to help the cobbler",
      "clickToAddPhotos": "Click to add photos",
      
      // Delivery
      "deliveryAddress": "Delivery address",
      "deliveryAddressHelper": "The nearest cobbler will be automatically assigned",
      "deliveryOptions": "Delivery options",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "days max",
      "hours": "hours",
      
      // Order
      "notes": "Notes",
      "notesOptional": "(optional)",
      "specialInstructions": "Special instructions...",
      "orderSummary": "Order summary",
      "total": "Total",
      "confirmAndPay": "Confirm and pay",
      "processing": "Processing...",
      
      // Messages
      "orderCreated": "Order created successfully!",
      "errorCreatingOrder": "Error creating order",
      "addedToCart": "Service added to cart",
      "removedFromCart": "Service removed from cart",
      "quantityUpdated": "Quantity updated in cart",
      "fillAllFields": "Please fill in all information",
      "providePassword": "Please provide a password to create the account",
      "cartIsEmpty": "Your cart is empty",
      "provideDeliveryAddress": "Please provide a delivery address",
    }
  },
  de: {
    translation: {
      // Navigation
      "home": "Startseite",
      "services": "Dienstleistungen",
      "cart": "Warenkorb",
      "login": "Anmelden",
      "logout": "Abmelden",
      "dashboard": "Dashboard",
      
      // Home page
      "appTitle": "ShoeRepair",
      "appSubtitle": "Reparatur zu Hause",
      "heroTitle": "Professionelle Schuhreparatur",
      "heroSubtitle": "Zu Hause, von qualifizierten Handwerkern",
      "viewServices": "Unsere Dienstleistungen ansehen",
      "becomePartner": "Partner werden",
      
      // Services
      "availableServices": "verfügbar",
      "addToCart": "In den Warenkorb",
      "days": "Tage",
      "woman": "Damen",
      "man": "Herren",
      "mixed": "Unisex",
      
      // Cart
      "myCart": "Mein Warenkorb",
      "article": "Artikel",
      "articles": "Artikel",
      "emptyCart": "Ihr Warenkorb ist leer",
      "discoverServices": "Entdecken Sie unsere Reparaturdienste",
      "continueShopping": "Weiter einkaufen",
      "removeFromCart": "Aus Warenkorb entfernen",
      "subtotal": "Zwischensumme",
      "delivery": "Lieferung",
      "toCalculate": "Zu berechnen",
      "estimatedTotal": "Geschätzte Summe",
      "checkout": "Zur Kasse",
      
      // Checkout
      "finalizeOrder": "Bestellung abschließen",
      "howToContinue": "Wie möchten Sie fortfahren?",
      "guest": "Gast",
      "fullName": "Vollständiger Name",
      "email": "E-Mail",
      "phone": "Telefon",
      "createAccount": "Konto erstellen, um Bestellungen zu verfolgen",
      "password": "Passwort",
      "connectToAccount": "Melden Sie sich an, um auf Ihren Verlauf zuzugreifen",
      "signIn": "Anmelden",
      
      // Photos
      "shoePhotos": "Schuhfotos",
      "photosOptional": "(optional)",
      "photosHelper": "Fügen Sie bis zu 5 Fotos hinzu, um dem Schuster zu helfen",
      "clickToAddPhotos": "Klicken Sie, um Fotos hinzuzufügen",
      
      // Delivery
      "deliveryAddress": "Lieferadresse",
      "deliveryAddressHelper": "Der nächste Schuster wird automatisch zugewiesen",
      "deliveryOptions": "Lieferoptionen",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "Tage maximal",
      "hours": "Stunden",
      
      // Order
      "notes": "Notizen",
      "notesOptional": "(optional)",
      "specialInstructions": "Besondere Anweisungen...",
      "orderSummary": "Bestellübersicht",
      "total": "Gesamt",
      "confirmAndPay": "Bestätigen und bezahlen",
      "processing": "Wird bearbeitet...",
      
      // Messages
      "orderCreated": "Bestellung erfolgreich erstellt!",
      "errorCreatingOrder": "Fehler beim Erstellen der Bestellung",
      "addedToCart": "Service zum Warenkorb hinzugefügt",
      "removedFromCart": "Service aus Warenkorb entfernt",
      "quantityUpdated": "Menge im Warenkorb aktualisiert",
      "fillAllFields": "Bitte füllen Sie alle Informationen aus",
      "providePassword": "Bitte geben Sie ein Passwort ein, um das Konto zu erstellen",
      "cartIsEmpty": "Ihr Warenkorb ist leer",
      "provideDeliveryAddress": "Bitte geben Sie eine Lieferadresse an",
    }
  },
  it: {
    translation: {
      // Navigation
      "home": "Home",
      "services": "Servizi",
      "cart": "Carrello",
      "login": "Accedi",
      "logout": "Esci",
      "dashboard": "Dashboard",
      
      // Home page
      "appTitle": "ShoeRepair",
      "appSubtitle": "Riparazione a domicilio",
      "heroTitle": "Riparazione professionale di scarpe",
      "heroSubtitle": "A domicilio, da artigiani qualificati",
      "viewServices": "Vedi i nostri servizi",
      "becomePartner": "Diventa partner",
      
      // Services
      "availableServices": "disponibili",
      "addToCart": "Aggiungi al carrello",
      "days": "giorni",
      "woman": "Donna",
      "man": "Uomo",
      "mixed": "Unisex",
      
      // Cart
      "myCart": "Il Mio Carrello",
      "article": "articolo",
      "articles": "articoli",
      "emptyCart": "Il tuo carrello è vuoto",
      "discoverServices": "Scopri i nostri servizi di riparazione",
      "continueShopping": "Continua a fare acquisti",
      "removeFromCart": "Rimuovi dal carrello",
      "subtotal": "Subtotale",
      "delivery": "Consegna",
      "toCalculate": "Da calcolare",
      "estimatedTotal": "Totale stimato",
      "checkout": "Vai alla cassa",
      
      // Checkout
      "finalizeOrder": "Finalizza il mio ordine",
      "howToContinue": "Come vuoi continuare?",
      "guest": "Ospite",
      "fullName": "Nome completo",
      "email": "Email",
      "phone": "Telefono",
      "createAccount": "Crea un account per tracciare i miei ordini",
      "password": "Password",
      "connectToAccount": "Accedi per accedere alla tua cronologia",
      "signIn": "Accedi",
      
      // Photos
      "shoePhotos": "Foto delle scarpe",
      "photosOptional": "(opzionale)",
      "photosHelper": "Aggiungi fino a 5 foto per aiutare il calzolaio",
      "clickToAddPhotos": "Clicca per aggiungere foto",
      
      // Delivery
      "deliveryAddress": "Indirizzo di consegna",
      "deliveryAddressHelper": "Il calzolaio più vicino verrà assegnato automaticamente",
      "deliveryOptions": "Opzioni di consegna",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "giorni massimo",
      "hours": "ore",
      
      // Order
      "notes": "Note",
      "notesOptional": "(opzionale)",
      "specialInstructions": "Istruzioni speciali...",
      "orderSummary": "Riepilogo dell'ordine",
      "total": "Totale",
      "confirmAndPay": "Conferma e paga",
      "processing": "Elaborazione...",
      
      // Messages
      "orderCreated": "Ordine creato con successo!",
      "errorCreatingOrder": "Errore nella creazione dell'ordine",
      "addedToCart": "Servizio aggiunto al carrello",
      "removedFromCart": "Servizio rimosso dal carrello",
      "quantityUpdated": "Quantità aggiornata nel carrello",
      "fillAllFields": "Si prega di compilare tutte le informazioni",
      "providePassword": "Si prega di fornire una password per creare l'account",
      "cartIsEmpty": "Il tuo carrello è vuoto",
      "provideDeliveryAddress": "Si prega di fornire un indirizzo di consegna",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
