# Testing Protocol

## user_problem_statement: Système de panier et commande invité avec photos obligatoires et multi-services

## backend:
##   - task: "POST /api/orders/guest - Guest order with multi-services"
##     implemented: true
##     working: "unknown"
##     file: "/app/backend/server.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "Endpoint créé pour commandes invités avec validation obligatoire des photos et support multi-services via JSON"
##   - task: "POST /api/orders/bulk - Authenticated user multi-service order"
##     implemented: true
##     working: "unknown"
##     file: "/app/backend/server.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "Endpoint créé pour utilisateurs connectés avec support multi-services"

## frontend:
##   - task: "Cart Context - localStorage management"
##     implemented: true
##     working: "unknown"
##     file: "/app/frontend/src/context/CartContext.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "CartContext créé avec addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount"
##   - task: "Cart Page - View and modify cart"
##     implemented: true
##     working: "unknown"
##     file: "/app/frontend/src/pages/Cart.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "Page panier avec liste services, modification quantités, suppression items, bouton checkout"
##   - task: "Checkout Page - Guest and user checkout with mandatory photos"
##     implemented: true
##     working: "unknown"
##     file: "/app/frontend/src/pages/Checkout.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "Page checkout avec validation OBLIGATOIRE des photos (désactive bouton si pas de photos), mode invité/connecté, création compte optionnelle"
##   - task: "Add to cart buttons on Services page"
##     implemented: true
##     working: "unknown"
##     file: "/app/frontend/src/pages/Services.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "Boutons Ajouter au panier ajoutés sur chaque carte service, icône panier avec badge dans header"
##   - task: "Cart icon in Home page header"
##     implemented: true
##     working: "unknown"
##     file: "/app/frontend/src/pages/Home.js"
##     stuck_count: 0
##     priority: "medium"
##     needs_retesting: true
##     status_history:
##         - working: "unknown"
##         - agent: "main"
##         - comment: "Icône panier avec badge compteur ajoutée dans header de la page d'accueil"

## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 1
##   run_ui: true

## test_plan:
##   current_focus:
##     - "Complete cart and checkout flow with photo validation"
##     - "Guest order creation with mandatory photos"
##     - "Multi-service order handling"
##   stuck_tasks: []
##   test_all: false
##   test_priority: "high_first"

## agent_communication:
##     - agent: "main"
##     - message: "Système de panier et commande invité implémenté avec VALIDATION OBLIGATOIRE des photos. Tests à effectuer: 1) Ajouter plusieurs services au panier depuis /services, 2) Voir panier avec compteur, 3) Aller au checkout en mode invité, 4) Vérifier que le bouton est désactivé sans photos, 5) Ajouter photos et soumettre commande, 6) Vérifier que la commande est créée avec géo-attribution, 7) Option création de compte après commande. Points clés: Photos OBLIGATOIRES (bouton désactivé, bordure rouge, messages d'alerte), multi-services supportés, guest et authenticated users."

