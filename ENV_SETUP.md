# 🔧 Configuration des Variables d'Environnement

Ce document explique comment configurer les variables d'environnement pour votre application hôtelière.

## 📋 Variables Obligatoires

### 1. VITE_HOTEL_ID
**Description :** ID unique de votre hôtel dans le système  
**Type :** String  
**Obligatoire :** ✅ OUI  
**Exemple :** `care-paris-001` ou `12345`

Cette variable est utilisée pour :
- Récupérer les données de l'hôtel depuis l'API
- Créer les sessions utilisateur
- Personnaliser le contenu

### 2. VITE_HOTEL_NAME
**Description :** Nom de votre hôtel affiché dans l'interface  
**Type :** String  
**Obligatoire :** ✅ OUI (avec fallback "Hotel")  
**Exemple :** `Care`, `Hotel Luxe Paris`, `Château de Versailles`

Cette variable est utilisée pour :
- Afficher le nom dans l'écran de bienvenue
- Personnaliser les messages de chat
- Afficher les alt des images/logos

### 3. VITE_API_URL
**Description :** URL de l'API principale  
**Type :** String  
**Par défaut :** `/api`  
**Exemple développement :** `/api`  
**Exemple production :** `https://api.votrehotel.com`

### 4. VITE_CONCIERGE_API_URL
**Description :** URL de l'API Concierge  
**Type :** String  
**Par défaut :** `/concierge-api`  
**Exemple développement :** `/concierge-api`  
**Exemple production :** `https://concierge-api.votrehotel.com`

## 📋 Variables Optionnelles

### 5. VITE_API_KEY
**Description :** Clé API pour l'authentification (header `x-api-key`)  
**Type :** String  
**Obligatoire :** ❌ NON (uniquement si votre API l'utilise)  
**Exemple :** `sk_live_abc123xyz789`

### 6. VITE_AUTH_BEARER
**Description :** Token Bearer pour l'authentification (header `Authorization`)  
**Type :** String  
**Obligatoire :** ❌ NON (uniquement si votre API l'utilise)  
**Exemple :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 Configuration Rapide

### 1. Pour le Développement Local

```bash
# 1. Copiez le fichier exemple
cp .env.example .env

# 2. Éditez le fichier .env et remplissez au minimum :
VITE_HOTEL_ID=votre-hotel-id
VITE_HOTEL_NAME=Votre Hotel

# 3. Redémarrez le serveur
npm run dev
```

### 2. Pour la Production (Vercel)

1. Allez dans votre projet Vercel
2. Naviguez vers `Settings > Environment Variables`
3. Ajoutez chaque variable :
   - `VITE_HOTEL_ID` → Votre ID d'hôtel
   - `VITE_HOTEL_NAME` → Nom de votre hôtel
   - `VITE_API_URL` → URL de votre API de production
   - `VITE_CONCIERGE_API_URL` → URL de votre API Concierge de production
   - (optionnel) `VITE_API_KEY` → Votre clé API
   - (optionnel) `VITE_AUTH_BEARER` → Votre token Bearer

4. Redéployez l'application

## 🔍 Où sont utilisées ces variables ?

### VITE_HOTEL_ID
- `src/config.ts` - Exporté comme `HOTEL_ID`
- `src/screens/SplashScreen/SplashScreen.tsx` - Récupération des vidéos
- `src/services/tinderService.ts` - Requêtes API
- `src/contexts/ThemeContext.tsx` - Chargement du thème

### VITE_HOTEL_NAME
- `src/config.ts` - Exporté comme `HOTEL_NAME`
- `src/screens/SplashScreen/SplashScreen.tsx` - Titre de bienvenue
- `src/screens/PageChat/PageChat.tsx` - Alt des logos
- `src/screens/PageChat/ChatBubble.tsx` - Alt des logos

### VITE_API_URL & VITE_CONCIERGE_API_URL
- `src/config.ts` - Exportés comme `API_BASE_URL` et `CONCIERGE_API_BASE_URL`
- Utilisés dans tous les services (`src/services/*.ts`)

### VITE_API_KEY & VITE_AUTH_BEARER
- `src/config.ts` - Fonction `apiHeaders()` pour les requêtes authentifiées

## ⚠️ Sécurité

**IMPORTANT :**
- Les variables `VITE_*` sont accessibles côté client (navigateur)
- Ne mettez JAMAIS de secrets sensibles (clés privées, mots de passe DB, etc.)
- Pour les secrets sensibles, utilisez une API backend

## 🐛 Dépannage

### Le nom "Hotel" s'affiche au lieu du nom de mon hôtel
→ Vérifiez que `VITE_HOTEL_NAME` est défini dans votre `.env`  
→ Redémarrez le serveur de développement

### Erreur "Hotel ID not configured"
→ Vérifiez que `VITE_HOTEL_ID` est défini dans votre `.env`  
→ Vérifiez que la valeur n'est pas vide

### Les variables ne sont pas prises en compte
→ Redémarrez complètement le serveur (`Ctrl+C` puis `npm run dev`)  
→ Vérifiez que le fichier `.env` est à la racine du projet  
→ Vérifiez qu'il n'y a pas d'espaces autour du `=`

### En production sur Vercel, les variables ne fonctionnent pas
→ Vérifiez que les variables sont bien définies dans Vercel  
→ Redéployez l'application après avoir ajouté les variables  
→ Vérifiez les logs de build pour voir si les variables sont chargées

## 📚 Documentation Supplémentaire

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

