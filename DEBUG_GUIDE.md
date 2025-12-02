# 🔍 GUIDE DE DÉBOGAGE - Paiement Stripe

## Comment déboguer le problème:

### Étape 1: Ouvrir la Console du Navigateur
1. Appuyez sur **F12** (ou clic droit > Inspecter)
2. Cliquez sur l'onglet **"Console"**
3. Gardez la console ouverte

### Étape 2: Faire une Commande
1. Connectez-vous sur l'application
2. Ajoutez un service au panier
3. Allez au checkout
4. Remplissez le formulaire
5. Uploadez 1 photo
6. **AVANT de cliquer "Valider"**, regardez la console

### Étape 3: Valider et Observer
1. Cliquez sur "Valider la commande"
2. **REGARDEZ IMMÉDIATEMENT LA CONSOLE**

### Étape 4: Ce que vous devriez voir dans la console:

```
=== BEFORE ORDER CREATION ===
User prop: {email: "...", name: "...", ...}  ← L'objet user
User exists: true  ← Devrait être true si connecté
Checkout mode: user  ← Devrait être "user" si connecté
Token in localStorage: eyJhbGc...  ← Devrait avoir un token
Endpoint: http://localhost:8001/api/orders/bulk  ← Endpoint utilisé

=== AFTER ORDER CREATION ===
Response: {order_id: "...", ...}
Order ID: abc-123-def  ← ID de la commande créée

Token check: true  ← Devrait être true
User check: true  ← Devrait être true

✅ REDIRECTING TO STRIPE CHECKOUT  ← Vous devriez voir ça!
Target URL: /stripe-checkout/abc-123-def
```

### Étape 5: Partagez avec moi
**Copiez TOUT ce qui s'affiche dans la console et envoyez-le moi.**

## Scénarios possibles:

### ❌ Scénario 1: User prop est undefined
```
User prop: undefined
User exists: false
```
**→ Problème**: L'objet user n'est pas passé au composant Checkout

### ❌ Scénario 2: Pas de token
```
Token in localStorage: null
```
**→ Problème**: L'utilisateur n'est pas vraiment connecté

### ❌ Scénario 3: Endpoint guest au lieu de bulk
```
Checkout mode: guest
Endpoint: .../orders/guest
```
**→ Problème**: Le mode checkout est "guest" même si connecté

### ✅ Scénario attendu:
```
User prop: {objet avec email, name, etc}
User exists: true
Token in localStorage: eyJh... (long token)
Checkout mode: user
✅ REDIRECTING TO STRIPE CHECKOUT
```

## Actions selon les logs:

| Ce que vous voyez | Ce que ça signifie | Solution |
|-------------------|-------------------|----------|
| `User prop: undefined` | User pas passé à Checkout | Problème dans App.js |
| `Token: null` | Pas connecté | Reconnectez-vous |
| `Checkout mode: guest` | Mode guest activé | Bug dans la logique du mode |
| `✅ REDIRECTING TO ORDER CONFIRMATION` | Va vers confirmation | Devrait aller vers Stripe |
| Aucun log du tout | Erreur avant création | Vérifiez erreurs en rouge |

---

## 🆘 Si rien ne s'affiche:
Cela signifie que le code ne s'exécute pas du tout. Vérifiez:
1. Y a-t-il des erreurs en ROUGE dans la console?
2. Le bouton "Valider" fonctionne-t-il (loading)?
3. Un toast "Commande créée" apparaît-il?

---

**Envoyez-moi les logs et je saurai exactement où est le problème!** 🔍
