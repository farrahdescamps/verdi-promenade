# 📚 Gestion de l'Historique des Conversations

Ce document explique comment utiliser la nouvelle fonctionnalité de chargement de l'historique des conversations dans `PageActivityChat`.

## 🎯 **Fonctionnalité**

Permet aux utilisateurs de retrouver leurs conversations précédentes quand ils reviennent sur une activité, au lieu de recommencer à zéro.

## 🚀 **Utilisation**

### **Option 1 : Utilisation Simple (Recommandée)**

```tsx
import { PageActivityChat } from './screens/PageActivityChat/PageActivityChat';

const ActivityPage = () => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const activityId = 'religious_building_f1049efd-f3bf-453c-bdf1-0caa330769fc';

  // Charger l'ID de conversation depuis localStorage
  useEffect(() => {
    const savedId = localStorage.getItem(`conv_${activityId}`);
    setConversationId(savedId || undefined);
  }, [activityId]);

  // Sauvegarder l'ID quand une conversation est créée
  const handleConversationUpdate = (id: string, isNew: boolean) => {
    setConversationId(id);
    localStorage.setItem(`conv_${activityId}`, id);
  };

  return (
    <PageActivityChat 
      conversationId={conversationId}
    />
  );
};
```

### **Option 2 : Avec Store Global (Redux/Zustand)**

```tsx
const ActivityPage = () => {
  const { conversations, setConversation } = useConversationStore();
  const conversationId = conversations[activityId];

  return (
    <PageActivityChat 
      conversationId={conversationId}
    />
  );
};
```

## 📱 **Flux Utilisateur**

### **Scénario 1 : Première Visite**
1. **Utilisateur arrive** → Pas de `conversationId`
2. **Pose une question** → Nouvelle conversation créée
3. **ID généré** → `conv_1758270649146_xaebhfjqk`
4. **Sauvegarder l'ID** → `localStorage.setItem('conv_activity_123', 'conv_1758270649146_xaebhfjqk')`

### **Scénario 2 : Retour sur l'Activité**
1. **Utilisateur revient** → Récupère l'ID : `localStorage.getItem('conv_activity_123')`
2. **Passe l'ID au composant** → `<PageActivityChat conversationId="conv_1758270649146_xaebhfjqk" />`
3. **Historique chargé automatiquement** → Tous les messages précédents s'affichent
4. **Utilisateur continue** → Nouveaux messages ajoutés à l'historique

## 🔧 **API Backend**

### **Endpoint utilisé**
```
GET /api/conversations/{conversationId}
```

### **Réponse attendue**
```json
{
  "conversation_id": "conv_1758270649146_xaebhfjqk",
  "session_id": "session_1758196060230_4vmwo7lwy",
  "blueprint_id": "activity_chat",
  "status": "active",
  "messages": [
    {
      "id": "msg_1",
      "text": "Posez-moi toutes vos questions sur Église Saint-Joseph",
      "type": "bot",
      "timestamp": "2025-01-21T10:30:00Z"
    },
    {
      "id": "msg_2", 
      "text": "Quelle est l'histoire de cette église ?",
      "type": "user",
      "timestamp": "2025-01-21T10:31:00Z"
    },
    {
      "id": "msg_3",
      "text": "L'église Saint-Joseph du Havre est...",
      "type": "bot", 
      "timestamp": "2025-01-21T10:31:30Z"
    }
  ]
}
```

## 🎨 **Interface Utilisateur**

### **Indicateur de chargement**
- **Affichage** : "Chargement de l'historique..." avec animation de points
- **Durée** : Le temps de chargement de l'API
- **Style** : Identique à l'indicateur de traitement des questions

### **Messages avec historique**
- **Format** : Identique aux messages normaux
- **Ordre** : Chronologique (plus ancien → plus récent)
- **Style** : Bulles utilisateur (bleu) et bot (gris)

## ⚡ **Fonctionnalités Automatiques**

### **✅ Ce qui fonctionne automatiquement**
- **Chargement de l'historique** : Si `conversationId` fourni
- **Création de nouvelles conversations** : Si pas de `conversationId`
- **Streaming en temps réel** : Messages qui apparaissent progressivement
- **Gestion d'erreurs** : Si conversation inexistante → affiche message de bienvenue

### **🔧 Ce que vous devez implémenter**
- **Sauvegarde de l'ID** : `localStorage`, store, ou base de données
- **Récupération de l'ID** : Au chargement de la page d'activité
- **Passage de l'ID** : Au composant `PageActivityChat`

## 🛠️ **Gestion d'Erreurs**

### **Conversation inexistante (404)**
- **Comportement** : Affiche le message de bienvenue
- **Log** : `❌ Failed to load conversation history: HTTP error! status: 404`
- **Utilisateur** : Peut continuer normalement

### **Erreur réseau**
- **Comportement** : Affiche le message de bienvenue
- **Log** : `❌ Failed to load conversation history: Network error`
- **Utilisateur** : Peut continuer normalement

### **Conversation vide**
- **Comportement** : Affiche le message de bienvenue
- **Log** : `✅ Conversation history loaded: 0 messages`
- **Utilisateur** : Peut commencer une nouvelle conversation

## 📊 **Logs Console**

### **Logs conservés (importants)**
```javascript
📚 Loading conversation history for: conv_1758270649146_xaebhfjqk
✅ Conversation history loaded: 3 messages
```

### **Logs supprimés (streaming)**
```javascript
// ❌ Plus affichés
🚀 Analysis started: ...
📊 Progress: 30% - ...
📝 Chunk received: ...
✅ Analysis completed: ...
```

## 🎯 **Exemple Complet**

Voir le fichier `src/examples/ActivityChatExample.tsx` pour des exemples complets d'utilisation avec :
- localStorage
- Store global
- React Router
- Gestion d'état

## 🎉 **Résultat Final**

**Avant :** Chaque retour sur une activité = conversation vide
**Après :** Chaque retour = historique complet des échanges précédents

Vos utilisateurs peuvent maintenant :
- ✅ Continuer leurs conversations
- ✅ Voir l'historique complet
- ✅ Ne pas perdre le contexte
- ✅ Avoir une expérience fluide
