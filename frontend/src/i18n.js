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
      "backHome": "Retour à l'accueil",
      
      // Home page - Header
      "appTitle": "ShoeRepair",
      "appSubtitle": "Réparation à domicile",
      
      // Carousel
      "pumpsHeels": "Escarpins & Talons",
      "expertRepair": "Réparation experte",
      "qualifiedCraftsmen": "Artisans Qualifiés",
      "traditionalKnowHow": "Savoir-faire traditionnel",
      "mensShoes": "Chaussures Homme",
      "premiumRenovation": "Rénovation premium",
      
      // Hero section
      "heroTitle": "Réparation professionnelle de chaussures",
      "heroSubtitle": "À domicile, par des artisans qualifiés",
      "viewServices": "Voir nos services",
      "becomePartner": "Devenir partenaire",
      
      // How it works
      "howItWorks": "Comment ça marche ?",
      "simpleAndFast": "Simple et rapide en 4 étapes",
      "step1Title": "Choisissez",
      "step1Desc": "Sélectionnez votre service",
      "step2Title": "Payez",
      "step2Desc": "Paiement sécurisé",
      "step3Title": "Envoyez",
      "step3Desc": "Avec votre référence",
      "step4Title": "Recevez",
      "step4Desc": "Livraison à domicile",
      
      // Why choose us
      "whyChooseUs": "Pourquoi nous choisir ?",
      "localCraftsmenTitle": "Artisans Locaux",
      "localCraftsmenDesc": "Cordonniers qualifiés près de chez vous",
      "fastDeliveryTitle": "Livraison Rapide",
      "fastDeliveryDesc": "Service express en 72h disponible",
      "qualityGuaranteeTitle": "Qualité Garantie",
      "qualityGuaranteeDesc": "Satisfaction garantie ou remboursé",
      
      // Before After
      "beforeAfter": "Avant / Après",
      "seeTransformation": "Découvrez la transformation",
      "before": "Avant",
      "after": "Après",
      
      // Reviews
      "customerReviews": "Avis Clients",
      "whatTheySay": "Ce qu'ils disent de nous",
      
      // Countries section
      "ourCountries": "Nos Pays",
      "presentInCountries": "Présent dans toute l'Europe",
      "countriesCovered": "pays couverts",
      "switzerland": "Suisse",
      "france": "France",
      "germany": "Allemagne",
      "italy": "Italie",
      "belgium": "Belgique",
      "luxembourg": "Luxembourg",
      "austria": "Autriche",
      "netherlands": "Pays-Bas",
      
      // Features
      "autoAssignmentTitle": "Attribution automatique",
      "autoAssignmentDesc": "Votre commande est assignée au cordonnier le plus proche automatiquement",
      "fastAndConvenientTitle": "Rapide et pratique",
      "fastAndConvenientDesc": "Envoi et retour inclus. Standard 10j ou Express 72h",
      "securePaymentTitle": "Paiement sécurisé",
      "securePaymentDesc": "Stripe Connect. Versement automatique aux cordonniers",
      
      // Before After section
      "beforeAfterGallery": "Avant / Après",
      "repairResults": "Résultats de nos réparations",
      "bootResole": "Ressemelage bottes",
      "sneakersCleaning": "Nettoyage sneakers",
      "heelsRepair": "Réparation talons",
      "leatherRenovation": "Rénovation cuir",
      
      // Services page
      "availableServices": "disponibles",
      "addToCart": "Ajouter au panier",
      "days": "jours",
      "day": "jour",
      "woman": "Femme",
      "man": "Homme",
      "mixed": "Mixte",
      "allCategories": "Toutes",
      
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
      "deliveryFeesNote": "+ frais de livraison selon l'option choisie",
      "summary": "Récapitulatif",
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
      "required": "*",
      
      // Photos
      "shoePhotos": "Photos de vos chaussures",
      "photosOptional": "(optionnel)",
      "photosHelper": "Ajoutez jusqu'à 5 photos pour aider le cordonnier",
      "clickToAddPhotos": "Cliquez pour ajouter des photos",
      "photosCount": "photos",
      
      // Delivery
      "deliveryAddress": "Adresse de livraison",
      "deliveryAddressHelper": "Le cordonnier le plus proche sera assigné automatiquement",
      "deliveryAddressPlaceholder": "Ex: Rue du Commerce 5, 1003 Lausanne",
      "deliveryOptions": "Options de livraison",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "jours maximum",
      "hours": "heures",
      
      // Order
      "notes": "Notes",
      "notesOptional": "(optionnel)",
      "specialInstructions": "Ajoutez des instructions spéciales...",
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
      "loginRequired": "Veuillez vous connecter pour commander",
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
      "backHome": "Back to home",
      
      // Home page - Header
      "appTitle": "ShoeRepair",
      "appSubtitle": "Home repair",
      
      // Carousel
      "pumpsHeels": "Pumps & Heels",
      "expertRepair": "Expert repair",
      "qualifiedCraftsmen": "Qualified Craftsmen",
      "traditionalKnowHow": "Traditional know-how",
      "mensShoes": "Men's Shoes",
      "premiumRenovation": "Premium renovation",
      
      // Hero section
      "heroTitle": "Professional shoe repair",
      "heroSubtitle": "At home, by qualified craftsmen",
      "viewServices": "View our services",
      "becomePartner": "Become a partner",
      
      // How it works
      "howItWorks": "How it works?",
      "simpleAndFast": "Simple and fast in 4 steps",
      "step1Title": "Choose",
      "step1Desc": "Select your service",
      "step2Title": "Pay",
      "step2Desc": "Secure payment",
      "step3Title": "Send",
      "step3Desc": "With your reference",
      "step4Title": "Receive",
      "step4Desc": "Home delivery",
      
      // Why choose us
      "whyChooseUs": "Why choose us?",
      "localCraftsmenTitle": "Local Craftsmen",
      "localCraftsmenDesc": "Qualified cobblers near you",
      "fastDeliveryTitle": "Fast Delivery",
      "fastDeliveryDesc": "Express service in 72h available",
      "qualityGuaranteeTitle": "Quality Guarantee",
      "qualityGuaranteeDesc": "Satisfaction guaranteed or refunded",
      
      // Before After
      "beforeAfter": "Before / After",
      "seeTransformation": "See the transformation",
      "before": "Before",
      "after": "After",
      
      // Reviews
      "customerReviews": "Customer Reviews",
      "whatTheySay": "What they say about us",
      
      // Countries section
      "ourCountries": "Our Countries",
      "presentInCountries": "Present across Europe",
      "countriesCovered": "countries covered",
      "switzerland": "Switzerland",
      "france": "France",
      "germany": "Germany",
      "italy": "Italy",
      "belgium": "Belgium",
      "luxembourg": "Luxembourg",
      "austria": "Austria",
      "netherlands": "Netherlands",
      
      // Features
      "autoAssignmentTitle": "Automatic assignment",
      "autoAssignmentDesc": "Your order is assigned to the nearest cobbler automatically",
      "fastAndConvenientTitle": "Fast and convenient",
      "fastAndConvenientDesc": "Shipping and return included. Standard 10d or Express 72h",
      "securePaymentTitle": "Secure payment",
      "securePaymentDesc": "Stripe Connect. Automatic payment to cobblers",
      
      // Before After section
      "beforeAfterGallery": "Before / After",
      "repairResults": "Our repair results",
      "bootResole": "Boot resole",
      "sneakersCleaning": "Sneakers cleaning",
      "heelsRepair": "Heels repair",
      "leatherRenovation": "Leather renovation",
      
      // Services page
      "availableServices": "available",
      "addToCart": "Add to cart",
      "days": "days",
      "day": "day",
      "woman": "Women",
      "man": "Men",
      "mixed": "Unisex",
      "allCategories": "All",
      
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
      "deliveryFeesNote": "+ delivery fees according to option chosen",
      "summary": "Summary",
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
      "required": "*",
      
      // Photos
      "shoePhotos": "Shoe photos",
      "photosOptional": "(optional)",
      "photosHelper": "Add up to 5 photos to help the cobbler",
      "clickToAddPhotos": "Click to add photos",
      "photosCount": "photos",
      
      // Delivery
      "deliveryAddress": "Delivery address",
      "deliveryAddressHelper": "The nearest cobbler will be automatically assigned",
      "deliveryAddressPlaceholder": "Ex: 5 Commerce Street, 1003 Lausanne",
      "deliveryOptions": "Delivery options",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "days max",
      "hours": "hours",
      
      // Order
      "notes": "Notes",
      "notesOptional": "(optional)",
      "specialInstructions": "Add special instructions...",
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
      "loginRequired": "Please login to order",
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
      "backHome": "Zurück zur Startseite",
      
      // Home page - Header
      "appTitle": "ShoeRepair",
      "appSubtitle": "Reparatur zu Hause",
      
      // Carousel
      "pumpsHeels": "Pumps & Absätze",
      "expertRepair": "Expertenreparatur",
      "qualifiedCraftsmen": "Qualifizierte Handwerker",
      "traditionalKnowHow": "Traditionelles Know-how",
      "mensShoes": "Herrenschuhe",
      "premiumRenovation": "Premium-Renovierung",
      
      // Hero section
      "heroTitle": "Professionelle Schuhreparatur",
      "heroSubtitle": "Zu Hause, von qualifizierten Handwerkern",
      "viewServices": "Unsere Dienstleistungen ansehen",
      "becomePartner": "Partner werden",
      
      // How it works
      "howItWorks": "Wie funktioniert es?",
      "simpleAndFast": "Einfach und schnell in 4 Schritten",
      "step1Title": "Wählen",
      "step1Desc": "Wählen Sie Ihren Service",
      "step2Title": "Bezahlen",
      "step2Desc": "Sichere Zahlung",
      "step3Title": "Senden",
      "step3Desc": "Mit Ihrer Referenz",
      "step4Title": "Empfangen",
      "step4Desc": "Lieferung nach Hause",
      
      // Why choose us
      "whyChooseUs": "Warum uns wählen?",
      "localCraftsmenTitle": "Lokale Handwerker",
      "localCraftsmenDesc": "Qualifizierte Schuster in Ihrer Nähe",
      "fastDeliveryTitle": "Schnelle Lieferung",
      "fastDeliveryDesc": "Express-Service in 72h verfügbar",
      "qualityGuaranteeTitle": "Qualitätsgarantie",
      "qualityGuaranteeDesc": "Zufriedenheit garantiert oder Geld zurück",
      
      // Before After
      "beforeAfter": "Vorher / Nachher",
      "seeTransformation": "Sehen Sie die Transformation",
      "before": "Vorher",
      "after": "Nachher",
      
      // Reviews
      "customerReviews": "Kundenbewertungen",
      "whatTheySay": "Was sie über uns sagen",
      
      // Features
      "autoAssignmentTitle": "Automatische Zuweisung",
      "autoAssignmentDesc": "Ihre Bestellung wird automatisch dem nächsten Schuster zugewiesen",
      "fastAndConvenientTitle": "Schnell und bequem",
      "fastAndConvenientDesc": "Versand und Rücksendung inbegriffen. Standard 10T oder Express 72h",
      "securePaymentTitle": "Sichere Zahlung",
      "securePaymentDesc": "Stripe Connect. Automatische Zahlung an Schuster",
      
      // Before After section
      "beforeAfterGallery": "Vorher / Nachher",
      "repairResults": "Unsere Reparaturergebnisse",
      "bootResole": "Stiefel Neubesohlung",
      "sneakersCleaning": "Sneakers Reinigung",
      "heelsRepair": "Absätze Reparatur",
      "leatherRenovation": "Leder Renovierung",
      
      // Services page
      "availableServices": "verfügbar",
      "addToCart": "In den Warenkorb",
      "days": "Tage",
      "day": "Tag",
      "woman": "Damen",
      "man": "Herren",
      "mixed": "Unisex",
      "allCategories": "Alle",
      
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
      "deliveryFeesNote": "+ Lieferkosten je nach gewählter Option",
      "summary": "Zusammenfassung",
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
      "required": "*",
      
      // Photos
      "shoePhotos": "Schuhfotos",
      "photosOptional": "(optional)",
      "photosHelper": "Fügen Sie bis zu 5 Fotos hinzu, um dem Schuster zu helfen",
      "clickToAddPhotos": "Klicken Sie, um Fotos hinzuzufügen",
      "photosCount": "Fotos",
      
      // Delivery
      "deliveryAddress": "Lieferadresse",
      "deliveryAddressHelper": "Der nächste Schuster wird automatisch zugewiesen",
      "deliveryAddressPlaceholder": "Z.B.: Handelsstraße 5, 1003 Lausanne",
      "deliveryOptions": "Lieferoptionen",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "Tage maximal",
      "hours": "Stunden",
      
      // Order
      "notes": "Notizen",
      "notesOptional": "(optional)",
      "specialInstructions": "Besondere Anweisungen hinzufügen...",
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
      "loginRequired": "Bitte melden Sie sich an, um zu bestellen",
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
      "backHome": "Torna alla home",
      
      // Home page - Header
      "appTitle": "ShoeRepair",
      "appSubtitle": "Riparazione a domicilio",
      
      // Carousel
      "pumpsHeels": "Décolleté & Tacchi",
      "expertRepair": "Riparazione esperta",
      "qualifiedCraftsmen": "Artigiani Qualificati",
      "traditionalKnowHow": "Know-how tradizionale",
      "mensShoes": "Scarpe da Uomo",
      "premiumRenovation": "Ristrutturazione premium",
      
      // Hero section
      "heroTitle": "Riparazione professionale di scarpe",
      "heroSubtitle": "A domicilio, da artigiani qualificati",
      "viewServices": "Vedi i nostri servizi",
      "becomePartner": "Diventa partner",
      
      // How it works
      "howItWorks": "Come funziona?",
      "simpleAndFast": "Semplice e veloce in 4 passaggi",
      "step1Title": "Scegli",
      "step1Desc": "Seleziona il tuo servizio",
      "step2Title": "Paga",
      "step2Desc": "Pagamento sicuro",
      "step3Title": "Invia",
      "step3Desc": "Con il tuo riferimento",
      "step4Title": "Ricevi",
      "step4Desc": "Consegna a domicilio",
      
      // Why choose us
      "whyChooseUs": "Perché sceglierci?",
      "localCraftsmenTitle": "Artigiani Locali",
      "localCraftsmenDesc": "Calzolai qualificati vicino a te",
      "fastDeliveryTitle": "Consegna Veloce",
      "fastDeliveryDesc": "Servizio express in 72h disponibile",
      "qualityGuaranteeTitle": "Garanzia di Qualità",
      "qualityGuaranteeDesc": "Soddisfazione garantita o rimborsata",
      
      // Before After
      "beforeAfter": "Prima / Dopo",
      "seeTransformation": "Vedi la trasformazione",
      "before": "Prima",
      "after": "Dopo",
      
      // Reviews
      "customerReviews": "Recensioni Clienti",
      "whatTheySay": "Cosa dicono di noi",
      
      // Features
      "autoAssignmentTitle": "Assegnazione automatica",
      "autoAssignmentDesc": "Il tuo ordine viene assegnato automaticamente al calzolaio più vicino",
      "fastAndConvenientTitle": "Veloce e conveniente",
      "fastAndConvenientDesc": "Spedizione e reso inclusi. Standard 10g o Express 72h",
      "securePaymentTitle": "Pagamento sicuro",
      "securePaymentDesc": "Stripe Connect. Pagamento automatico ai calzolai",
      
      // Before After section
      "beforeAfterGallery": "Prima / Dopo",
      "repairResults": "I nostri risultati di riparazione",
      "bootResole": "Risuolatura stivali",
      "sneakersCleaning": "Pulizia sneakers",
      "heelsRepair": "Riparazione tacchi",
      "leatherRenovation": "Ristrutturazione pelle",
      
      // Services page
      "availableServices": "disponibili",
      "addToCart": "Aggiungi al carrello",
      "days": "giorni",
      "day": "giorno",
      "woman": "Donna",
      "man": "Uomo",
      "mixed": "Unisex",
      "allCategories": "Tutte",
      
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
      "deliveryFeesNote": "+ spese di consegna secondo l'opzione scelta",
      "summary": "Riepilogo",
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
      "required": "*",
      
      // Photos
      "shoePhotos": "Foto delle scarpe",
      "photosOptional": "(opzionale)",
      "photosHelper": "Aggiungi fino a 5 foto per aiutare il calzolaio",
      "clickToAddPhotos": "Clicca per aggiungere foto",
      "photosCount": "foto",
      
      // Delivery
      "deliveryAddress": "Indirizzo di consegna",
      "deliveryAddressHelper": "Il calzolaio più vicino verrà assegnato automaticamente",
      "deliveryAddressPlaceholder": "Es: Via del Commercio 5, 1003 Losanna",
      "deliveryOptions": "Opzioni di consegna",
      "standard": "Standard",
      "express": "Express",
      "maxDays": "giorni massimo",
      "hours": "ore",
      
      // Order
      "notes": "Note",
      "notesOptional": "(opzionale)",
      "specialInstructions": "Aggiungi istruzioni speciali...",
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
      "loginRequired": "Si prega di accedere per ordinare",
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