import React, { useState, useEffect } from 'react';
import { ActivityChat } from '../components/ActivityChat';

/**
 * Exemple d'utilisation du composant ActivityChat avec validation du titre
 */
export const ActivityChatUsage: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const sessionId = 'session_1758271008713_z1d2kpni1'; // Exemple de session
  const activityName = 'Avec les enfants'; // Nom correct de l'activité
  const placeInstanceIds = [
    'religious_building_f1049efd-f3bf-453c-bdf1-0caa330769fc',
    'performance_venue_644aa346-ac4d-4cd6-8a77-31bfabf08f1f'
  ];

  // Charger l'ID de conversation depuis localStorage
  useEffect(() => {
    const savedConversationId = localStorage.getItem(`conv_${activityName}`);
    if (savedConversationId) {
      setConversationId(savedConversationId);

    } else {

    }
  }, [activityName]);

  // Callback appelé quand une conversation est créée ou mise à jour
  const handleConversationUpdate = (id: string, isNew: boolean) => {

    // Sauvegarder l'ID pour la prochaine visite
    localStorage.setItem(`conv_${activityName}`, id);
    setConversationId(id);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold">Chat Activité</h1>
        <p className="text-sm text-gray-600">
          Activité: {activityName}
        </p>
        <p className="text-sm text-gray-500">
          {conversationId ? `Conversation: ${conversationId}` : 'Nouvelle conversation'}
        </p>
      </div>
      
      <div className="flex-1">
        <ActivityChat 
          placeInstanceIds={placeInstanceIds}
          language="fr"
          userLanguage="français"
          sessionId={sessionId}
          activityName={activityName} // ← Nom correct avec validation
          conversationId={conversationId}
          onConversationUpdate={handleConversationUpdate}
        />
      </div>
    </div>
  );
};

/**
 * Exemple d'intégration dans une page d'activité existante
 */
export const ActivityPageWithChat: React.FC<{ activityId: string; activityName: string }> = ({ 
  activityId, 
  activityName 
}) => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const sessionId = 'session_1758271008713_z1d2kpni1'; // Récupérer depuis le contexte de session
  
  // Simuler des POI pour cette activité
  const placeInstanceIds = [
    `${activityId}_poi_1`,
    `${activityId}_poi_2`,
    `${activityId}_poi_3`
  ];

  useEffect(() => {
    // Récupérer l'ID de conversation existante
    const savedId = localStorage.getItem(`conv_${activityName}`);
    setConversationId(savedId || undefined);
  }, [activityName]);

  const handleConversationUpdate = (id: string, isNew: boolean) => {
    setConversationId(id);
    // Sauvegarder pour la prochaine visite
    localStorage.setItem(`conv_${activityName}`, id);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header de l'activité */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-2xl font-bold">{activityName}</h1>
        <p className="text-sm text-gray-600">
          ID: {activityId}
        </p>
      </div>
      
      {/* Contenu principal de l'activité */}
      <div className="flex-1 p-4">
        <p>Contenu de l'activité...</p>
      </div>
      
      {/* Chat intégré */}
      <div className="h-96 border-t">
        <ActivityChat 
          placeInstanceIds={placeInstanceIds}
          language="fr"
          userLanguage="français"
          sessionId={sessionId}
          activityName={activityName} // ← Validation automatique du titre
          conversationId={conversationId}
          onConversationUpdate={handleConversationUpdate}
          className="h-full"
        />
      </div>
    </div>
  );
};

/**
 * Exemple d'utilisation avec gestion d'état global
 */
export const ActivityChatWithGlobalState: React.FC<{ 
  activityId: string; 
  activityName: string;
  sessionId: string;
}> = ({ activityId, activityName, sessionId }) => {
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
  const saveConversation = (activityName: string, conversationId: string) => {
    const newConversations = { ...conversations, [activityName]: conversationId };
    setConversations(newConversations);
    localStorage.setItem('conversations', JSON.stringify(newConversations));
  };

  const conversationId = conversations[activityName];

  const handleConversationUpdate = (id: string, isNew: boolean) => {
    saveConversation(activityName, id);
  };

  return (
    <div className="h-96 border rounded-lg">
      <ActivityChat 
        placeInstanceIds={[`${activityId}_poi`]}
        language="fr"
        userLanguage="français"
        sessionId={sessionId}
        activityName={activityName} // ← Validation du titre intégrée
        conversationId={conversationId}
        onConversationUpdate={handleConversationUpdate}
        className="h-full"
      />
    </div>
  );
};
