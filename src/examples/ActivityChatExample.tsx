import React, { useState, useEffect } from 'react';
import { PageActivityChat } from '../screens/PageActivityChat/PageActivityChat';

/**
 * Exemple d'utilisation du composant PageActivityChat avec gestion de l'historique
 */
export const ActivityChatExample: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const activityId = 'religious_building_f1049efd-f3bf-453c-bdf1-0caa330769fc';
  const activityName = 'Église Saint-Joseph';

  // Charger l'ID de conversation depuis localStorage au montage
  useEffect(() => {
    const savedConversationId = localStorage.getItem(`conv_${activityId}`);
    if (savedConversationId) {
      setConversationId(savedConversationId);

    } else {

    }
  }, [activityId]);

  // Callback appelé quand une conversation est créée ou mise à jour
  const handleConversationUpdate = (id: string, isNew: boolean) => {

    // Sauvegarder l'ID pour la prochaine visite
    localStorage.setItem(`conv_${activityId}`, id);
    setConversationId(id);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold">{activityName}</h1>
        <p className="text-sm text-gray-600">
          {conversationId ? `Conversation: ${conversationId}` : 'Nouvelle conversation'}
        </p>
      </div>
      
      <div className="flex-1">
        <PageActivityChat 
          conversationId={conversationId}
          // Note: Les autres props sont gérées automatiquement par le composant
          // via useParams, useLocation, etc.
        />
      </div>
    </div>
  );
};

/**
 * Exemple d'utilisation avec gestion d'état global (Redux/Zustand)
 */
export const ActivityChatWithStore: React.FC<{ activityId: string; activityName: string }> = ({ 
  activityId, 
  activityName 
}) => {
  // Simuler un store global
  const [conversations, setConversations] = useState<Record<string, string>>({});

  // Charger les conversations depuis le store
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Sauvegarder dans le store
  const saveConversation = (activityId: string, conversationId: string) => {
    const newConversations = { ...conversations, [activityId]: conversationId };
    setConversations(newConversations);
    localStorage.setItem('conversations', JSON.stringify(newConversations));
  };

  const conversationId = conversations[activityId];

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold">{activityName}</h1>
        <p className="text-sm text-gray-600">
          {conversationId ? `Conversation: ${conversationId}` : 'Nouvelle conversation'}
        </p>
      </div>
      
      <div className="flex-1">
        <PageActivityChat 
          conversationId={conversationId}
        />
      </div>
    </div>
  );
};

/**
 * Exemple d'utilisation dans une route React Router
 */
export const ActivityPage: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  // Simuler l'extraction de l'activityId depuis l'URL
  const activityId = 'religious_building_f1049efd-f3bf-453c-bdf1-0caa330769fc';
  const activityName = 'Église Saint-Joseph';

  useEffect(() => {
    // Récupérer l'ID de conversation existante
    const savedId = localStorage.getItem(`conv_${activityId}`);
    setConversationId(savedId || undefined);
  }, [activityId]);

  const handleConversationUpdate = (id: string, isNew: boolean) => {
    setConversationId(id);
    // Sauvegarder pour la prochaine visite
    localStorage.setItem(`conv_${activityId}`, id);
  };

  return (
    <div>
      <PageActivityChat 
        conversationId={conversationId}
      />
    </div>
  );
};
