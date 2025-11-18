# 🚀 Déploiement sur Vercel

## 📦 Framework utilisé : **Vite + React + TypeScript**

Votre projet utilise :
- **Vite 6.0.4** - Build tool moderne et rapide
- **React 18.2.0** - Framework UI
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Navigation

## 🎯 Déploiement sur Vercel

### Méthode 1 : Via GitHub (Recommandée) 🌟

#### 1. Pushez votre code sur GitHub

```bash
# Si vous n'avez pas encore de remote
git remote add origin https://github.com/VOTRE-USERNAME/verdi-promenade.git

# Push vers GitHub
git push -u origin main
```

#### 2. Connectez-vous à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Add New Project"**

#### 3. Importez le repository

1. Sélectionnez le repo `verdi-promenade`
2. Vercel détectera automatiquement que c'est un projet **Vite**

#### 4. Configurez les variables d'environnement

Dans **Environment Variables**, ajoutez :

```bash
# OBLIGATOIRES
VITE_HOTEL_ID=691ad7e45a5d7da8e46f2d3d
VITE_HOTEL_NAME=Verdi Gzira Promenade
VITE_API_KEY=28bc2e884a7701f733c351a334a68bf1e8cea914dbf19cbae01a852f6ab130f9

# URLs des APIs (en production)
VITE_API_URL=/api
VITE_CONCIERGE_API_URL=/concierge-api
```

⚠️ **Important** : Appliquez ces variables à tous les environnements (Production, Preview, Development)

#### 5. Configuration du Build

Vercel détecte automatiquement :
- **Framework Preset:** Vite
- **Build Command:** `vite build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

✅ **Ne changez rien**, les valeurs par défaut sont correctes !

#### 6. Déployez

Cliquez sur **"Deploy"** et attendez 2-3 minutes.

---

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer (depuis la racine du projet)
vercel

# Pour la production
vercel --prod
```

---

## 🔧 Configuration Vercel déjà présente

Votre projet a déjà un fichier `vercel.json` configuré avec les proxies d'API :

```json
{
  "rewrites": [
    {
      "source": "/concierge-api/:path*",
      "destination": "https://concierge-production-859a.up.railway.app/api/:path*"
    },
    {
      "source": "/api/:path*",
      "destination": "https://back-genie7-production.up.railway.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ Cette configuration est **parfaite** et gère :
- Les proxies API (pas de CORS)
- Le routing côté client (SPA)

---

## 📋 Checklist avant déploiement

### 1. Vérifier le build local

```bash
# Construire le projet
npm run build

# Tester le build (optionnel)
npx serve dist
```

Si le build réussit → ✅ prêt pour Vercel !

### 2. Vérifier les variables d'environnement

Assurez-vous que `.env` est dans `.gitignore` ✅ (déjà fait)

### 3. Vérifier les scripts package.json

```json
"scripts": {
  "dev": "vite",
  "build": "vite build"  ✅
}
```

---

## 🌐 Après le déploiement

### 1. Votre URL Vercel

Vous aurez une URL comme :
```
https://verdi-promenade.vercel.app
```

### 2. Domaine personnalisé (optionnel)

Dans Vercel Settings > Domains, vous pouvez ajouter :
```
verdi.votredomaine.com
```

### 3. Redéploiements automatiques

✅ Chaque `git push` sur `main` redéploie automatiquement !

---

## 🔍 Variables d'environnement dans Vercel

### Comment les ajouter :

1. Projet Vercel → **Settings** → **Environment Variables**
2. Cliquez sur **Add New**
3. Pour chaque variable :
   - **Name:** `VITE_HOTEL_ID`
   - **Value:** `691ad7e45a5d7da8e46f2d3d`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Liste complète :

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `VITE_HOTEL_ID` | `691ad7e45a5d7da8e46f2d3d` | ✅ OUI |
| `VITE_HOTEL_NAME` | `Verdi Gzira Promenade` | ✅ OUI |
| `VITE_API_KEY` | `28bc2e884a...` | ✅ OUI |
| `VITE_API_URL` | `/api` | ✅ OUI |
| `VITE_CONCIERGE_API_URL` | `/concierge-api` | ✅ OUI |
| `VITE_AUTH_BEARER` | (optionnel) | ❌ NON |

---

## 🐛 Dépannage

### Build échoue sur Vercel

**Problème :** Erreurs de TypeScript ou ESLint

**Solution :**
```bash
# Tester localement
npm run build

# Si erreurs, corriger puis recommit
git add .
git commit -m "fix: corrections build"
git push
```

### Les variables d'environnement ne fonctionnent pas

**Problème :** Variables non chargées

**Solution :**
1. Vérifiez qu'elles commencent par `VITE_`
2. Redéployez après les avoir ajoutées
3. Settings → **Redeploy**

### Erreurs 404 sur les routes

**Problème :** React Router ne fonctionne pas

**Solution :** Le `vercel.json` est déjà configuré avec le fallback vers `index.html` ✅

### Erreurs API / CORS

**Problème :** Les appels API échouent

**Solution :** Les proxies dans `vercel.json` gèrent déjà ça ✅

---

## 📊 Monitoring

### Analytics

Vercel offre gratuitement :
- **Analytics** - Performance et métriques
- **Speed Insights** - Temps de chargement
- **Logs** - Debugging

Activez-les dans Settings → **Analytics**

---

## 💰 Pricing

Votre projet est compatible avec le plan **Hobby (Gratuit)** :
- ✅ Déploiements illimités
- ✅ Bande passante : 100GB/mois
- ✅ Build : 100h/mois
- ✅ Domaines personnalisés

---

## 🎉 Résumé des commandes

```bash
# 1. Push vers GitHub
git add .
git commit -m "ready for deploy"
git push origin main

# 2. Déployer sur Vercel (via GitHub)
# → Se fait automatiquement après connexion sur vercel.com

# 3. Ou via CLI
npm install -g vercel
vercel login
vercel --prod
```

---

## 📚 Documentation utile

- [Vite sur Vercel](https://vercel.com/docs/frameworks/vite)
- [Variables d'environnement](https://vercel.com/docs/concepts/projects/environment-variables)
- [Configuration vercel.json](https://vercel.com/docs/project-configuration)

---

**Prêt à déployer ? 🚀**

Suivez les étapes et votre application sera en ligne en moins de 5 minutes !

