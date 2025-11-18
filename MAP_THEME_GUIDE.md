# 🗺️ Guide des Thèmes de Carte

## Vue d'ensemble

Votre application dispose maintenant de **deux thèmes de carte** configurables :
- 🌞 **Clair (Light)** - Fond blanc, design épuré
- 🌙 **Sombre (Dark)** - Fond noir, style moderne

## 🎨 Styles disponibles

### Mode Clair (`light`)
```
URL: https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```
- **Carte** : Fond blanc/beige
- **Texte** : Couleur primaire de l'hôtel (primaryColor)
- **Logo** : Couleur originale (pas de filtre)
- **Dégradé** : Blanc transparent → Blanc opaque
- Parfait pour : applications professionnelles, lecture en journée
- Style : Clean, minimal, épuré

### Mode Sombre (`dark`)
```
URL: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```
- **Carte** : Fond noir/gris foncé
- **Texte** : Blanc
- **Logo** : Blanc (filtre invert)
- **Dégradé** : Transparent → Couleur primaire
- Parfait pour : applications modernes, économie batterie OLED, lecture nocturne
- Style : Premium, luxueux, moderne

## ⚙️ Configuration

### 1. Variable d'environnement (recommandé)

La méthode la plus simple est d'utiliser la variable d'environnement `VITE_MAP_THEME` :

**Dans `.env` :**
```bash
# Carte sombre (par défaut)
VITE_MAP_THEME=dark

# Ou carte claire
VITE_MAP_THEME=light
```

**Après modification :**
```bash
# Redémarrer le serveur de développement
npm run dev
```

### 2. Par composant (avancé)

Si vous voulez des thèmes différents sur différentes pages :

```typescript
import { InteractiveMap } from "../../components/Map";

// Carte claire
<InteractiveMap 
  pois={pois}
  mapTheme="light"
/>

// Carte sombre
<InteractiveMap 
  pois={pois}
  mapTheme="dark"
/>
```

## 📍 Où les cartes sont utilisées

### 1. PageMonAventure
**Fichier :** `src/screens/PageMonAventure/PageMonAventure.tsx`

Deux instances de carte :
- Vue "Inspiration" (ligne ~410)
- Vue "Sélection de thème" (ligne ~502)

Les deux utilisent maintenant `mapTheme={MAP_THEME}`

### 2. PageChoixIntro
**Fichier :** `src/screens/PageChoixIntro/PageChoixIntro.tsx`

Une carte en arrière-plan (ligne ~506) :
```typescript
<InteractiveMap mapTheme={MAP_THEME} />
```

## 🎯 Cas d'usage

### Hôtel de luxe / Premium
```bash
VITE_MAP_THEME=dark
```
✅ Style premium, moderne, élégant

### Hôtel familial / Resort
```bash
VITE_MAP_THEME=light
```
✅ Style accessible, chaleureux, lumineux

### Application multi-tenant
Utilisez la prop `mapTheme` directement dans les composants pour personnaliser par hôtel.

## 🔧 Personnalisation avancée

### Ajouter d'autres styles de carte

**Dans `InteractiveMap.tsx` :**
```typescript
// Ajouter d'autres options
export type MapThemeType = 'light' | 'dark' | 'satellite' | 'terrain';

// Dans le TileLayer
const MAP_THEMES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
};

<TileLayer url={MAP_THEMES[mapTheme]} />
```

### Autres fournisseurs de cartes

#### OpenStreetMap (gratuit)
```typescript
light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

#### Mapbox (nécessite API key)
```typescript
light: "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=YOUR_TOKEN"
dark: "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=YOUR_TOKEN"
```

#### Stadia Maps (nécessite API key)
```typescript
light: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
```

## 🚀 Déploiement

### Sur Vercel

Ajoutez la variable d'environnement :

1. Settings → Environment Variables
2. Ajoutez :
   ```
   Name: VITE_MAP_THEME
   Value: dark  (ou light)
   ```
3. Appliquer à : ✅ Production, ✅ Preview, ✅ Development
4. Redéployer

## 📊 Comparaison

| Critère | Light | Dark |
|---------|-------|------|
| **Lisibilité jour** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Lisibilité nuit** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Économie batterie OLED** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Style premium** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Accessibilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Contraste POIs** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎨 Recommandations par type d'hôtel

### Hôtels de luxe
```bash
VITE_MAP_THEME=dark
```
Le fond sombre met en valeur les pins colorés et donne un aspect premium.

### Hôtels boutique
```bash
VITE_MAP_THEME=dark
```
Style moderne et sophistiqué.

### Resorts familiaux
```bash
VITE_MAP_THEME=light
```
Plus accessible et chaleureux.

### Business hotels
```bash
VITE_MAP_THEME=light
```
Professionnel et sobre.

### Hôtels design/contemporains
```bash
VITE_MAP_THEME=dark
```
Moderne et tendance.

## 🔍 Aperçu des changements

### Fichiers modifiés

1. **`src/config.ts`**
   - Ajout de `MAP_THEME` exporté

2. **`src/components/Map/InteractiveMap.tsx`**
   - Ajout de la prop `mapTheme`
   - Logique de switch entre light/dark

3. **`src/screens/PageMonAventure/PageMonAventure.tsx`**
   - Import de `MAP_THEME`
   - Application à 2 instances de carte
   - **Adaptation automatique des couleurs** :
     * `mapTextColor` : primaryColor (light) / blanc (dark)
     * `mapLogoFilter` : aucun (light) / invert (dark)
     * `mapGradient` : blanc (light) / primaryColor (dark)

4. **`src/screens/PageChoixIntro/PageChoixIntro.tsx`**
   - Import de `MAP_THEME`
   - Application à 1 instance de carte

5. **`.env` et `.env.example`**
   - Ajout de `VITE_MAP_THEME`

## 💡 Tips

### Tester les deux modes localement
```bash
# Dans .env, changez la valeur
VITE_MAP_THEME=light  # puis redémarrer

VITE_MAP_THEME=dark   # puis redémarrer
```

### Mode automatique jour/nuit (à implémenter)
```typescript
const mapTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
  ? 'dark' 
  : 'light';

<InteractiveMap mapTheme={mapTheme} />
```

## 🐛 Dépannage

### La carte ne change pas de thème
1. Vérifiez que la variable est dans `.env`
2. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)
3. Videz le cache du navigateur (Cmd+Shift+R / Ctrl+Shift+R)

### La carte ne s'affiche pas
1. Vérifiez la console (F12)
2. Problème réseau ? Vérifiez la connexion
3. Vérifiez que Leaflet CSS est chargé

### Les pins ne sont pas visibles
Sur fond clair, les pins rouges/bordeaux ressortent mieux.
Sur fond sombre, tous les pins sont bien visibles.

---

**Dernière mise à jour :** 18 novembre 2025  
**Auteur :** Configuration par AI Assistant

