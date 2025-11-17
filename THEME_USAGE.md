# 🎨 Utilisation du système de thème

Le système de thème permet d'utiliser les couleurs dynamiques de l'hôtel récupérées depuis l'API Concierge.

## ✅ Configuration automatique

Les couleurs sont **automatiquement chargées** au démarrage de l'application via `ThemeContext`.

## 📋 Couleurs disponibles

- **Primaire** : `couleur_primaire` de l'API
- **Secondaire** : `couleur_secondaire` de l'API
- **Fallback** : `#0099cc` (bleu) si l'API ne retourne pas de couleur

---

## 🔧 Utilisation dans les composants

### Méthode 1 : Classes Tailwind (RECOMMANDÉ)

```tsx
// Background
<div className="bg-theme-primary">...</div>

// Text color
<div className="text-theme-primary">...</div>

// Border
<div className="border-theme-primary">...</div>

// Hover
<button className="bg-theme-primary hover:bg-theme-secondary">
  Cliquez-moi
</button>
```

### Méthode 2 : Hook `useThemeColor()`

```tsx
import { useThemeColor } from '../hooks/useThemeColor';

function MyComponent() {
  const { primary, secondary } = useThemeColor();
  
  return (
    <div style={{ backgroundColor: primary }}>
      <p style={{ color: secondary }}>Hello</p>
    </div>
  );
}
```

### Méthode 3 : Hook `useTheme()` (accès complet)

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { 
    primaryColor, 
    secondaryColor, 
    hotelName, 
    logoUrl,
    logoGroupUrl,
    isLoading 
  } = useTheme();
  
  if (isLoading) return <div>Chargement...</div>;
  
  return (
    <div style={{ backgroundColor: primaryColor }}>
      <h1>{hotelName}</h1>
      {logoUrl && <img src={logoUrl} alt={hotelName} />}
    </div>
  );
}
```

---

## 🔄 Remplacer les couleurs en dur

### ❌ AVANT (bleu en dur)
```tsx
<button className="bg-[#0099cc] hover:bg-[#0088b8]">
  Cliquez
</button>
```

### ✅ APRÈS (couleur du thème)
```tsx
<button className="bg-theme-primary hover:bg-theme-secondary">
  Cliquez
</button>
```

---

## 📝 Liste des classes Tailwind disponibles

| Classe | Description |
|--------|-------------|
| `bg-theme-primary` | Background couleur primaire |
| `bg-theme-secondary` | Background couleur secondaire |
| `text-theme-primary` | Texte couleur primaire |
| `text-theme-secondary` | Texte couleur secondaire |
| `border-theme-primary` | Bordure couleur primaire |
| `border-theme-secondary` | Bordure couleur secondaire |

---

## 🎯 Variables CSS (avancé)

Si tu veux utiliser les couleurs directement en CSS :

```css
.my-element {
  background-color: var(--color-primary);
  border-color: var(--color-secondary);
}
```

---

## ⚙️ Configuration

Les couleurs sont définies dans :
- **API** : `GET /hotel-videos?hotel_id=xxx` (champs `couleur_primaire` et `couleur_secondaire`)
- **Context** : `src/contexts/ThemeContext.tsx`
- **CSS** : `tailwind.css` (variables CSS)
- **Tailwind** : `tailwind.config.cjs` (classes utilitaires)


